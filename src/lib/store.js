import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addDays, addMinutes, addWeeks, startOfDay, setHours, setMinutes } from 'date-fns'
import { buildSeed, SCHEMA_VERSION, DEMO_PASSWORD_HASH } from './seed.js'
import { supabase, cloudActive, setLocalModeForced, loadCloudState, diffAndPush, resetShadow, subscribeRealtime, buildStateFromRows } from './cloud.js'
import { CLOUD_CONFIGURED } from './cloud-config.js'
import { COURSES } from './data.js'
import { uid, sha256, detectTimezone } from './utils.js'

const SALT = 'bright-academy-demo-salt'
export const hashPassword = (pw) => sha256(`${SALT}:${pw}`)

const at = (date, hhmm) => { const [h, m] = hhmm.split(':').map(Number); return setMinutes(setHours(startOfDay(date), h), m) }

// Non-persisted UI store (toasts, dialogs)
export const useUI = create((set) => ({
  toasts: [],
  authOpen: false, authMode: 'signin', authRedirect: null,
  toast: (t) => { const id = uid('toast'); const item = { id, type: 'info', ...(typeof t === 'string' ? { title: t } : t) }; set((s) => ({ toasts: [...s.toasts, item] })); setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), item.duration || 3500) },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  openAuth: (mode = 'signin', redirect = null) => set({ authOpen: true, authMode: mode, authRedirect: redirect }),
  closeAuth: () => set({ authOpen: false }),
}))
export const toast = (t) => useUI.getState().toast(t)

