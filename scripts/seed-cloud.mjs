#!/usr/bin/env node
// Bright Academy 2.0 migration / demo seed. Keeps all existing accounts (except parents) and every `leads` record.
// Usage: SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=... node scripts/seed-cloud.mjs
import { expandClass, topUpSessions, startOfDay, addDays, ymd } from '../src/lib/schedule.js'
import { participantsFor } from '../src/lib/cloud.js'

const URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY
if (!URL || !KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY'); process.exit(1) }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const api = async (method, path, body, extra = {}) => {
  const r = await fetch(URL + path, { method, headers: { ...H, ...extra }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = t ? JSON.parse(t) : null } catch { d = t }
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${JSON.stringify(d).slice(0, 200)}`)
  return d
}
let n = 0; const uid = (p) => `${p}_${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

async function ensureUser({ email, name, role, data }) {
  const list = await api('GET', '/auth/v1/admin/users?per_page=1000')
  let u = list.users.find((x) => x.email === email)
  if (!u) { u = await api('POST', '/auth/v1/admin/users', { email, password: 'demo1234', email_confirm: true, user_metadata: { name, role, data } }); console.log('  + created', email) }
  const [cur] = await api('GET', `/rest/v1/profiles?id=eq.${u.id}&select=data`)
  await api('POST', '/rest/v1/profiles', { id: u.id, email, name, role, data: { ...(cur?.data || {}), active: true, ...data } }, { Prefer: 'resolution=merge-duplicates' })
  return u.id
}

const run = async () => {
  console.log('→ Accounts')
  const profiles = await api('GET', '/rest/v1/profiles?select=id,email,role,name,data')
  for (const p of profiles.filter((x) => x.role === 'parent')) { await api('DELETE', `/auth/v1/admin/users/${p.id}`); console.log('  - removed parent', p.email) }
  const id = {}
  id.rayyan = await ensureUser({ email: 'teacher@bright.academy', name: 'Rayyannoor D.', role: 'teacher', data: { subjects: ['quran', 'arabic'], avatar: 'teachers/rayyannoor-d.jpg' } })
  id.suaib = await ensureUser({ email: 'suaib@bright.academy', name: 'Suaib Ibrahim', role: 'teacher', data: { subjects: ['islamic', 'esl'], avatar: 'teachers/shuaib-i.jpg' } })
  id.math = await ensureUser({ email: 'math@bright.academy', name: 'Daniel Cruz', role: 'teacher', data: { subjects: ['math', 'science'] } })
  id.code = await ensureUser({ email: 'coding@bright.academy', name: 'Sara Kim', role: 'teacher', data: { subjects: ['programming', 'esl'] } })
  id.yusuf = await ensureUser({ email: 'student@bright.academy', name: 'Yusuf Noor', role: 'student', data: { age: 9, grade: 'Grade 4' } })
  id.liam = await ensureUser({ email: 'liam@bright.academy', name: 'Liam Santos', role: 'student', data: { age: 12, grade: 'Grade 7' } })
  id.mia = await ensureUser({ email: 'mia@bright.academy', name: 'Mia Tan', role: 'student', data: { age: 10, grade: 'Grade 5' } })
  const nurz = profiles.find((p) => p.email === 'nurzaida@bright.academy')
  if (nurz && !(nurz.data?.subjects || []).length) await api('PATCH', `/rest/v1/profiles?id=eq.${nurz.id}`, { data: { ...(nurz.data || {}), active: true, subjects: [] } })
  for (const e of ['aisha.flores@bright.academy', 'ivan@bright.academy']) { const p = profiles.find((x) => x.email === e); if (p) id[e.split('@')[0]] = p.id }

  console.log('→ Clearing old records (keeping leads)')
  await api('DELETE', '/rest/v1/records?collection=neq.leads')

  console.log('→ Classes & sessions')
  const now = new Date(); const start = ymd(addDays(startOfDay(now), -21))
  const classes = [
    { subjectId: 'math', teacherId: id.math, studentIds: [id.liam], slots: [{ day: 1, time: '16:00', minutes: 45 }, { day: 3, time: '16:00', minutes: 45 }] },
    { subjectId: 'science', teacherId: id.math, studentIds: [id.mia, id.liam], slots: [{ day: 5, time: '17:00', minutes: 60 }] },
    { subjectId: 'programming', teacherId: id.code, studentIds: [id.liam], slots: [{ day: 2, time: '18:00', minutes: 60 }] },
    { subjectId: 'esl', teacherId: id.code, studentIds: [id.mia], slots: [{ day: 4, time: '16:30', minutes: 45 }] },
    { subjectId: 'quran', teacherId: id.rayyan, studentIds: [id.yusuf], slots: [{ day: 1, time: '18:00', minutes: 45 }, { day: 4, time: '18:00', minutes: 45 }] },
    { subjectId: 'islamic', teacherId: id.suaib, studentIds: [id.yusuf, id.mia].filter(Boolean), slots: [{ day: 6, time: '10:00', minutes: 60 }] },
  ].map((c) => ({ id: uid('cls'), status: 'active', startDate: start, endDate: null, notes: '', createdAt: now.toISOString(), title: '', ...c }))
  const names = { [id.liam]: 'Liam Santos', [id.mia]: 'Mia Tan', [id.yusuf]: 'Yusuf Noor' }
  const subj = { math: 'Math', science: 'Science', programming: 'Computer Programming', esl: 'English (ESL)', quran: "Qur'an", islamic: 'Islamic Studies' }
  for (const c of classes) c.title = `${subj[c.subjectId]} — ${c.studentIds.map((s) => names[s]).join(', ')}`
  const topics = { math: ['Fractions', 'Decimals', 'Ratios'], science: ['Plant cells', 'States of matter', 'Forces'], programming: ['Scratch loops', 'Python variables', 'If statements'], esl: ['Past tense', 'Describing places', 'Asking questions'], quran: ['Surah Al-Fatihah', 'Noon Sakinah rules', 'Surah Al-Ikhlas'], islamic: ['Pillars of Islam', 'Wudu', 'Kindness'] }
  const sessions = []
  for (const c of classes) {
    expandClass(c, startOfDay(fromStr(start)), now).forEach((o, i) => {
      if (new Date(o.end) > now) return
      const t = topics[c.subjectId][i % 3]
      sessions.push({ id: uid('ses'), classId: c.id, subjectId: c.subjectId, teacherId: c.teacherId, studentIds: c.studentIds, start: o.start, end: o.end, origStart: o.start, status: 'completed', topic: t, homework: i % 2 ? `Practise: ${t}` : '', attendance: Object.fromEntries(c.studentIds.map((s) => [s, true])), oneOff: false })
    })
  }
  sessions.push(...topUpSessions(classes, sessions, now, () => uid('ses')))
  const avail = { [id.math]: [1, 2, 3, 4, 5].map((d) => ({ day: d, from: '15:00', to: '20:00' })), [id.code]: [2, 4, 6].map((d) => ({ day: d, from: '16:00', to: '21:00' })), [id.rayyan]: [1, 3, 4].map((d) => ({ day: d, from: '17:00', to: '21:00' })), [id.suaib]: [{ day: 6, from: '09:00', to: '13:00' }, { day: 2, from: '18:00', to: '21:00' }] }

  const row = (collection, item) => ({ id: `${collection}:${item.id}`, collection, data: item, owner: null, participants: participantsFor(collection, item) })
  const rows = [...classes.map((c) => row('classes', c)), ...sessions.map((s) => row('sessions', s)), ...Object.entries(avail).map(([k, v]) => row('availability', { id: k, value: v }))]
  for (let i = 0; i < rows.length; i += 300) await api('POST', '/rest/v1/records', rows.slice(i, i + 300), { Prefer: 'resolution=merge-duplicates,return=minimal' })
  console.log(`✔ ${classes.length} classes, ${sessions.length} sessions, ${Object.keys(avail).length} availability sets. Leads kept.`)
}
function fromStr(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
run().catch((e) => { console.error('✖', e.message); process.exit(1) })
