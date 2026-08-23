import { addDays, addMinutes, setHours, setMinutes, startOfDay, subDays, subMinutes, format } from 'date-fns'
import { COURSES, TEACHERS, DEMO_STUDENT_NAMES } from './data.js'
import { uid, detectTimezone } from './utils.js'

// Deterministic pseudo-random so the demo looks the same on every reset
let _seed = 42
const rnd = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280 }
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

export const DEMO_PASSWORD_HASH = 'demo' // checked specially in signIn
export const SCHEMA_VERSION = 9

const at = (date, hhmm) => { const [h, m] = hhmm.split(':').map(Number); return setMinutes(setHours(startOfDay(date), h), m) }

export function buildSeed() {
  _seed = 42
  const now = new Date()
  const tz = detectTimezone()
  const users = []
  const mkUser = (u) => { users.push(u); return u }

  // --- Accounts ---
  const teacher = mkUser({ id: 'u_teacher', role: 'teacher', name: 'Rayyannoor D.', firstName: 'Rayyannoor', lastName: 'D.', email: 'teacher@bright.academy', passwordHash: DEMO_PASSWORD_HASH, teacherId: 't3', timezone: tz, avatar: 'teachers/rayyannoor-d.jpg', phone: '+62 812 0000 1111', createdAt: subDays(now, 400).toISOString(), status: 'active', applicationStatus: 'approved' })
  const parent = mkUser({ id: 'u_parent', role: 'parent', name: 'Fatima Noor', firstName: 'Fatima', lastName: 'Noor', email: 'parent@bright.academy', passwordHash: DEMO_PASSWORD_HASH, timezone: tz, phone: '+1 555 010 7788', createdAt: subDays(now, 120).toISOString(), children: ['u_s1', 'u_s2'], status: 'active' })
  const yusuf = mkUser({ id: 'u_s1', role: 'student', name: 'Yusuf Noor', firstName: 'Yusuf', lastName: 'Noor', email: 'student@bright.academy', passwordHash: DEMO_PASSWORD_HASH, timezone: tz, age: 9, grade: 'Grade 4', parentId: 'u_parent', createdAt: subDays(now, 120).toISOString(), status: 'active', points: 1240, streak: 12 })
  const maryam = mkUser({ id: 'u_s2', role: 'student', name: 'Maryam Noor', firstName: 'Maryam', lastName: 'Noor', email: 'maryam@bright.academy', passwordHash: DEMO_PASSWORD_HASH, timezone: tz, age: 7, grade: 'Grade 2', parentId: 'u_parent', createdAt: subDays(now, 100).toISOString(), status: 'active', points: 620, streak: 5 })
  // Other demo students (no login)
  const others = DEMO_STUDENT_NAMES.map((n, i) => mkUser({ id: `u_d${i + 1}`, role: 'student', name: n, firstName: n.split(' ')[0], lastName: n.split(' ')[1], email: `${n.toLowerCase().replace(/ /g, '.')}@example.com`, passwordHash: DEMO_PASSWORD_HASH, timezone: tz, age: 7 + (i % 9), grade: `Grade ${2 + (i % 7)}`, parentId: null, createdAt: subDays(now, 90 + i * 3).toISOString(), status: 'active', points: 200 + i * 37, streak: i % 9 }))
  // A second parent (for messages realism)
  mkUser({ id: 'u_admin', role: 'admin', name: 'Academy Admin', firstName: 'Academy', lastName: 'Admin', email: 'admin@bright.academy', passwordHash: DEMO_PASSWORD_HASH, timezone: tz, createdAt: subDays(now, 400).toISOString(), status: 'active' })
  const parent2 = mkUser({ id: 'u_parent2', role: 'parent', name: 'Karim Karimov', firstName: 'Karim', lastName: 'Karimov', email: 'karim@example.com', passwordHash: DEMO_PASSWORD_HASH, timezone: tz, children: ['u_d1'], createdAt: subDays(now, 95).toISOString(), status: 'active' })
  others[0].parentId = 'u_parent2'

  const enrollments = []
  const sessions = []
  const groups = []
  const recordings = []
  const feedback = []
  const homework = []
  const lessons = []
  const conversations = []
  const notifications = []
  const trials = []
  const rescheduleRequests = []
  const approvalRequests = []
  const certificates = []
  const payments = []
  const reviews = []
  const proposals = []
  const availability = {}

  const DUR = (course) => (course.category === 'little-muslims' ? 30 : 45)

  // Generate weekly sessions for an enrollment between start and end
  const genSessions = ({ enrollment, course, slots, studentIds, from, to, groupId }) => {
    let d = startOfDay(from)
    while (d <= to) {
      for (const s of slots) {
        if (d.getDay() === s.day) {
          const start = at(d, s.time)
          const end = addMinutes(start, DUR(course))
          let status = 'scheduled'
          if (end < now) { const r = rnd(); status = r < 0.86 ? 'completed' : r < 0.93 ? 'missed' : 'cancelled' }
          const sess = { id: uid('ses'), enrollmentId: enrollment?.id || null, groupId: groupId || null, courseId: course.id, teacherId: course.teacherId, studentIds: [...studentIds], start: start.toISOString(), end: end.toISOString(), status, type: 'regular', topic: status === 'completed' ? pick(course.curriculum) : '', attendance: {}, createdAt: subDays(now, 60).toISOString() }
          if (status === 'completed') studentIds.forEach((sid) => { sess.attendance[sid] = rnd() > 0.08 })
          if (status === 'missed') studentIds.forEach((sid) => { sess.attendance[sid] = false })
          sessions.push(sess)
        }
      }
      d = addDays(d, 1)
    }
  }

  const from = subDays(now, 56), to = addDays(now, 28)
  const c = Object.fromEntries(COURSES.map((x) => [x.id, x]))

  // ---- Demo teacher (t3): 1-on-1 course c2 with 14 students + group course c12 with 7 students ----
  const oneOnOneStudents = [yusuf, ...others.slice(0, 13)]
  const slotPool = [['05:15', '06:00'], ['06:00', '06:45'], ['07:00', '07:45'], ['16:00', '16:45'], ['17:15', '18:00'], ['18:00', '18:45'], ['19:30', '20:15'], ['20:30', '21:15'], ['21:30', '22:15'], ['15:00', '15:45']]
  oneOnOneStudents.forEach((st, i) => {
    const dayA = (i % 5) + 1, dayB = ((i + 2) % 5) + 1 // Mon–Fri
    const t = slotPool[i % slotPool.length][0]
    const plan = i % 3 === 0 ? 'starter' : i % 3 === 1 ? 'growth' : 'accelerated'
    const slots = plan === 'starter' ? [{ day: dayA, time: t }] : plan === 'growth' ? [{ day: dayA, time: t }, { day: dayB, time: t }] : [{ day: dayA, time: t }, { day: dayB, time: t }, { day: ((i + 4) % 5) + 1, time: t }]
    const e = { id: uid('enr'), courseId: 'c2', studentId: st.id, parentId: st.parentId, teacherId: 't3', plan, perWeek: slots.length, slots, startDate: subDays(now, 56 - (i % 20)).toISOString(), status: 'active', price: c.c2.plans.find((p) => p.id === plan).price, createdAt: subDays(now, 60).toISOString() }
    enrollments.push(e)
    genSessions({ enrollment: e, course: c.c2, slots, studentIds: [st.id], from: new Date(e.startDate), to })
  })
  // Group course c12: two groups
  const gA = { id: 'grp_a', courseId: 'c12', teacherId: 't3', name: 'Quran Bootcamp — Group A', capacity: 6, memberIds: others.slice(13, 17).map((s) => s.id), slots: [{ day: 1, time: '17:15' }, { day: 3, time: '17:15' }], status: 'open' }
  const gB = { id: 'grp_b', courseId: 'c12', teacherId: 't3', name: 'Quran Bootcamp — Group B', capacity: 3, memberIds: others.slice(17, 20).map((s) => s.id), slots: [{ day: 2, time: '07:15' }, { day: 4, time: '07:15' }], status: 'full' }
  groups.push(gA, gB)
  for (const g of [gA, gB]) {
    g.memberIds.forEach((sid) => enrollments.push({ id: uid('enr'), courseId: 'c12', studentId: sid, parentId: null, teacherId: 't3', plan: 'growth', perWeek: 2, slots: g.slots, groupId: g.id, startDate: subDays(now, 42).toISOString(), status: 'active', price: 120, createdAt: subDays(now, 45).toISOString() }))
    genSessions({ course: c.c12, slots: g.slots, studentIds: g.memberIds, from: subDays(now, 42), to, groupId: g.id })
  }
  // Add an extra "live" make-up session right now for the demo teacher with Yusuf
  sessions.push({ id: 'ses_live_demo', enrollmentId: enrollments[0].id, courseId: 'c2', teacherId: 't3', studentIds: ['u_s1'], start: subMinutes(now, 8).toISOString(), end: addMinutes(now, 37).toISOString(), status: 'live', type: 'regular', topic: 'Noon Sakinah & Tanween — Ikhfa practice', attendance: { u_s1: true }, createdAt: subDays(now, 3).toISOString(), isMakeup: true })
  // Make sure a couple of sessions later today are still scheduled for the teacher
  ;[['19:30', others[1]], ['20:30', others[2]], ['21:30', others[3]]].forEach(([t, st], i) => {
    const start = at(now, t)
    if (start > now) sessions.push({ id: uid('ses'), enrollmentId: enrollments[i + 1].id, courseId: 'c2', teacherId: 't3', studentIds: [st.id], start: start.toISOString(), end: addMinutes(start, 45).toISOString(), status: 'scheduled', type: 'regular', topic: '', attendance: {}, createdAt: subDays(now, 10).toISOString() })
  })

  // ---- Yusuf also takes Hifz (c3) with t5; Maryam takes Qaida (c1) with t1 and Duas group (c10) ----
  const eY2 = { id: uid('enr'), courseId: 'c3', studentId: 'u_s1', parentId: 'u_parent', teacherId: 't5', plan: 'starter', perWeek: 1, slots: [{ day: 6, time: '10:00' }], startDate: subDays(now, 49).toISOString(), status: 'active', price: 80, createdAt: subDays(now, 50).toISOString() }
  const eM1 = { id: uid('enr'), courseId: 'c1', studentId: 'u_s2', parentId: 'u_parent', teacherId: 't1', plan: 'growth', perWeek: 2, slots: [{ day: 2, time: '16:30' }, { day: 4, time: '16:30' }], startDate: subDays(now, 35).toISOString(), status: 'active', price: 160, createdAt: subDays(now, 36).toISOString() }
  const gC = { id: 'grp_c', courseId: 'c10', teacherId: 't1', name: 'Little Muslims — Saturday Circle', capacity: 6, memberIds: ['u_s2', others[5].id, others[6].id, others[7].id], slots: [{ day: 6, time: '09:00' }], status: 'open' }
  groups.push(gC)
  const eM2 = { id: uid('enr'), courseId: 'c10', studentId: 'u_s2', parentId: 'u_parent', teacherId: 't1', plan: 'starter', perWeek: 1, slots: gC.slots, groupId: gC.id, startDate: subDays(now, 28).toISOString(), status: 'active', price: 50, createdAt: subDays(now, 30).toISOString() }
  enrollments.push(eY2, eM1, eM2)
  genSessions({ enrollment: eY2, course: c.c3, slots: eY2.slots, studentIds: ['u_s1'], from: new Date(eY2.startDate), to })
  genSessions({ enrollment: eM1, course: c.c1, slots: eM1.slots, studentIds: ['u_s2'], from: new Date(eM1.startDate), to })
  genSessions({ course: c.c10, slots: gC.slots, studentIds: gC.memberIds, from: new Date(eM2.startDate), to, groupId: gC.id })

  // ---- Recordings for completed sessions of the demo teacher (and Yusuf/Maryam's) ----
  sessions.filter((s) => s.status === 'completed' && (s.teacherId === 't3' || s.studentIds.includes('u_s1') || s.studentIds.includes('u_s2'))).forEach((s) => {
    if (rnd() < 0.8) { const r = { id: uid('rec'), sessionId: s.id, courseId: s.courseId, teacherId: s.teacherId, studentIds: s.studentIds, title: `${c[s.courseId].title} — ${s.topic || 'Lesson'}`, duration: 44 + Math.floor(rnd() * 9), status: 'ready', start: s.start, sizeMb: 120 + Math.floor(rnd() * 80), createdAt: s.end }; recordings.push(r); s.recordingId = r.id }
  })

  // ---- Feedback given for some completed sessions (teacher t3) ----
  sessions.filter((s) => s.teacherId === 't3' && s.status === 'completed').forEach((s, i) => {
    if (i % 3 !== 0) feedback.push({ id: uid('fb'), sessionId: s.id, teacherId: 't3', courseId: s.courseId, studentId: s.studentIds[0], learned: s.topic || 'Recitation practice', weak: pick(['Ghunnah length', 'Confusing ص and س', 'Madd counts', 'Stopping mid-ayah', 'Qalqalah strength']), recommendations: pick(['Listen to the model recording daily', 'Repeat page 3 lines 1–5 ten times', 'Practise the Ikhfa letters with the chart', 'Revise last week’s surah before next class']), engagement: 3 + Math.floor(rnd() * 3), createdAt: s.end })
  })

  // ---- Lessons ----
  c.c2.curriculum.forEach((t, i) => lessons.push({ id: uid('les'), courseId: 'c2', teacherId: 't3', order: i + 1, title: t, objectives: `Students will be able to apply: ${t}.`, materials: ['Tajweed chart (PDF)', 'Practice audio'], published: true, createdAt: subDays(now, 50).toISOString() }))
  c.c12.curriculum.slice(0, 4).forEach((t, i) => lessons.push({ id: uid('les'), courseId: 'c12', teacherId: 't3', order: i + 1, title: t, objectives: `Group goal: ${t}.`, materials: ['Reading log', 'Fluency drill sheet'], published: i < 3, createdAt: subDays(now, 40).toISOString() }))

  // ---- Homework ----
  const hwT = (o) => ({ id: uid('hw'), teacherId: 't3', createdAt: subDays(now, 3).toISOString(), dueAt: addDays(now, 4).toISOString(), conversation: [], ...o })
  gA.memberIds.forEach((sid, i) => homework.push(hwT({ courseId: 'c12', studentId: sid, title: 'Surah An-Nas', description: 'Try to read this surah as many times as you can and write it once.', attachment: { name: 'SURAH 114 AN-NAS.jpg', size: '250 KB' }, status: i === 0 ? 'submitted' : 'assigned', submission: i === 0 ? { text: 'I read it 12 times and wrote it in my book. Photo attached.', at: subDays(now, 1).toISOString(), attachment: { name: 'my-writing.jpg', size: '1.1 MB' } } : null })))
  homework.push(hwT({ courseId: 'c2', studentId: 'u_s1', title: 'Surah Al-Falaq — Ikhfa practice', description: 'Mark all Ikhfa letters in Surah Al-Falaq and record yourself reciting 3 times.', status: 'graded', grade: 92, gradeFeedback: 'Excellent Ikhfa. Watch the Madd in “al-falaq”.', submission: { text: 'Recorded and attached. I marked 2 Ikhfa.', at: subDays(now, 2).toISOString(), attachment: { name: 'falaq-recitation.m4a', size: '2.3 MB' } }, createdAt: subDays(now, 6).toISOString(), dueAt: subDays(now, 1).toISOString() }))
  homework.push(hwT({ courseId: 'c2', studentId: 'u_s1', title: 'Al-Fatihah with Tajweed marks', description: 'Read Al-Fatihah daily, 5 times, with the Tajweed colour code.', status: 'assigned' }))
  homework.push(hwT({ courseId: 'c2', studentId: others[1].id, title: 'Noon Sakinah worksheet', description: 'Complete worksheet 2 (Izhar & Idgham).', status: 'revision', submission: { text: 'Done, attached.', at: subDays(now, 1).toISOString() }, gradeFeedback: 'Two answers mixed Izhar with Ikhfa — please redo questions 4 and 7.' }))
  homework.push({ id: uid('hw'), teacherId: 't5', courseId: 'c3', studentId: 'u_s1', title: 'Revise Surah Al-Buruj', description: 'Sabqi revision: recite Al-Buruj 10 times from memory.', status: 'assigned', createdAt: subDays(now, 2).toISOString(), dueAt: addDays(now, 3).toISOString(), conversation: [] })
  homework.push({ id: uid('hw'), teacherId: 't1', courseId: 'c1', studentId: 'u_s2', title: 'Qaida Lesson 9 — Tanween', description: 'Read lesson 9 lines 1–6 five times with a parent.', status: 'submitted', submission: { text: 'Maryam read it with me 5 times. — Mama', at: subDays(now, 1).toISOString() }, createdAt: subDays(now, 4).toISOString(), dueAt: addDays(now, 1).toISOString(), conversation: [] })

  // ---- Conversations ----
  const mkConv = (ids, msgs) => conversations.push({ id: uid('conv'), participantIds: ids, messages: msgs.map(([senderId, text, daysAgo, hours]) => ({ id: uid('msg'), senderId, text, at: addMinutes(subDays(now, daysAgo), -hours * 60).toISOString(), readBy: [senderId] })), createdAt: subDays(now, 20).toISOString() })
  mkConv(['u_teacher', 'u_parent'], [['u_parent', 'Assalamu alaikum Sheikh, Yusuf will be 10 minutes late tomorrow — dentist appointment.', 2, 3], ['u_teacher', 'Wa alaikum assalam. No problem at all, we will do revision first.', 2, 2], ['u_parent', 'JazakAllah khair! Also — his Ikhfa has improved so much, thank you.', 1, 5], ['u_teacher', 'Alhamdulillah, he works hard. Please remind him to listen to the model recording daily.', 1, 4]])
  mkConv(['u_teacher', 'u_parent2'], [['u_parent2', 'Hey teacher, do we have any homework this week?', 16, 2], ['u_teacher', 'Yes — Surah An-Nas reading log. It is in the Homework section.', 16, 1]])
  mkConv(['u_teacher', 'u_d4'], [['u_d4', 'Sorry I missed the class, my internet went down.', 17, 6], ['u_teacher', 'No worries Khadija, you can watch the recording and we will catch up on Wednesday.', 17, 5], ['u_d4', 'sorry', 17, 4]])
  mkConv(['u_teacher', 'u_d2'], [['u_d2', 'Can you send the link in the messages?', 18, 1], ['u_teacher', 'Use the “Enter Classroom” button in Sessions — it opens the live room directly.', 18, 0.5]])
  mkConv(['u_s1', 'u_teacher'], [['u_s1', 'Sheikh, I finished memorising Al-Falaq!', 3, 8], ['u_teacher', 'MashaAllah Yusuf! Recite it to me in our next class.', 3, 7]])
  mkConv(['u_parent', 'u_parent'], []) // placeholder removed below
  conversations.pop()

  // ---- Notifications ----
  const notif = (userId, title, body, daysAgo, type = 'info') => notifications.push({ id: uid('ntf'), userId, title, body, type, at: subDays(now, daysAgo).toISOString(), read: daysAgo > 2 })
  notif('u_teacher', 'Trial assessment pending', 'Shakir Ahmed completed a trial — submit the assessment report.', 0.2, 'warning')
  notif('u_teacher', 'New homework submission', 'Hafsa Begum submitted “Surah An-Nas”.', 1)
  notif('u_teacher', 'Payout processed', 'Your July payout of $1,248 has been sent to your Wise account.', 6, 'success')
  notif('u_teacher', 'New review', 'Fatima Noor left a 5★ review on Quran Recitation with Tajweed.', 9)
  notif('u_parent', 'Lesson reminder', 'Yusuf’s Quran class starts in 15 minutes.', 0.1)
  notif('u_parent', 'Homework graded', 'Shaykh Rayyannoor graded “Surah Al-Falaq — Ikhfa practice”: 92/100.', 2, 'success')
  notif('u_parent', 'Monthly report ready', 'Yusuf’s August progress report is available.', 5)
  notif('u_s1', 'Homework graded', 'You scored 92/100 on Surah Al-Falaq. MashaAllah!', 2, 'success')
  notif('u_s1', 'Streak!', 'You have a 12-day reading streak. Keep going!', 0.5, 'success')

  // ---- Trials ----
  trials.push({ id: uid('tr'), courseId: 'c12', teacherId: 't3', studentName: 'Shakir Ahmed', age: 10, grade: 'Grade 5', parentName: 'Ahmed Rauf', parentEmail: 'ahmed.rauf@example.com', parentId: null, start: subDays(now, 1).toISOString(), end: addMinutes(subDays(now, 1), 30).toISOString(), status: 'completed', assessment: null, createdAt: subDays(now, 5).toISOString() })
  trials.push({ id: uid('tr'), courseId: 'c2', teacherId: 't3', studentName: 'Laila Haddad', age: 8, grade: 'Grade 3', parentName: 'Rania Haddad', parentEmail: 'rania@example.com', parentId: null, start: at(addDays(now, 1), '16:00').toISOString(), end: at(addDays(now, 1), '16:30').toISOString(), status: 'scheduled', assessment: null, createdAt: subDays(now, 2).toISOString() })
  trials.push({ id: uid('tr'), courseId: 'c2', teacherId: 't3', studentName: 'Omar Siddiq', age: 11, grade: 'Grade 6', parentName: 'Siddiq Family', parentEmail: 'siddiq@example.com', parentId: null, start: subDays(now, 9).toISOString(), end: addMinutes(subDays(now, 9), 30).toISOString(), status: 'completed', assessment: { level: 'Nazirah — intermediate', strengths: 'Reads fluently, good Makharij for most letters', weaknesses: 'Madd lengths inconsistent; weak Ghunnah', recommendation: 'Quran Recitation with Tajweed — Growth plan (2×/week)', notes: 'Very motivated, parents supportive.', submittedAt: subDays(now, 8).toISOString() }, createdAt: subDays(now, 12).toISOString() })
  trials.push({ id: uid('tr'), courseId: 'c5', teacherId: 't6', studentName: 'Yusuf Noor', age: 9, grade: 'Grade 4', parentName: 'Fatima Noor', parentEmail: 'parent@bright.academy', parentId: 'u_parent', studentId: 'u_s1', start: at(addDays(now, 3), '17:00').toISOString(), end: at(addDays(now, 3), '17:30').toISOString(), status: 'scheduled', assessment: null, createdAt: subDays(now, 1).toISOString() })

  // ---- Reschedule & approval requests ----
  const someSess = sessions.find((s) => s.teacherId === 't3' && s.status === 'scheduled' && new Date(s.start) > addDays(now, 2))
  rescheduleRequests.push({ id: uid('rr'), sessionId: someSess?.id, courseId: 'c2', teacherId: 't3', requesterId: 'u_parent2', studentId: 'u_d1', oldStart: someSess?.start, newStart: addDays(new Date(someSess?.start || now), 1).toISOString(), reason: 'Family travel — can we move this to the next day, same time?', status: 'pending', createdAt: subDays(now, 0.5).toISOString() })
  rescheduleRequests.push({ id: uid('rr'), sessionId: null, courseId: 'c2', teacherId: 't3', requesterId: 'u_parent', studentId: 'u_s1', oldStart: subDays(now, 20).toISOString(), newStart: subDays(now, 19).toISOString(), reason: 'School event', status: 'auto-approved', createdAt: subDays(now, 21).toISOString() })
  approvalRequests.push({ id: uid('ap'), courseId: 'c12', teacherId: 't3', studentId: others[13].id, enrollmentId: enrollments.find((e) => e.studentId === others[13].id)?.id, status: 'pending', requestedAt: subDays(now, 1).toISOString(), eligibility: { attendance: 94, lessonsCompleted: '16/16', homeworkAvg: 88 }, decisionNote: '' })
  certificates.push({ id: uid('cert'), studentId: 'u_s2', courseId: 'c10', teacherId: 't1', title: 'Daily Duas & Salah — Completion', issuedAt: subDays(now, 60).toISOString(), code: 'BA-2026-00117' })
  certificates.push({ id: uid('cert'), studentId: 'u_s1', courseId: 'c1', teacherId: 't1', title: 'Noorani Qaida — Completion with Distinction', issuedAt: subDays(now, 200).toISOString(), code: 'BA-2026-00042' })

  // ---- Payments (parent) ----
  payments.push({ id: uid('pay'), parentId: 'u_parent', items: [{ courseId: 'c2', studentId: 'u_s1', plan: 'growth', price: 160 }, { courseId: 'c3', studentId: 'u_s1', plan: 'starter', price: 80 }], subtotal: 240, discount: 24, total: 216, status: 'paid', method: 'Visa •••• 4242', at: subDays(now, 24).toISOString(), invoice: 'INV-2026-0812' })
  payments.push({ id: uid('pay'), parentId: 'u_parent', items: [{ courseId: 'c1', studentId: 'u_s2', plan: 'growth', price: 160 }, { courseId: 'c10', studentId: 'u_s2', plan: 'starter', price: 50 }], subtotal: 210, discount: 21, total: 189, status: 'paid', method: 'Visa •••• 4242', at: subDays(now, 24).toISOString(), invoice: 'INV-2026-0813' })
  payments.push({ id: uid('pay'), parentId: 'u_parent', items: [{ courseId: 'c2', studentId: 'u_s1', plan: 'growth', price: 160 }, { courseId: 'c3', studentId: 'u_s1', plan: 'starter', price: 80 }, { courseId: 'c1', studentId: 'u_s2', plan: 'growth', price: 160 }, { courseId: 'c10', studentId: 'u_s2', plan: 'starter', price: 50 }], subtotal: 450, discount: 67.5, total: 382.5, status: 'paid', method: 'Visa •••• 4242', at: subDays(now, 54).toISOString(), invoice: 'INV-2026-0701' })

  // ---- Reviews ----
  const rv = (courseId, teacherId, author, rating, text, daysAgo) => reviews.push({ id: uid('rev'), courseId, teacherId, authorName: author, authorId: null, rating, text, at: subDays(now, daysAgo).toISOString() })
  rv('c2', 't3', 'Fatima N.', 5, 'Shaykh Rayyannoor is patient and precise. Yusuf’s Tajweed is unrecognisable from 3 months ago — in the best way.', 9)
  rv('c2', 't3', 'Karim K.', 5, 'Very good teacher and amazing teaching 😀', 14)
  rv('c2', 't3', 'Sumaya A.', 5, 'Best Quran teacher we have had, online or offline.', 33)
  rv('c12', 't3', 'Rania H.', 5, 'The group energy is wonderful. The reading streaks motivated my son more than anything we tried.', 20)
  rv('c1', 't1', 'Hassan B.', 5, 'Ustoza Nurlaila is so gentle with the little ones. My 5-year-old reads words now!', 18)
  rv('c3', 't5', 'Abdul R.', 5, 'The Sabaq/Sabqi/Manzil system is genius. He has kept everything he memorised.', 40)
  rv('c4', 't2', 'Nour S.', 5, 'She actually speaks Arabic with her cousins now. Fun and structured.', 22)
  rv('c6', 't4', 'Maha O.', 5, 'Shaykh Abdul-azyz makes Fiqh practical — wudu checklist on our fridge!', 30)
  rv('c5', 't6', 'Hafsa B. (student)', 5, 'I understand Al-Fatihah in salah now. Best decision.', 11)
  rv('c7', 't7', 'Zain M.', 5, 'Story time with lessons. My kids talk about the Seerah at dinner.', 25)

  // ---- Availability for demo teacher ----
  availability['u_teacher'] = [
    { id: uid('av'), day: 1, from: '05:00', to: '10:00' }, { id: uid('av'), day: 1, from: '16:00', to: '22:30' },
    { id: uid('av'), day: 2, from: '05:00', to: '10:00' }, { id: uid('av'), day: 2, from: '16:00', to: '22:30' },
    { id: uid('av'), day: 3, from: '05:00', to: '10:00' }, { id: uid('av'), day: 3, from: '16:00', to: '22:30' },
    { id: uid('av'), day: 4, from: '05:00', to: '10:00' }, { id: uid('av'), day: 4, from: '16:00', to: '22:30' },
    { id: uid('av'), day: 5, from: '05:00', to: '10:00' }, { id: uid('av'), day: 5, from: '16:00', to: '21:00' },
    { id: uid('av'), day: 6, from: '08:00', to: '12:00' },
  ]

  return {
    schemaVersion: SCHEMA_VERSION, seededAt: now.toISOString(), currentUserId: null,
    users, enrollments, sessions, groups, recordings, feedback, homework, lessons, conversations, notifications, trials, rescheduleRequests, approvalRequests, certificates, payments, reviews, proposals, availability,
    carts: { u_parent: [] }, wishlists: { u_parent: ['c5'] }, leads: [], applications: [], customPlanRequests: [], payoutMethods: {}, withdrawals: [],
  }
}