export const useStore = create(
  persist(
    (set, get) => ({
      ...(cloudActive() ? { ...buildStateFromRows([], []), schemaVersion: SCHEMA_VERSION, seededAt: null, currentUserId: null, leads: [], applications: [], customPlanRequests: [], withdrawals: [], payoutMethods: {}, carts: {}, wishlists: {}, availability: {} } : buildSeed()),
      cloud: cloudActive(),
      cloudReady: !cloudActive(),

      // ---------- helpers ----------
      _update: (fn) => set((s) => fn(s)),
      resetDemo: () => { set(buildSeed()); toast({ title: 'Demo data reset', type: 'success' }) },
      notify: (userId, title, body, type = 'info') => set((s) => ({ notifications: [{ id: uid('ntf'), userId, title, body, type, at: new Date().toISOString(), read: false }, ...s.notifications] })),
      markNotificationsRead: (userId) => set((s) => ({ notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)) })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      // ---------- auth ----------
      signUp: async ({ name, email, password, role = 'parent', timezone, phone = '', age, grade, childName, childAge, childGrade }) => {
        const s = get()
        if (s.cloud) {
          if (password.length < 6) throw new Error('Password must be at least 6 characters.')
          const extra = { timezone: timezone || detectTimezone(), phone }
          if (role === 'student') Object.assign(extra, { age: age ? Number(age) : null, grade: grade || '', points: 0, streak: 0 })
          if (role === 'teacher') Object.assign(extra, { teacherId: null, applicationStatus: 'pending' })
          const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { name: name.trim(), role, data: extra } } })
          if (error) throw new Error(error.message)
          if (!data.session) throw new Error('Almost there — confirm the link we emailed you, then sign in. (Site owner: disable “Confirm email” in Supabase Auth settings for instant signups.)')
          await get().cloudRefresh(data.session.user.id)
          if (role === 'parent' && childName) get().addChild(data.session.user.id, { name: childName, age: childAge, grade: childGrade })
          get().notify(data.session.user.id, `Welcome to Bright Academy, ${name.split(' ')[0]}!`, role === 'teacher' ? 'Your teacher application is under review.' : 'Browse courses and book a free trial to get started.', 'success')
          return get().users.find((u) => u.id === data.session.user.id) || { id: data.session.user.id, role, name, firstName: name.split(' ')[0] }
        }
        const em = email.trim().toLowerCase()
        if (s.users.some((u) => u.email.toLowerCase() === em)) throw new Error('An account with this email already exists. Please sign in.')
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        const passwordHash = await hashPassword(password)
        const [firstName, ...rest] = name.trim().split(' ')
        const id = uid('u')
        const user = { id, role, name: name.trim(), firstName, lastName: rest.join(' '), email: em, passwordHash, timezone: timezone || detectTimezone(), phone, createdAt: new Date().toISOString(), status: 'active', children: [], avatar: null }
        if (role === 'student') Object.assign(user, { age: age || null, grade: grade || '', parentId: null, points: 0, streak: 0 })
        if (role === 'teacher') Object.assign(user, { teacherId: null, applicationStatus: 'pending' })
        const users = [...s.users, user]
        if (role === 'parent' && childName) {
          const cid = uid('u'); const [cf, ...cr] = childName.trim().split(' ')
          users.push({ id: cid, role: 'student', name: childName.trim(), firstName: cf, lastName: cr.join(' ') || user.lastName, email: `${cid}@child.local`, passwordHash: 'child', timezone: user.timezone, age: childAge ? Number(childAge) : null, grade: childGrade || '', parentId: id, createdAt: new Date().toISOString(), status: 'active', points: 0, streak: 0 })
          user.children = [cid]
        }
        set({ users, currentUserId: id })
        get().notify(id, `Welcome to Bright Academy, ${firstName}!`, role === 'teacher' ? 'Your teacher application is under review. Complete your profile in Settings.' : 'Browse courses and book a free trial to get started.', 'success')
        return user
      },
      signIn: async (email, password) => {
        const s = get()
        if (s.cloud) {
          const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
          if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong email or password. Demo accounts exist only after the cloud seed is run — or use “Explore local demo”.' : error.message)
          await get().cloudRefresh(data.user.id)
          return get().users.find((u) => u.id === data.user.id)
        }
        const em = email.trim().toLowerCase()
        const user = s.users.find((u) => u.email.toLowerCase() === em)
        if (!user) throw new Error('No account found with that email.')
        const ok = user.passwordHash === DEMO_PASSWORD_HASH ? password === 'demo1234' : user.passwordHash === (await hashPassword(password))
        if (!ok) throw new Error('Incorrect password. Demo accounts use “demo1234”.')
        set({ currentUserId: user.id })
        return user
      },
      signInDemo: async (role) => {
        if (get().cloud) { const emails = { teacher: 'teacher@bright.academy', parent: 'parent@bright.academy', student: 'student@bright.academy' }; return get().signIn(emails[role], 'demo1234') }
        const map = { teacher: 'u_teacher', parent: 'u_parent', student: 'u_s1' }; set({ currentUserId: map[role] }); return get().users.find((u) => u.id === map[role])
      },
      signOut: () => { if (get().cloud) { supabase.auth.signOut(); const empty = buildStateFromRows([], []); resetShadow(null); set({ ...empty, currentUserId: null, cloudReady: true }); get().cloudRefresh(null) } else set({ currentUserId: null }) },
      updateUser: (id, patch) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch, ...(patch.firstName || patch.lastName ? { name: `${patch.firstName ?? u.firstName} ${patch.lastName ?? u.lastName}`.trim() } : {}) } : u)) }))
        const u = get().users.find((x) => x.id === id)
        if (get().cloud && u?._profile) {
          const { id: _i, role, email, name, firstName, lastName, _profile, passwordHash, createdAt, status, children, ...data } = u
          supabase.from('profiles').update({ name: u.name, role: u.role, data }).eq('id', id).then(({ error }) => error && console.warn('[cloud] profile update failed:', error.message))
        }
      },
      changePassword: async (id, current, next) => {
        if (get().cloud) { if (next.length < 6) throw new Error('New password must be at least 6 characters.'); const { error } = await supabase.auth.updateUser({ password: next }); if (error) throw new Error(error.message); return }
        const u = get().users.find((x) => x.id === id)
        const ok = u.passwordHash === DEMO_PASSWORD_HASH ? current === 'demo1234' : u.passwordHash === (await hashPassword(current))
        if (!ok) throw new Error('Current password is incorrect.')
        if (next.length < 6) throw new Error('New password must be at least 6 characters.')
        const passwordHash = await hashPassword(next)
        get().updateUser(id, { passwordHash })
      },
      addChild: (parentId, { name, age, grade }) => {
        const cid = uid('u'); const [cf, ...cr] = name.trim().split(' ')
        const parent = get().users.find((u) => u.id === parentId)
        const child = { id: cid, role: 'student', name: name.trim(), firstName: cf, lastName: cr.join(' ') || parent?.lastName || '', email: `${cid}@child.local`, passwordHash: 'child', timezone: parent?.timezone, age: age ? Number(age) : null, grade: grade || '', parentId, createdAt: new Date().toISOString(), status: 'active', points: 0, streak: 0 }
        set((s) => ({ users: [...s.users.map((u) => (u.id === parentId ? { ...u, children: [...(u.children || []), cid] } : u)), child] }))
        return child
      },

      // ---------- cart / wishlist ----------
      addToCart: (userId, item) => set((s) => { const cart = s.carts[userId] || []; if (cart.some((c) => c.courseId === item.courseId && c.studentId === item.studentId)) return {}; return { carts: { ...s.carts, [userId]: [...cart, { id: uid('ci'), ...item }] } } }),
      updateCartItem: (userId, id, patch) => set((s) => ({ carts: { ...s.carts, [userId]: (s.carts[userId] || []).map((c) => (c.id === id ? { ...c, ...patch } : c)) } })),
      removeFromCart: (userId, id) => set((s) => ({ carts: { ...s.carts, [userId]: (s.carts[userId] || []).filter((c) => c.id !== id) } })),
      clearCart: (userId) => set((s) => ({ carts: { ...s.carts, [userId]: [] } })),
      toggleWishlist: (userId, courseId) => set((s) => { const w = s.wishlists[userId] || []; return { wishlists: { ...s.wishlists, [userId]: w.includes(courseId) ? w.filter((c) => c !== courseId) : [...w, courseId] } } }),

      // ---------- enrollments / checkout ----------
      checkout: ({ parentId, items, method = 'Demo card •••• 4242', discount = 0, subtotal, total }) => {
        const s = get()
        const now = new Date()
        const newEnrollments = []; const newSessions = []
        for (const item of items) {
          const course = COURSES.find((c) => c.id === item.courseId)
          const plan = course.plans.find((p) => p.id === item.plan) || course.plans[0]
          const slots = item.slots && item.slots.length ? item.slots : defaultSlots(plan.perWeek)
          const e = { id: uid('enr'), courseId: course.id, studentId: item.studentId, parentId, teacherId: course.teacherId, plan: plan.id, perWeek: plan.perWeek, slots, startDate: now.toISOString(), status: 'active', price: plan.price, createdAt: now.toISOString() }
          newEnrollments.push(e)
          // generate 8 weeks of sessions
          let d = startOfDay(now)
          const end = addWeeks(now, 8)
          while (d <= end) {
            for (const sl of slots) if (d.getDay() === sl.day) { const start = at(d, sl.time); if (start > now) newSessions.push({ id: uid('ses'), enrollmentId: e.id, courseId: course.id, teacherId: course.teacherId, studentIds: [item.studentId], start: start.toISOString(), end: addMinutes(start, course.category === 'little-muslims' ? 30 : 45).toISOString(), status: 'scheduled', type: 'regular', topic: '', attendance: {}, createdAt: now.toISOString() }) }
            d = addDays(d, 1)
          }
        }
        const payment = { id: uid('pay'), parentId, items: items.map((i) => ({ courseId: i.courseId, studentId: i.studentId, plan: i.plan, price: COURSES.find((c) => c.id === i.courseId).plans.find((p) => p.id === i.plan).price })), subtotal, discount, total, status: 'paid', method, at: now.toISOString(), invoice: `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}` }
        set({ enrollments: [...s.enrollments, ...newEnrollments], sessions: [...s.sessions, ...newSessions], payments: [payment, ...s.payments], carts: { ...s.carts, [parentId]: [] } })
        const teacherUser = (tid) => s.users.find((u) => u.role === 'teacher' && u.teacherId === tid)
        items.forEach((i) => { const c = COURSES.find((x) => x.id === i.courseId); const st = s.users.find((u) => u.id === i.studentId); const tu = teacherUser(c.teacherId); if (tu) get().notify(tu.id, 'New enrollment', `${st?.name || 'A student'} enrolled in ${c.title} (${i.plan} plan).`, 'success') })
        get().notify(parentId, 'Payment successful', `Your payment of $${total.toFixed(2)} was received. Sessions have been added to your schedule.`, 'success')
        return payment
      },
      pauseEnrollment: (id, status) => set((s) => ({ enrollments: s.enrollments.map((e) => (e.id === id ? { ...e, status } : e)) })),

      // ---------- trials ----------
      bookTrial: (trial) => { const t = { id: uid('tr'), status: 'scheduled', assessment: null, createdAt: new Date().toISOString(), ...trial }; set((s) => ({ trials: [...s.trials, t] })); const s = get(); const tu = s.users.find((u) => u.role === 'teacher' && u.teacherId === t.teacherId); if (tu) get().notify(tu.id, 'New free trial booked', `${t.studentName} booked a trial for ${COURSES.find((c) => c.id === t.courseId)?.title}.`, 'info'); return t },
      updateTrial: (id, patch) => set((s) => ({ trials: s.trials.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      submitTrialAssessment: (id, assessment) => set((s) => ({ trials: s.trials.map((t) => (t.id === id ? { ...t, status: 'completed', assessment: { ...assessment, submittedAt: new Date().toISOString() } } : t)) })),

      // ---------- sessions ----------
      updateSession: (id, patch) => set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      startSession: (id) => { const s = get(); const sess = s.sessions.find((x) => x.id === id); if (!sess) return; if (sess.status === 'scheduled' || sess.status === 'missed') get().updateSession(id, { status: 'live', startedAt: new Date().toISOString() }) },
      endSession: (id, { topic, attendance, recorded, durationMin } = {}) => {
        const s = get(); const sess = s.sessions.find((x) => x.id === id); if (!sess) return
        const patch = { status: 'completed', endedAt: new Date().toISOString(), topic: topic ?? sess.topic, attendance: attendance || sess.attendance }
        let recordings = s.recordings
        if (recorded) { const r = { id: uid('rec'), sessionId: id, courseId: sess.courseId, teacherId: sess.teacherId, studentIds: sess.studentIds, title: `${COURSES.find((c) => c.id === sess.courseId)?.title} — ${patch.topic || 'Lesson'}`, duration: durationMin || 45, status: 'ready', start: sess.start, sizeMb: 140, createdAt: new Date().toISOString() }; recordings = [r, ...recordings]; patch.recordingId = r.id }
        set({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)), recordings })
      },
      cancelSession: (id, reason = '') => get().updateSession(id, { status: 'cancelled', cancelReason: reason }),
      markAttendance: (id, studentId, present) => set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, attendance: { ...x.attendance, [studentId]: present } } : x)) })),
      addSession: (sess) => { const x = { id: uid('ses'), status: 'scheduled', type: 'regular', topic: '', attendance: {}, createdAt: new Date().toISOString(), ...sess }; set((s) => ({ sessions: [...s.sessions, x] })); return x },
      deleteRecording: (id) => set((s) => ({ recordings: s.recordings.filter((r) => r.id !== id) })),

      // ---------- availability ----------
      addAvailability: (userId, slot) => set((s) => ({ availability: { ...s.availability, [userId]: [...(s.availability[userId] || []), { id: uid('av'), ...slot }] } })),
      removeAvailability: (userId, id) => set((s) => ({ availability: { ...s.availability, [userId]: (s.availability[userId] || []).filter((a) => a.id !== id) } })),

      // ---------- messages ----------
      startConversation: (participantIds) => { const s = get(); const existing = s.conversations.find((c) => c.participantIds.length === participantIds.length && participantIds.every((p) => c.participantIds.includes(p))); if (existing) return existing.id; const id = uid('conv'); set({ conversations: [{ id, participantIds, messages: [], createdAt: new Date().toISOString() }, ...s.conversations] }); return id },
      sendMessage: (convId, senderId, text, extra = {}) => { const msg = { id: uid('msg'), senderId, text, at: new Date().toISOString(), readBy: [senderId], ...extra }; set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)) })); const conv = get().conversations.find((c) => c.id === convId); const sender = get().users.find((u) => u.id === senderId); conv?.participantIds.filter((p) => p !== senderId).forEach((p) => get().notify(p, `New message from ${sender?.name || 'someone'}`, text.slice(0, 80), 'info')); return msg },
      markConversationRead: (convId, userId) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: c.messages.map((m) => (m.readBy?.includes(userId) ? m : { ...m, readBy: [...(m.readBy || []), userId] })) } : c)) })),

      // ---------- homework ----------
      createHomework: (hw) => { const x = { id: uid('hw'), status: 'assigned', createdAt: new Date().toISOString(), conversation: [], ...hw }; set((s) => ({ homework: [x, ...s.homework] })); get().notify(x.studentId, 'New homework assigned', x.title, 'info'); const st = get().users.find((u) => u.id === x.studentId); if (st?.parentId) get().notify(st.parentId, `New homework for ${st.firstName}`, x.title, 'info'); return x },
      submitHomework: (id, submission) => { set((s) => ({ homework: s.homework.map((h) => (h.id === id ? { ...h, status: 'submitted', submission: { ...submission, at: new Date().toISOString() } } : h)) })); const h = get().homework.find((x) => x.id === id); const tu = get().users.find((u) => u.role === 'teacher' && u.teacherId === h?.teacherId); if (tu) get().notify(tu.id, 'New homework submission', `${get().users.find((u) => u.id === h.studentId)?.name} submitted “${h.title}”.`, 'info') },
      gradeHomework: (id, { grade, feedback, status = 'graded' }) => { set((s) => ({ homework: s.homework.map((h) => (h.id === id ? { ...h, status, grade: status === 'graded' ? grade : h.grade, gradeFeedback: feedback } : h)) })); const h = get().homework.find((x) => x.id === id); get().notify(h.studentId, status === 'graded' ? 'Homework graded' : 'Revision requested', status === 'graded' ? `You scored ${grade}/100 on “${h.title}”.` : `Please revise “${h.title}”.`, status === 'graded' ? 'success' : 'warning') },
      addHomeworkMessage: (id, msg) => set((s) => ({ homework: s.homework.map((h) => (h.id === id ? { ...h, conversation: [...(h.conversation || []), { id: uid('hm'), at: new Date().toISOString(), ...msg }] } : h)) })),
      deleteHomework: (id) => set((s) => ({ homework: s.homework.filter((h) => h.id !== id) })),

      // ---------- lessons ----------
      createLesson: (l) => { const x = { id: uid('les'), published: false, createdAt: new Date().toISOString(), ...l }; set((s) => ({ lessons: [...s.lessons, x] })); return x },
      updateLesson: (id, patch) => set((s) => ({ lessons: s.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      deleteLesson: (id) => set((s) => ({ lessons: s.lessons.filter((l) => l.id !== id) })),

      // ---------- feedback / reviews ----------
      submitFeedback: (fb) => { const x = { id: uid('fb'), createdAt: new Date().toISOString(), ...fb }; set((s) => ({ feedback: [x, ...s.feedback] })); const st = get().users.find((u) => u.id === fb.studentId); if (st?.parentId) get().notify(st.parentId, `Lesson feedback for ${st.firstName}`, `Learned: ${fb.learned?.slice(0, 60)}`, 'info'); return x },
      addReview: (r) => set((s) => ({ reviews: [{ id: uid('rev'), at: new Date().toISOString(), ...r }, ...s.reviews] })),

      // ---------- proposals / requests ----------
      createProposal: (p) => { const x = { id: uid('prop'), status: 'pending', createdAt: new Date().toISOString(), ...p }; set((s) => ({ proposals: [x, ...s.proposals] })); return x },
      createRescheduleRequest: (r) => { const x = { id: uid('rr'), status: 'pending', createdAt: new Date().toISOString(), ...r }; set((s) => ({ rescheduleRequests: [x, ...s.rescheduleRequests] })); const tu = get().users.find((u) => u.role === 'teacher' && u.teacherId === r.teacherId); if (tu) get().notify(tu.id, 'Reschedule request', r.reason || 'A parent requested a new time.', 'warning'); return x },
      decideReschedule: (id, status, note = '') => { set((s) => ({ rescheduleRequests: s.rescheduleRequests.map((r) => (r.id === id ? { ...r, status, note, decidedAt: new Date().toISOString() } : r)) })); const r = get().rescheduleRequests.find((x) => x.id === id); if (status === 'approved' && r?.sessionId) { const sess = get().sessions.find((x) => x.id === r.sessionId); if (sess) { const dur = (new Date(sess.end) - new Date(sess.start)) / 60000; get().updateSession(sess.id, { start: r.newStart, end: addMinutes(new Date(r.newStart), dur).toISOString() }) } } if (r) get().notify(r.requesterId, `Reschedule ${status}`, note || `Your request was ${status}.`, status === 'approved' ? 'success' : 'warning') },
      requestCompletion: (req) => { const x = { id: uid('ap'), status: 'pending', requestedAt: new Date().toISOString(), ...req }; set((s) => ({ approvalRequests: [x, ...s.approvalRequests] })); const tu = get().users.find((u) => u.role === 'teacher' && u.teacherId === req.teacherId); if (tu) get().notify(tu.id, 'Completion approval request', `${get().users.find((u) => u.id === req.studentId)?.name} requested course completion.`, 'info'); return x },
      decideApproval: (id, status, note = '') => { set((s) => ({ approvalRequests: s.approvalRequests.map((a) => (a.id === id ? { ...a, status, decisionNote: note, decidedAt: new Date().toISOString() } : a)) })); const a = get().approvalRequests.find((x) => x.id === id); if (!a) return; if (status === 'approved') { const course = COURSES.find((c) => c.id === a.courseId); const cert = { id: uid('cert'), studentId: a.studentId, courseId: a.courseId, teacherId: a.teacherId, title: `${course?.title} — Completion`, issuedAt: new Date().toISOString(), code: `BA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}` }; set((s) => ({ certificates: [cert, ...s.certificates] })); get().notify(a.studentId, 'Certificate issued!', `Congratulations — your certificate for ${course?.title} is ready.`, 'success') } else get().notify(a.studentId, status === 'rejected' ? 'Completion request declined' : 'Remediation required', note, 'warning') },

      // ---------- finances ----------
      setPayoutMethod: (userId, method) => set((s) => ({ payoutMethods: { ...s.payoutMethods, [userId]: method } })),
      requestWithdrawal: (userId, amount) => set((s) => ({ withdrawals: [{ id: uid('wd'), userId, amount, status: 'processing', at: new Date().toISOString() }, ...s.withdrawals] })),

      // ---------- marketing forms ----------
      addLead: (lead) => set((s) => ({ leads: [{ id: uid('lead'), at: new Date().toISOString(), ...lead }, ...s.leads] })),
      addApplication: (app) => set((s) => ({ applications: [{ id: uid('app'), at: new Date().toISOString(), status: 'pending', ...app }, ...s.applications] })),
      addCustomPlanRequest: (r) => set((s) => ({ customPlanRequests: [{ id: uid('cpr'), at: new Date().toISOString(), ...r }, ...s.customPlanRequests] })),

      // ---------- cloud plumbing ----------
      cloudRefresh: async (userId) => {
        try {
          const loaded = await loadCloudState(supabase)
          resetShadow(loaded)
          set({ ...loaded, currentUserId: userId ?? get().currentUserId, cloudReady: true })
        } catch (e) { console.warn('[cloud] load failed', e); set({ cloudReady: true }); toast({ title: 'Cloud connection problem', desc: e.message, type: 'error' }) }
      },
      useLocalSandbox: () => { setLocalModeForced(true); window.location.href = import.meta.env.BASE_URL },
      backToCloud: () => { setLocalModeForced(false); window.location.href = import.meta.env.BASE_URL },
    }),
    {
      name: 'bright-academy-store',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => (cloudActive() ? { getItem: () => null, setItem: () => {}, removeItem: () => {} } : localStorage)),
      migrate: (persisted, version) => (version === SCHEMA_VERSION ? persisted : buildSeed()),
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')),
    },
  ),
)

