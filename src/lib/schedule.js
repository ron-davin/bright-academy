// Pure scheduling helpers — no React, no store. Times are interpreted in the browser's local timezone.
export const WINDOW_WEEKS = 8
const DAY_MS = 864e5

export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const startOfWeek = (d) => { const x = startOfDay(d); const dow = (x.getDay() + 6) % 7; return addDays(x, -dow) } // Monday
export const weekDays = (d) => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(d), i))
export const at = (date, hhmm) => { const [h, m] = hhmm.split(':').map(Number); const x = startOfDay(date); x.setHours(h, m, 0, 0); return x }
export const ymd = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
export const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }

// Key that identifies one occurrence of a class, stable even if the session is later moved.
export const occurrenceKey = (classId, startISO) => `${classId}@${new Date(startISO).toISOString()}`

/** Expand a class's weekly slots into occurrences between [from, to). */
export function expandClass(cls, from, to) {
  const out = []
  const first = startOfDay(Math.max(+fromYmd(cls.startDate), +startOfDay(from)))
  const last = cls.endDate ? addDays(fromYmd(cls.endDate), 1) : to
  const stop = new Date(Math.min(+last, +to))
  for (let d = first; d < stop; d = addDays(d, 1)) {
    for (const slot of cls.slots || []) {
      if (d.getDay() !== slot.day) continue
      const start = at(d, slot.time)
      if (start < from) continue
      out.push({ start: start.toISOString(), end: new Date(+start + slot.minutes * 6e4).toISOString() })
    }
  }
  return out
}

const sessionFrom = (cls, occ, id) => ({
  id, classId: cls.id, subjectId: cls.subjectId, teacherId: cls.teacherId, studentIds: [...cls.studentIds],
  start: occ.start, end: occ.end, origStart: occ.start, status: 'scheduled', topic: '', homework: '', attendance: {}, oneOff: false,
})

/** Sessions missing from the rolling window for active classes (idempotent). */
export function topUpSessions(classes, sessions, now, makeId, weeks = WINDOW_WEEKS) {
  const have = new Set(sessions.filter((s) => s.classId).map((s) => occurrenceKey(s.classId, s.origStart || s.start)))
  const to = addDays(startOfDay(now), weeks * 7)
  const out = []
  for (const cls of classes) {
    if (cls.status !== 'active') continue
    for (const occ of expandClass(cls, startOfDay(now), to)) {
      if (have.has(occurrenceKey(cls.id, occ.start))) continue
      have.add(occurrenceKey(cls.id, occ.start))
      out.push(sessionFrom(cls, occ, makeId()))
    }
  }
  return out
}

/** After editing a class: drop its future, untouched, generated sessions and regenerate them. Past and one-off sessions are kept. */
export function regenerateFuture(cls, sessions, now, makeId, weeks = WINDOW_WEEKS) {
  const removeIds = sessions
    .filter((s) => s.classId === cls.id && !s.oneOff && s.status === 'scheduled' && new Date(s.start) > now && !s.moved)
    .map((s) => s.id)
  const kept = sessions.filter((s) => !removeIds.includes(s.id))
  const add = cls.status === 'active' ? topUpSessions([cls], kept, now, makeId, weeks).filter((s) => new Date(s.start) > now) : []
  return { removeIds, add }
}

const overlaps = (a, b) => new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)

/** Double-bookings for proposed occurrences. Returns [{who:'teacher'|'student', personId, existing}]. */
export function findConflicts(proposed, sessions, { teacherId, studentIds = [], ignoreClassId, ignoreSessionId } = {}) {
  const live = sessions.filter((s) => s.status !== 'cancelled' && s.id !== ignoreSessionId && (!ignoreClassId || s.classId !== ignoreClassId))
  const out = []
  for (const p of proposed) {
    for (const s of live) {
      if (!overlaps(p, s)) continue
      if (teacherId && s.teacherId === teacherId) out.push({ who: 'teacher', personId: teacherId, existing: s, at: p.start })
      for (const sid of studentIds) if ((s.studentIds || []).includes(sid)) out.push({ who: 'student', personId: sid, existing: s, at: p.start })
    }
  }
  return out
}

/** Weekly slots that fall outside every availability window of the teacher. */
export function outsideAvailability(slots, windows = []) {
  if (!windows.length) return []
  return slots.filter((slot) => {
    const s = toMin(slot.time), e = s + slot.minutes
    return !windows.some((w) => w.day === slot.day && toMin(w.from) <= s && e <= toMin(w.to))
  })
}

export const isJoinable = (sess, now = new Date()) => sess.status === 'live' || (sess.status === 'scheduled' && now >= new Date(+new Date(sess.start) - 10 * 6e4) && now <= new Date(+new Date(sess.end) + 15 * 6e4))
export const sameDay = (a, b) => ymd(a) === ymd(b)
export { DAY_MS }
