import React, { useState } from 'react'
import { CalendarDays, Clock, Save } from 'lucide-react'
import { useStore, useMe, toast } from '../../lib/store.js'
import { subjectById } from '../../lib/data.js'
import { startOfWeek, sameDay, addDays } from '../../lib/schedule.js'
import { usePeople, SessionRow, WeekCalendar, SubjectChip, ClassStartButtons, VideoBadge, AvailabilityEditor, SubjectIcon, names, weeklySummary } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Dialog, EmptyState, Input, Textarea } from '../../components/ui/index.jsx'
import { cn, fmtTime, greeting } from '../../lib/utils.js'

const byStart = (a, b) => new Date(a.start) - new Date(b.start)
const useMySessions = () => { const me = useMe(); return useStore((s) => s.sessions).filter((x) => x.teacherId === me?.id) }

export function TeacherSessionPanel({ sess, onClose }) {
  const { byId } = usePeople()
  const updateSession = useStore((s) => s.updateSession)
  const [f, setF] = useState({ topic: sess.topic || '', homework: sess.homework || '', attendance: { ...(sess.attendance || {}) } })
  const past = new Date(sess.start) < new Date()
  const save = () => { updateSession(sess.id, f); toast({ title: 'Saved', type: 'success' }); onClose() }
  return (
    <Dialog open onClose={onClose} size="md" title={subjectById(sess.subjectId).name} desc={`${new Date(sess.start).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · ${fmtTime(sess.start)}–${fmtTime(sess.end)}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-gray-600"><span className="text-gray-400">Students:</span> {names(sess.studentIds, byId)}</p><VideoBadge sess={sess} /></div>
        <ClassStartButtons sess={sess} teacher />
        {sess.status === 'cancelled' && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">This session was cancelled by the academy.</p>}
        <Input app label="Lesson topic" placeholder="e.g. Fractions — adding with different denominators" value={f.topic} onChange={(e) => setF((x) => ({ ...x, topic: e.target.value }))} />
        <Textarea app label="Homework (students see this)" rows={3} placeholder="What should the student practise before next class?" value={f.homework} onChange={(e) => setF((x) => ({ ...x, homework: e.target.value }))} />
        {past && <div><span className="label">Attendance</span>{sess.studentIds.map((id) => (
          <label key={id} className="flex items-center justify-between rounded-xl px-1 py-2 text-sm"><span>{byId[id]?.name}</span>
            <span className="tabs">{[[true, 'Present'], [false, 'Absent']].map(([v, l]) => <button key={l} type="button" onClick={() => setF((x) => ({ ...x, attendance: { ...x.attendance, [id]: v } }))} className={cn('tab', f.attendance[id] === v && 'tab-active')}>{l}</button>)}</span></label>))}</div>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><Button app variant="outline" onClick={onClose}>Close</Button><Button app onClick={save}><Save className="h-4 w-4" /> Save</Button></div>
      </div>
    </Dialog>
  )
}

export function TeacherToday() {
  const me = useMe()
  const { byId } = usePeople()
  const mine = useMySessions().filter((s) => s.status !== 'cancelled').sort(byStart)
  const [open, setOpen] = useState(null)
  const now = new Date()
  const today = mine.filter((s) => sameDay(s.start, now))
  const next = mine.find((s) => new Date(s.end) > now)
  const upcoming = mine.filter((s) => new Date(s.start) > now && !sameDay(s.start, now)).slice(0, 5)
  return (
    <div>
      <PageTitle title={`${greeting()}, ${me.firstName || me.name}`} subtitle={today.length ? `You have ${today.length} class${today.length > 1 ? 'es' : ''} today.` : 'No classes today.'} />
      {next && (
        <div className="app-card mb-6 flex flex-col gap-5 border-brand-200 bg-brand-50/40 p-6 sm:flex-row sm:items-center">
          <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border', subjectById(next.subjectId).color)}><SubjectIcon subjectId={next.subjectId} className="h-7 w-7" /></span>
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-700">{next.status === 'live' ? 'Happening now' : sameDay(next.start, now) ? 'Next class' : `Next class · ${new Date(next.start).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}</p>
            <p className="mt-0.5 text-xl font-semibold text-ink">{subjectById(next.subjectId).name} · {fmtTime(next.start)}–{fmtTime(next.end)}</p>
            <p className="text-gray-600">{names(next.studentIds, byId)}</p>
          </div>
          <div className="flex flex-wrap items-start gap-2"><ClassStartButtons sess={next} teacher /><Button app variant="outline" onClick={() => setOpen(next)}>Lesson notes</Button></div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="app-card p-4"><h2 className="mb-2 px-2 font-semibold">Today</h2>
          {today.length ? today.map((s) => <SessionRow key={s.id} sess={s} who={names(s.studentIds, byId)} onClick={() => setOpen(s)} />) : <EmptyState icon={Clock} title="Nothing today" />}</section>
        <section className="app-card p-4"><h2 className="mb-2 px-2 font-semibold">Coming up</h2>
          {upcoming.length ? upcoming.map((s) => <SessionRow key={s.id} sess={s} showDate who={names(s.studentIds, byId)} onClick={() => setOpen(s)} />) : <EmptyState icon={CalendarDays} title="No upcoming classes" desc="The academy admin schedules your classes." />}</section>
      </div>
      {open && <TeacherSessionPanel sess={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

export function TeacherSchedule() {
  const me = useMe()
  const { byId } = usePeople()
  const mine = useMySessions()
  const availability = useStore((s) => s.availability[me.id]) || []
  const [week, setWeek] = useState(startOfWeek(new Date()))
  const [open, setOpen] = useState(null)
  return (
    <div>
      <PageTitle title="My schedule" subtitle="Click a class to add the topic, homework or attendance. Shaded = your available hours." />
      <WeekCalendar week={week} onWeek={setWeek} sessions={mine} availability={availability} label={(s) => names(s.studentIds, byId)} onSessionClick={setOpen} />
      {open && <TeacherSessionPanel sess={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

export function TeacherStudents() {
  const me = useMe()
  const { byId } = usePeople()
  const classes = useStore((s) => s.classes).filter((c) => c.teacherId === me.id && c.status === 'active')
  const sessions = useMySessions()
  const ids = [...new Set(classes.flatMap((c) => c.studentIds))]
  return (
    <div>
      <PageTitle title="My students" subtitle={`${ids.length} student${ids.length === 1 ? '' : 's'} in ${classes.length} class${classes.length === 1 ? '' : 'es'}.`} />
      {ids.length === 0 ? <div className="app-card"><EmptyState icon={CalendarDays} title="No students yet" desc="Students appear here once the admin adds them to your classes." /></div> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ids.map((id) => {
            const st = byId[id]; const cls = classes.filter((c) => c.studentIds.includes(id))
            const done = sessions.filter((s) => s.studentIds.includes(id) && s.status !== 'cancelled' && new Date(s.end) < new Date())
            const attended = done.filter((s) => s.attendance?.[id] !== false).length
            return (
              <div key={id} className="app-card p-5">
                <p className="font-semibold text-ink">{st?.name || 'Student'}</p>
                <p className="text-sm text-gray-500">{[st?.age && `Age ${st.age}`, st?.grade, st?.email].filter(Boolean).join(' · ')}</p>
                <div className="mt-3 space-y-1.5">{cls.map((c) => <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm"><SubjectChip subjectId={c.subjectId} /><span className="text-gray-600">{weeklySummary(c.slots)}</span></div>)}</div>
                {done.length > 0 && <p className="mt-3 text-xs text-gray-500">Attended {attended} of {done.length} past classes</p>}
                {st?.notes && <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">{st.notes}</p>}
              </div>)
          })}
        </div>
      )}
    </div>
  )
}

export function TeacherAvailability() {
  const me = useMe()
  const current = useStore((s) => s.availability[me.id]) || []
  const setAvailability = useStore((s) => s.setAvailability)
  const [w, setW] = useState(current)
  const dirty = JSON.stringify(w) !== JSON.stringify(current)
  return (
    <div>
      <PageTitle title="My availability" subtitle="Tell the academy which hours you can teach each week. The admin schedules classes inside these hours."
        actions={<Button app disabled={!dirty} onClick={() => { setAvailability(me.id, w); toast({ title: 'Availability saved', type: 'success' }) }}><Save className="h-4 w-4" /> Save</Button>} />
      <div className="app-card px-5 py-2"><AvailabilityEditor windows={w} onChange={setW} /></div>
    </div>
  )
}
export { addDays }