function defaultSlots(perWeek) { const days = [1, 3, 5]; return days.slice(0, perWeek).map((day) => ({ day, time: '17:00' })) }

// ---------- selectors (pure functions over state) ----------
export const selectCurrentUser = (s) => s.users.find((u) => u.id === s.currentUserId) || null
export const useCurrentUser = () => useStore(selectCurrentUser)
export const userById = (s, id) => s.users.find((u) => u.id === id)
export const teacherUserFor = (s, teacherId) => s.users.find((u) => u.role === 'teacher' && u.teacherId === teacherId)
export const childrenOf = (s, parentId) => s.users.filter((u) => u.role === 'student' && u.parentId === parentId)
export const effectiveStatus = (sess, now = new Date()) => { if (sess.status === 'scheduled' && new Date(sess.end) < now) return 'missed'; return sess.status }
export const isJoinable = (sess, now = new Date()) => { const start = new Date(sess.start), end = new Date(sess.end); return sess.status === 'live' || (['scheduled'].includes(sess.status) && now >= addMinutes(start, -10) && now <= addMinutes(end, 15)) }
export const sessionsForTeacher = (s, teacherId) => s.sessions.filter((x) => x.teacherId === teacherId)
export const sessionsForStudent = (s, studentId) => s.sessions.filter((x) => x.studentIds.includes(studentId))
export const sessionsForParent = (s, parentId) => { const kids = childrenOf(s, parentId).map((k) => k.id); return s.sessions.filter((x) => x.studentIds.some((id) => kids.includes(id))) }
export const enrollmentsForStudent = (s, studentId) => s.enrollments.filter((e) => e.studentId === studentId)
export const unreadCount = (s, userId) => s.conversations.filter((c) => c.participantIds.includes(userId)).reduce((n, c) => n + c.messages.filter((m) => m.senderId !== userId && !(m.readBy || []).includes(userId)).length, 0)
export const unreadNotifications = (s, userId) => s.notifications.filter((n) => n.userId === userId && !n.read).length
export const EMPTY = []
export const EMPTY_OBJ = {}
// ---------- cloud boot: restore session, initial load, realtime, write-through ----------
if (typeof window !== 'undefined') {
  window.__ba = useStore
  if (cloudActive() && supabase) {
    useStore.setState({ cloudReady: false })
    supabase.auth.getSession().then(({ data }) => useStore.getState().cloudRefresh(data.session?.user?.id ?? null))
    supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') useStore.setState({ currentUserId: null }) })
    subscribeRealtime(supabase, useStore.setState, null)
    useStore.subscribe((state) => diffAndPush(state, supabase))
  }
}
export const cloudEnabled = CLOUD_CONFIGURED
