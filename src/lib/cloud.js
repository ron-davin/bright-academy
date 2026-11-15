// Cloud sync engine: mirrors the zustand store to Supabase (profiles + records)
// and applies realtime changes back. Pages/components never talk to Supabase directly.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_CONFIGURED } from './cloud-config.js'

export const supabase = CLOUD_CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { eventsPerSecond: 50 } } }) : null

export const cloudActive = () => CLOUD_CONFIGURED

export const ARRAY_COLLECTIONS = ['classes', 'sessions', 'leads', 'subjects']
export const MAP_COLLECTIONS = ['availability']

// Who may read/write each record. Admins see everything via the RLS admin clause.
export function participantsFor(collection, item) {
  switch (collection) {
    case 'classes': case 'sessions': return [item.teacherId, ...(item.studentIds || [])].filter(Boolean)
    case 'availability': return [item.id]
    case 'subjects': return ['public'] // everyone (incl. the homepage) reads; only admins write (RLS)
    default: return [] // leads: admin-only
  }
}

const rowFor = (collection, item) => ({ id: `${collection}:${item.id}`, collection, data: item, participants: participantsFor(collection, item) })

// ---------------- diff-based write-through ----------------
let shadow = {}           // collection -> Map(id -> JSON string)
let applyingRemote = false
let queue = new Map()     // rowId -> {op:'upsert'|'delete', row?}
let flushTimer = null

const snapshotOf = (state) => {
  const snap = {}
  for (const c of ARRAY_COLLECTIONS) snap[c] = new Map((state[c] || []).map((x) => [String(x.id), JSON.stringify(x)]))
  for (const c of MAP_COLLECTIONS) snap[c] = new Map(Object.entries(state[c] || {}).map(([k, v]) => [k, JSON.stringify({ id: k, value: v })]))
  return snap
}

function scheduleFlush(client) {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    flushTimer = null
    const jobs = [...queue.values()]; queue = new Map()
    const inserts = jobs.filter((j) => j.op === 'insert').map((j) => j.row)
    const updates = jobs.filter((j) => j.op === 'update').map((j) => j.row)
    const deletes = jobs.filter((j) => j.op === 'delete').map((j) => j.id)
    try {
      if (inserts.length) {
        const { error } = await client.from('records').insert(inserts)
        if (error) { const { error: e2 } = await client.from('records').upsert(inserts); if (e2) console.warn('[cloud] insert failed:', error.message, '/', e2.message) }
      }
      if (updates.length) { const { error } = await client.from('records').upsert(updates); if (error) console.warn('[cloud] update failed:', error.message) }
      if (deletes.length) { const { error } = await client.from('records').delete().in('id', deletes); if (error) console.warn('[cloud] delete failed:', error.message) }
    } catch (e) { console.warn('[cloud] sync error', e) }
  }, 250)
}

export function diffAndPush(state, client) {
  if (applyingRemote || !client) return
  const next = snapshotOf(state)
  for (const [collection, map] of Object.entries(next)) {
    const prev = shadow[collection] || new Map()
    for (const [id, json] of map) if (prev.get(id) !== json) {
      const item = JSON.parse(json)
      const key = `${collection}:${id}`
      // Plain INSERT for new rows (anon visitors may insert leads/trials but have no UPDATE rights);
      // keep a queued 'insert' as insert even if edited again before the flush.
      const op = queue.get(key)?.op === 'insert' || !prev.has(id) ? 'insert' : 'update'
      queue.set(key, { op, row: rowFor(collection, item) })
    }
    for (const id of prev.keys()) if (!map.has(id)) queue.set(`${collection}:${id}`, { op: 'delete', id: `${collection}:${id}` })
  }
  shadow = next
  if (queue.size) scheduleFlush(client)
}

// ---------------- load & realtime ----------------
export const profileToUser = (p) => ({ active: true, ...(p.data || {}), id: p.id, role: p.role, email: p.email, name: p.name || p.email, firstName: (p.name || '').split(' ')[0] || '', createdAt: p.created_at })

export function buildStateFromRows(profiles, records) {
  const state = { users: [], ...Object.fromEntries(ARRAY_COLLECTIONS.map((c) => [c, []])), ...Object.fromEntries(MAP_COLLECTIONS.map((c) => [c, {}])) }
  state.users = (profiles || []).map(profileToUser)
  for (const r of records || []) {
    if (MAP_COLLECTIONS.includes(r.collection)) state[r.collection][r.data.id] = r.data.value
    else if (ARRAY_COLLECTIONS.includes(r.collection)) state[r.collection].push(r.data)
  }
  for (const c of ARRAY_COLLECTIONS) state[c].sort((a, b) => String(b.createdAt || b.at || '').localeCompare(String(a.createdAt || a.at || '')))
  return state
}

export async function loadCloudState(client) {
  const [{ data: profiles, error: e1 }, { data: records, error: e2 }] = await Promise.all([
    client.from('profiles').select('*'),
    client.from('records').select('*').limit(5000),
  ])
  if (e1 || e2) throw new Error((e1 || e2).message)
  return buildStateFromRows(profiles, records)
}

export function applyRemoteChange(setState, payload) {
  applyingRemote = true
  try {
    setState((s) => {
      if (payload.table === 'profiles') {
        const u = payload.new ? profileToUser(payload.new) : null
        if (!u) return {}
        const users = s.users.some((x) => x.id === u.id) ? s.users.map((x) => (x.id === u.id ? u : x)) : [...s.users, u]
        return { users }
      }
      const r = payload.eventType === 'DELETE' ? payload.old : payload.new
      if (!r?.collection) return {}
      const { collection } = r
      if (MAP_COLLECTIONS.includes(collection)) {
        const map = { ...(s[collection] || {}) }
        if (payload.eventType === 'DELETE') delete map[String(r.id).slice(collection.length + 1)]
        else map[r.data.id] = r.data.value
        return { [collection]: map }
      }
      if (!ARRAY_COLLECTIONS.includes(collection)) return {}
      const arr = s[collection] || []
      if (payload.eventType === 'DELETE') return { [collection]: arr.filter((x) => `${collection}:${x.id}` !== r.id) }
      const item = r.data
      return { [collection]: arr.some((x) => x.id === item.id) ? arr.map((x) => (x.id === item.id ? item : x)) : [item, ...arr] }
    })
  } finally { applyingRemote = false }
}

export function resetShadow(state) { shadow = state ? snapshotOf(state) : {} }
export function subscribeRealtime(client, setState, onChange) {
  const ch = client.channel('ba-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, (payload) => { applyRemoteChange(setState, { ...payload, table: 'records' }); onChange?.() })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => { applyRemoteChange(setState, { ...payload, table: 'profiles' }); onChange?.() })
    .subscribe()
  return () => client.removeChannel(ch)
}
