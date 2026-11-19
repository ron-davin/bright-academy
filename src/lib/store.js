import { create } from 'zustand'
import { supabase, loadCloudState, diffAndPush, resetShadow, subscribeRealtime, buildStateFromRows } from './cloud.js'
import { topUpSessions, regenerateFuture } from './schedule.js'
import { uid } from './utils.js'
import { setSubjectRecords } from './data.js'

// ---------- UI store (toasts) ----------
export const useUI = create((set) => ({
  toasts: [],
  toast: (t) => {
    const id = uid('toast'); const item = { id, type: 'info', ...(typeof t === 'string' ? { title: t } : t) }
    set((s) => ({ toasts: [...s.toasts, item] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), item.duration || 3500)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
export const toast = (t) => useUI.getState().toast(t)

const OFFLINE_MSG = 'Can’t reach the academy server right now (it may be waking up). Please try again in a minute.'
const nowISO = () => new Date().toISOString()

export const useStore = create((set, get) => ({
  ...buildStateFromRows([], []),
  currentUserId: null,
  ready: false,

  // ---------- auth ----------
  signIn: async (email, password) => {
    let res
    try { res = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }) } catch { throw new Error(OFFLINE_MSG) }
    const { data, error } = res
    if (error) throw new Error(/fetch|network/i.test(error.message) ? OFFLINE_MSG : error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
    await get().refresh(data.user.id)
    const me = get().users.find((u) => u.id === data.user.id)
    if (me && me.active === false) { await get().signOut(); throw new Error('This account is deactivated. Please contact the academy admin.') }
    return me
  },
  signOut: async () => { try { await supabase.auth.signOut() } catch { /* offline */ } resetShadow(null); set({ ...buildStateFromRows([], []), currentUserId: null, ready: true }) },
  changePassword: async (next) => { if (next.length < 8) throw new Error('Use at least 8 characters.'); const { error } = await supabase.auth.updateUser({ password: next }); if (error) throw new Error(error.message) },
  updateProfile: async (patch) => {
    const me = get().users.find((u) => u.id === get().currentUserId); if (!me) return
    const next = { ...me, ...patch }
    set((s) => ({ users: s.users.map((u) => (u.id === me.id ? next : u)) }))
    const { id, role, email, name, firstName, createdAt, ...data } = next
    const { error } = await supabase.from('profiles').update({ name: next.name, data }).eq('id', me.id)
    if (error) throw new Error(error.message)
  },

  refresh: async (userId) => {
    let lastErr = null
    for (let i = 0; i < 3; i++) { // fresh tokens can 401 for ~1s ("JWT issued at future")
      try {
        const loaded = await loadCloudState(supabase)
        resetShadow(loaded)
        set({ ...loaded, currentUserId: userId === undefined ? get().currentUserId : userId, ready: true })
        if (get().me()?.role === 'admin') get().topUp()
        return
      } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 1200)) }
    }
    console.warn('[cloud] load failed', lastErr)
    set({ ready: true, currentUserId: userId === undefined ? get().currentUserId : userId })
    toast({ title: 'Connection problem', desc: lastErr?.message || OFFLINE_MSG, type: 'error' })
  },
  me: () => get().users.find((u) => u.id === get().currentUserId) || null,

  // ---------- classes & sessions (admin) ----------
  topUp: () => {
    const add = topUpSessions(get().classes, get().sessions, new Date(), () => uid('ses'))
    if (add.length) set((s) => ({ sessions: [...s.sessions, ...add] }))
  },
  createClass: (cls) => {
    const c = { id: uid('cls'), status: 'active', createdAt: nowISO(), notes: '', ...cls }
    const add = topUpSessions([c], get().sessions, new Date(), () => uid('ses'))
    set((s) => ({ classes: [c, ...s.classes], sessions: [...s.sessions, ...add] }))
    return c
  },
  updateClass: (id, patch) => {
    const cls = { ...get().classes.find((c) => c.id === id), ...patch }
    const { removeIds, add } = regenerateFuture(cls, get().sessions, new Date(), () => uid('ses'))
    // keep student/teacher in sync on remaining future one-offs and moved sessions
    const sync = (x) => (x.classId === id && new Date(x.start) > new Date() && x.status === 'scheduled' ? { ...x, teacherId: cls.teacherId, studentIds: [...cls.studentIds], subjectId: cls.subjectId } : x)
    set((s) => ({ classes: s.classes.map((c) => (c.id === id ? cls : c)), sessions: [...s.sessions.filter((x) => !removeIds.includes(x.id)).map(sync), ...add] }))
  },
  deleteClass: (id) => set((s) => ({ classes: s.classes.filter((c) => c.id !== id), sessions: s.sessions.filter((x) => !(x.classId === id && x.status === 'scheduled' && new Date(x.start) > new Date())) })),
  updateSession: (id, patch) => set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  moveSession: (id, start, end) => get().updateSession(id, { start, end, moved: true }),
  addOneOff: (sess) => { const x = { id: uid('ses'), status: 'scheduled', topic: '', homework: '', attendance: {}, oneOff: true, ...sess }; set((s) => ({ sessions: [...s.sessions, x] })); return x },
  startSession: (id) => { const x = get().sessions.find((s) => s.id === id); if (x && x.status === 'scheduled') get().updateSession(id, { status: 'live', startedAt: nowISO() }) },
  endSession: (id) => get().updateSession(id, { status: 'completed', endedAt: nowISO() }),

  // ---------- availability ----------
  setAvailability: (teacherId, windows) => set((s) => ({ availability: { ...s.availability, [teacherId]: windows } })),

  // ---------- subjects (admin) ----------
  saveSubject: (subj) => set((s) => {
    const rest = { ...subj }; delete rest.builtIn; delete rest.color; delete rest.dot
    const exists = s.subjects.some((x) => x.id === subj.id)
    return { subjects: exists ? s.subjects.map((x) => (x.id === subj.id ? { ...x, ...rest } : x)) : [...s.subjects, { createdAt: nowISO(), ...rest }] }
  }),
  removeSubject: (id) => set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) })),

  // ---------- academy settings (admin) ----------
  setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

  // ---------- leads (public trial form) ----------
  addLead: (lead) => set((s) => ({ leads: [{ id: uid('lead'), at: nowISO(), handled: false, ...lead }, ...s.leads] })),
  updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

  // ---------- admin: accounts (server-side function holds the service key) ----------
  adminUsers: async (action, payload) => {
    const { data } = await supabase.auth.getSession()
    const res = await fetch('/.netlify/functions/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ action, ...payload }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
    await get().refresh()
    return body
  },
}))

export const useMe = () => useStore((s) => s.users.find((u) => u.id === s.currentUserId) || null)
export const EMPTY = []

// ---------- boot: restore session, load, realtime, write-through ----------
if (typeof window !== 'undefined' && supabase) {
  window.__ba = useStore
  supabase.auth.getSession().then(({ data }) => useStore.getState().refresh(data.session?.user?.id ?? null))
  supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') useStore.setState({ currentUserId: null }) })
  subscribeRealtime(supabase, useStore.setState, null)
  useStore.subscribe((state, prev) => { if (state.subjects !== prev.subjects) setSubjectRecords(state.subjects); if (state.ready) diffAndPush(state, supabase) })
}
