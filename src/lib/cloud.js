// Cloud sync engine: mirrors the zustand store to Supabase (profiles + records)
// and applies realtime changes back. Pages/components never talk to Supabase directly.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_CONFIGURED } from './cloud-config.js'

export const supabase = CLOUD_CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { eventsPerSecond: 50 } } }) : null

// Local-mode escape hatch: visitors can explore the sandbox even when cloud is on
export const localModeForced = () => { try { return localStorage.getItem('ba-local-mode') === '1' } catch { return false } }
export const setLocalModeForced = (v) => { try { v ? localStorage.setItem('ba-local-mode', '1') : localStorage.removeItem('ba-local-mode') } catch { /* ignore */ } }
export const cloudActive = () => CLOUD_CONFIGURED && !localModeForced()

// Collections synced as plain arrays of {id,...}
export const ARRAY_COLLECTIONS = ['enrollments', 'sessions', 'groups', 'recordings', 'feedback', 'homework', 'lessons', 'conversations', 'notifications', 'trials', 'rescheduleRequests', 'approvalRequests', 'certificates', 'payments', 'reviews', 'proposals', 'leads', 'applications', 'customPlanRequests', 'withdrawals']
// Collections synced as {userId: value} maps → one record per key
export const MAP_COLLECTIONS = ['availability', 'carts', 'wishlists', 'payoutMethods']
// Child accounts (users[] entries without an auth login) sync as records too
export const USERS_COLLECTION = 'users'

const uidLike = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))

// Who may read/write each record (auth uids + sentinels). Kept deliberately broad for a demo.
export function participantsFor(collection, item, usersById) {
  const out = new Set()
  const add = (id) => { if (!id) return; const u = usersById[id]; if (uidLike(id)) out.add(id); if (u?.parentId && uidLike(u.parentId)) out.add(u.parentId); if (u?.role === 'teacher' && u.teacherId) out.add(`teacher:${u.teacherId}`) }
  const addTeacher = (tid) => tid && out.add(`teacher:${tid}`)
  switch (collection) {
    case 'users': out.add('auth'); add(item.parentId); break
    case 'enrollments': case 'homework': case 'trials': case 'rescheduleRequests': case 'approvalRequests': case 'certificates': case 'feedback':
      addTeacher(item.teacherId); add(item.studentId); add(item.parentId); add(item.requesterId); break
    case 'sessions': case 'recordings': addTeacher(item.teacherId); (item.studentIds || []).forEach(add); break
    case 'groups': case 'lessons': case 'proposals': addTeacher(item.teacherId); out.add('public'); break
    case 'conversations': (item.participantIds || []).forEach(add); break
    case 'notifications': add(item.userId); break
    case 'payments': add(item.parentId); break
    case 'reviews': out.add('public'); break
    case 'withdrawals': add(item.userId); break
    case 'availability': case 'carts': case 'wishlists': case 'payoutMethods': add(item.id); break
    default: break
  }
  return [...out]
}

const rowFor = (collection, item, usersById) => ({ id: `${collection}:${item.id}`, collection, data: item, participants: participantsFor(collection, item, usersById) })

// ---------------- diff-based write-through ----------------
let shadow = {}           // collection -> Map(id -> JSON string)
let applyingRemote = false
let queue = new Map()     // rowId -> {op:'upsert'|'delete', row?}
let flushTimer = null

const snapshotOf = (state) => {
  const snap = {}
  for (const c of ARRAY_COLLECTIONS) snap[c] = new Map((state[c] || []).map((x) => [String(x.id), JSON.stringify(x)]))
  snap[USERS_COLLECTION] = new Map((state.users || []).filter((u) => !u._profile).map((x) => [String(x.id), JSON.stringify(x)]))
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
  const usersById = Object.fromEntries((state.users || []).map((u) => [u.id, u]))
  const next = snapshotOf(state)
  for (const [collection, map] of Object.entries(next)) {
    const prev = shadow[collection] || new Map()
    for (const [id, json] of map) if (prev.get(id) !== json) {
      const item = JSON.parse(json)
      const key = `${collection}:${id}`
      // Plain INSERT for new rows (anon visitors may insert leads/trials but have no UPDATE rights);
      // keep a queued 'insert' as insert even if edited again before the flush.
      const op = queue.get(key)?.op === 'insert' || !prev.has(id) ? 'insert' : 'update'
      queue.set(key, { op, row: rowFor(collection, item, usersById) })
    }
    for (const id of prev.keys()) if (!map.has(id)) queue.set(`${collection}:${id}`, { op: 'delete', id: `${collection}:${id}` })
  }
  shadow = next
  if (queue.size) scheduleFlush(client)
}

// ---------------- load & realtime ----------------
const profileToUser = (p) => ({ id: p.id, role: p.role, email: p.email, name: p.name, firstName: (p.name || '').split(' ')[0] || '', lastName: (p.name || '').split(' ').slice(1).join(' '), _profile: true, passwordHash: 'cloud', createdAt: p.created_at, status: 'active', children: [], ...(p.data || {}) })

export function buildStateFromRows(profiles, records) {
  const state = { users: [], ...Object.fromEntries(ARRAY_COLLECTIONS.map((c) => [c, []])), ...Object.fromEntries(MAP_COLLECTIONS.map((c) => [c, {}])) }
  state.users = (profiles || []).map(profileToUser)
  for (const r of records || []) {
    if (r.collection === USERS_COLLECTION) state.users.push(r.data)
    else if (MAP_COLLECTIONS.includes(r.collection)) state[r.collection][r.data.id] = r.data.value
    else if (ARRAY_COLLECTIONS.includes(r.collection)) state[r.collection].push(r.data)
  }
  // recompute children arrays on parents
  const kids = state.users.filter((u) => u.parentId)
  for (const u of state.users) if (u._profile) u.children = kids.filter((k) => k.parentId === u.id).map((k) => k.id)
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
        const users = s.users.some((x) => x.id === u.id) ? s.users.map((x) => (x.id === u.id ? { ...x, ...u, children: x.children } : x)) : [...s.users, u]
        return { users }
      }
      const r = payload.eventType === 'DELETE' ? payload.old : payload.new
      if (!r?.collection) return {}
      const { collection } = r
      if (collection === USERS_COLLECTION) {
        const item = payload.eventType === 'DELETE' ? null : r.data
        let users = s.users.filter((u) => u.id !== (item?.id ?? String(r.id).slice(collection.length + 1)))
        if (item) users = [...users, item]
        for (const u of users) if (u._profile) u.children = users.filter((k) => k.parentId === u.id).map((k) => k.id)
        return { users }
      }
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
