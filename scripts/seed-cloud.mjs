#!/usr/bin/env node
// Seed the Supabase project with demo accounts + sample academy data.
// Usage:  SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-cloud.mjs
// (Service role key: Supabase → Project Settings → API keys. NEVER ship it to the client.)
import { createClient } from '@supabase/supabase-js'
import { buildSeed } from '../src/lib/seed.js'
import { participantsFor, ARRAY_COLLECTIONS, MAP_COLLECTIONS } from '../src/lib/cloud.js'

const URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY
if (!URL || !KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars first.'); process.exit(1) }
const db = createClient(URL, KEY, { auth: { persistSession: false } })

const DEMOS = [
  { email: 'teacher@bright.academy', name: 'Rayyannoor D.', role: 'teacher', localId: 'u_teacher', data: { teacherId: 't3', applicationStatus: 'approved', phone: '+62 812 0000 1111', avatar: 'teachers/rayyannoor-d.jpg' } },
  { email: 'parent@bright.academy', name: 'Fatima Noor', role: 'parent', localId: 'u_parent', data: { phone: '+1 555 010 7788' } },
  { email: 'student@bright.academy', name: 'Yusuf Noor', role: 'student', localId: 'u_s1', data: { age: 9, grade: 'Grade 4', points: 1240, streak: 12 } },
]

async function ensureUser({ email, name, role, data }) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 })
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) return existing.id
  const { data: created, error } = await db.auth.admin.createUser({ email, password: 'demo1234', email_confirm: true, user_metadata: { name, role, data } })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)
  return created.user.id
}

const run = async () => {
  console.log('→ Creating demo auth users…')
  const uidMap = {}
  for (const d of DEMOS) { uidMap[d.localId] = await ensureUser(d); console.log(`  ${d.email} → ${uidMap[d.localId]}`) }

  console.log('→ Building seed data…')
  let seed = buildSeed()
  // student profile links to parent by uid
  seed.users = seed.users.map((u) => (u.id === 'u_s1' ? { ...u, parentId: 'u_parent' } : u))
  let json = JSON.stringify(seed)
  for (const [localId, uid] of Object.entries(uidMap)) json = json.split(`"${localId}"`).join(`"${uid}"`)
  seed = JSON.parse(json)

  console.log('→ Upserting demo profiles…')
  for (const d of DEMOS) {
    const su = seed.users.find((u) => u.id === uidMap[d.localId]) || {}
    const { id, role: _r, email: _e, name: _n, firstName, lastName, passwordHash, createdAt, status, children, ...extra } = su
    const { error } = await db.from('profiles').upsert({ id: uidMap[d.localId], email: d.email, name: d.name, role: d.role, data: { ...extra, ...d.data } })
    if (error) throw new Error(`profile ${d.email}: ${error.message}`)
  }

  const { count: realForms } = await db.from('records').select('id', { count: 'exact', head: true }).in('collection', ['leads', 'applications', 'customPlanRequests'])
  if ((realForms || 0) > 0 && !process.env.FORCE) {
    console.error(`✖ Refusing to reseed: ${realForms} real form submission(s) (leads/applications) exist and would be DELETED.`)
    console.error('  Re-run with FORCE=1 to wipe everything anyway.')
    process.exit(1)
  }
  console.log('→ Clearing old records…')
  await db.from('records').delete().neq('id', '')

  const usersById = Object.fromEntries(seed.users.map((u) => [u.id, u]))
  const rows = []
  const realIds = new Set(Object.values(uidMap))
  for (const u of seed.users) if (!realIds.has(u.id)) rows.push({ id: `users:${u.id}`, collection: 'users', data: { ...u, passwordHash: 'child' }, owner: null, participants: participantsFor('users', u, usersById) })
  for (const c of ARRAY_COLLECTIONS) for (const item of seed[c] || []) rows.push({ id: `${c}:${item.id}`, collection: c, data: item, owner: null, participants: participantsFor(c, item, usersById) })
  for (const c of MAP_COLLECTIONS) for (const [k, v] of Object.entries(seed[c] || {})) rows.push({ id: `${c}:${k}`, collection: c, data: { id: k, value: v }, owner: null, participants: participantsFor(c, { id: k }, usersById) })

  console.log(`→ Inserting ${rows.length} records…`)
  for (let i = 0; i < rows.length; i += 400) {
    const { error } = await db.from('records').upsert(rows.slice(i, i + 400))
    if (error) throw new Error(`insert batch ${i}: ${error.message}`)
    process.stdout.write(`  ${Math.min(i + 400, rows.length)}/${rows.length}\r`)
  }
  console.log('\n✔ Cloud seed complete. Demo logins: teacher/parent/student@bright.academy · demo1234')
  console.log('  Re-run this script any time to refresh demo data (sessions are dated relative to today).')
}
run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1) })
