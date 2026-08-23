import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isToday } from 'date-fns'
import { LayoutDashboard, Users, GraduationCap, Heart, CalendarClock, Sparkles, ListChecks, BarChart3, Film, NotebookPen, Award, MessageSquare, CreditCard, Plus, ArrowRight, Play, Download, Clock, CalendarX, Star, Printer } from 'lucide-react'
import { useStore, useCurrentUser, childrenOf, sessionsForParent, effectiveStatus, EMPTY, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Dialog, EmptyState, Input, PageHeader, Progress, Select, StatCard, Stars, Textarea } from '../../components/ui/index.jsx'
import { MonthCalendar, SessionRow, JoinButton, courseOf, teacherOf } from '../../components/app/Shared.jsx'
import { cn, money, fmtDate, fmtDateTime, fmtTime, byDate, pct, greeting } from '../../lib/utils.js'
import { COURSES } from '../../lib/data.js'
import { CourseCard } from '../../components/marketing/Cards.jsx'

const useParentData = () => {
  const user = useCurrentUser()
  const state = useStore()
  const kids = childrenOf(state, user.id)
  const kidIds = kids.map((k) => k.id)
  const enrollments = state.enrollments.filter((e) => kidIds.includes(e.studentId))
  const sessions = state.sessions.filter((s) => s.studentIds.some((id) => kidIds.includes(id)))
  return { user, state, kids, kidIds, enrollments, sessions }
}
const kidName = (state, id) => state.users.find((u) => u.id === id)?.name || ''

export function ParentDashboard() {
  const { user, state, kids, kidIds, enrollments, sessions } = useParentData()
  const now = new Date()
  const upcoming = sessions.filter((s) => new Date(s.start) > now && s.status === 'scheduled').sort(byDate('start')).slice(0, 5)
  const today = sessions.filter((s) => isToday(new Date(s.start))).sort(byDate('start'))
  const live = sessions.find((s) => s.status === 'live')
  const hw = state.homework.filter((h) => kidIds.includes(h.studentId) && ['assigned', 'revision'].includes(h.status))
  const monthSpend = state.payments.filter((p) => p.parentId === user.id).slice(0, 2).reduce((n, p) => n + p.total, 0) / 2 || 0
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><LayoutDashboard className="h-6 w-6" /></span>
        <div><h1 className="text-2xl font-bold sm:text-3xl">{greeting()}, {user.firstName}!</h1><p className="mt-0.5 text-sm text-ink/60">Here's how your family's learning is going.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Children" value={kids.length} icon={Users} tone="blue" />
        <StatCard title="Active courses" value={enrollments.filter((e) => e.status === 'active').length} icon={GraduationCap} tone="green" />
        <StatCard title="Classes today" value={today.length} desc={today[0] ? `Next: ${fmtTime(today.find((s) => new Date(s.start) > now)?.start || today[0].start)}` : ''} icon={CalendarClock} tone="sky" />
        <StatCard title="Homework due" value={hw.length} desc={hw.length ? 'Awaiting submission' : 'All done!'} icon={NotebookPen} tone={hw.length ? 'sun' : 'default'} />
      </div>
      {live && <Card app className="border-emerald-200"><CardBody className="!p-4 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> <b>{kidName(state, live.studentIds.find((id) => kidIds.includes(id)))}</b> has a live class right now — {courseOf(live.courseId)?.title}</p><JoinButton sess={live} /></CardBody></Card>}
      <div className="grid gap-4 lg:grid-cols-2">
        {kids.map((k) => {
          const kEnr = enrollments.filter((e) => e.studentId === k.id && e.status === 'active')
          const kSess = sessions.filter((s) => s.studentIds.includes(k.id))
          const done = kSess.filter((s) => s.status === 'completed')
          const attended = done.filter((s) => s.attendance?.[k.id] !== false).length
          return (
            <Card app key={k.id}>
              <CardBody className="!p-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-3 font-bold"><Avatar name={k.name} size="md" /> {k.name} <span className="text-sm font-normal text-ink/50">{k.age} yrs · {k.grade}</span></p>
                  <Link to={`/parent/children`} className="text-sm font-semibold text-brand-600 hover:underline">Portal →</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {kEnr.map((e) => { const c = courseOf(e.courseId); const cDone = done.filter((s) => s.courseId === e.courseId).length; const target = c ? c.weeks * e.perWeek : 24; return (
                    <div key={e.id}><p className="flex justify-between text-sm"><span className="font-medium">{c?.emoji} {c?.title}</span><span className="text-ink/50">{cDone}/{target}</span></p><Progress value={pct(cDone, target)} className="mt-1.5" /></div>) })}
                  {kEnr.length === 0 && <p className="text-sm text-ink/50">No active courses — <Link to="/courses" className="font-semibold text-brand-600">browse programs</Link></p>}
                </div>
                <p className="mt-4 flex gap-4 border-t border-ink/5 pt-3 text-xs text-ink/60"><span>✓ {attended} attended</span><span>📊 {pct(attended, done.length || 1)}% attendance</span><span>🔥 {k.streak || 0}-day streak</span></p>
              </CardBody>
            </Card>)
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card app>
          <CardHeader title="Upcoming classes" action={<Button app variant="ghost" size="sm" to="/parent/schedule">View all <ArrowRight className="h-3.5 w-3.5" /></Button>} />
          <CardBody>{upcoming.length === 0 ? <EmptyState icon={CalendarClock} title="Nothing scheduled" /> : <div className="divide-y divide-ink/5">{upcoming.map((s) => <SessionRow key={s.id} sess={s} showDate names={kidName(state, s.studentIds.find((id) => kidIds.includes(id)))} right={<JoinButton sess={s} />} />)}</div>}</CardBody>
        </Card>
        <Card app>
          <CardHeader title="This month" />
          <CardBody className="space-y-3">
            <p className="flex justify-between rounded-xl bg-ink/4 px-4 py-3 text-sm"><span>Monthly tuition</span><b>{money(monthSpend, { cents: true })}</b></p>
            <p className="flex justify-between rounded-xl bg-ink/4 px-4 py-3 text-sm"><span>Completed classes</span><b>{sessions.filter((s) => s.status === 'completed' && new Date(s.start).getMonth() === now.getMonth()).length}</b></p>
            <p className="flex justify-between rounded-xl bg-ink/4 px-4 py-3 text-sm"><span>Teacher feedback received</span><b>{state.feedback.filter((f) => kidIds.includes(f.studentId)).length}</b></p>
            <div className="flex gap-2 pt-1"><Button app size="sm" to="/courses" variant="outline"><Plus className="h-4 w-4" /> Add course</Button><Button app size="sm" to="/trial" variant="outline"><Sparkles className="h-4 w-4" /> Book free trial</Button></div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function ParentChildren() {
  const { user, state, kids, enrollments, sessions } = useParentData()
  const { addChild } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', age: '', grade: '' })
  return (
    <div>
      <PageHeader icon={Users} title="Children" subtitle="Manage your children's profiles and see their learning at a glance." actions={<Button app onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add child</Button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {kids.map((k) => { const kEnr = enrollments.filter((e) => e.studentId === k.id); const done = sessions.filter((s) => s.studentIds.includes(k.id) && s.status === 'completed').length; const certs = state.certificates.filter((c) => c.studentId === k.id).length; return (
          <Card app key={k.id}><CardBody className="!p-5">
            <p className="flex items-center gap-3 text-lg font-bold"><Avatar name={k.name} size="lg" /> {k.name}</p>
            <p className="mt-1 text-sm text-ink/60">{k.age} years · {k.grade || 'Grade not set'} · {k.points || 0} points · {k.streak || 0}-day streak</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">{[[kEnr.length, 'Courses'], [done, 'Lessons done'], [certs, 'Certificates']].map(([v, l]) => <div key={l} className="rounded-xl bg-ink/4 p-3"><p className="text-xl font-bold">{v}</p><p className="text-[11px] text-ink/55">{l}</p></div>)}</div>
            <div className="mt-4 space-y-1.5">{kEnr.map((e) => <p key={e.id} className="flex items-center justify-between rounded-lg border border-ink/8 px-3 py-2 text-sm"><span>{courseOf(e.courseId)?.emoji} {courseOf(e.courseId)?.title}</span><Badge status={e.status} /></p>)}</div>
          </CardBody></Card>) })}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a child">
        <div className="space-y-4">
          <Input app label="Full name" required value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4"><Input app label="Age" type="number" value={f.age} onChange={(e) => setF((x) => ({ ...x, age: e.target.value }))} /><Select app label="Grade" value={f.grade} onChange={(e) => setF((x) => ({ ...x, grade: e.target.value }))}><option value="">Select…</option>{['Pre-school', 'KG', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)].map((g) => <option key={g}>{g}</option>)}</Select></div>
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button app disabled={!f.name} onClick={() => { addChild(user.id, f); setOpen(false); setF({ name: '', age: '', grade: '' }); toast({ title: 'Child added', type: 'success' }) }}>Add child</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function ParentEnrolled() {
  const { state, enrollments } = useParentData()
  const { pauseEnrollment } = useStore()
  return (
    <div>
      <PageHeader icon={GraduationCap} title="Enrolled Courses" subtitle="All active and past enrollments across your children." actions={<Button app to="/courses" variant="outline"><Plus className="h-4 w-4" /> Enroll in more</Button>} />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {enrollments.length === 0 && <EmptyState icon={GraduationCap} title="No enrollments yet" action={<Button app to="/courses">Browse courses</Button>} />}
        {enrollments.map((e) => { const c = courseOf(e.courseId); const t = teacherOf(e.teacherId); return (
          <div key={e.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><span className="text-2xl">{c?.emoji}</span>
              <div><Link to={`/courses/${c?.slug}`} className="font-semibold hover:text-brand-700">{c?.title}</Link>
                <p className="text-sm text-ink/60">{kidName(state, e.studentId)} · {t?.name} · <span className="capitalize">{e.plan}</span> ({e.perWeek}×/wk) · {money(e.price)}/mo</p></div></div>
            <div className="flex items-center gap-2"><Badge status={e.status} />
              {e.status === 'active' ? <Button app size="sm" variant="outline" onClick={() => { pauseEnrollment(e.id, 'paused'); toast({ title: 'Enrollment paused' }) }}>Pause</Button> : <Button app size="sm" variant="outline" onClick={() => { pauseEnrollment(e.id, 'active'); toast({ title: 'Enrollment resumed', type: 'success' }) }}>Resume</Button>}</div>
          </div>) })}
      </CardBody></Card>
    </div>
  )
}

export function ParentWishlist() {
  const user = useCurrentUser()
  const wish = useStore((s) => s.wishlists[user.id] || EMPTY)
  const list = COURSES.filter((c) => wish.includes(c.id))
  return (
    <div>
      <PageHeader icon={Heart} title="Wishlist" subtitle="Courses you saved for later." />
      {list.length === 0 ? <Card app><EmptyState icon={Heart} title="Nothing saved yet" desc="Tap the heart on any course to save it here." action={<Button app to="/courses">Browse courses</Button>} /></Card> :
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CourseCard key={c.id} course={c} compact />)}</div>}
    </div>
  )
}

export function ParentSchedule() {
  const { state, sessions, kidIds } = useParentData()
  return (
    <div>
      <PageHeader icon={CalendarClock} title="Schedule" subtitle="All your children's classes in one calendar." actions={<RequestReschedule />} />
      <Card app><CardBody className="!p-5"><MonthCalendar sessions={sessions} renderLabel={(s) => kidName(state, s.studentIds.find((id) => kidIds.includes(id)))} /></CardBody></Card>
    </div>
  )
}

function RequestReschedule() {
  const { user, state, sessions, kidIds } = useParentData()
  const { createRescheduleRequest } = useStore()
  const [open, setOpen] = useState(false)
  const upcoming = sessions.filter((s) => s.status === 'scheduled' && new Date(s.start) > new Date()).sort(byDate('start')).slice(0, 30)
  const [f, setF] = useState({ sessionId: '', newDate: '', newTime: '', reason: '' })
  const sess = upcoming.find((s) => s.id === f.sessionId)
  return (<>
    <Button app variant="outline" onClick={() => setOpen(true)}><CalendarX className="h-4 w-4" /> Request reschedule</Button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Request a new time" desc="24h notice — the teacher will approve or suggest another slot.">
      <div className="space-y-4">
        <Select app label="Session" value={f.sessionId} onChange={(e) => setF((x) => ({ ...x, sessionId: e.target.value }))}><option value="">Choose a session…</option>{upcoming.map((s) => <option key={s.id} value={s.id}>{fmtDateTime(s.start)} — {courseOf(s.courseId)?.title.slice(0, 30)} ({kidName(state, s.studentIds.find((id) => kidIds.includes(id)))})</option>)}</Select>
        <div className="grid grid-cols-2 gap-4"><Input app type="date" label="New date" value={f.newDate} onChange={(e) => setF((x) => ({ ...x, newDate: e.target.value }))} /><Input app type="time" label="New time" value={f.newTime} onChange={(e) => setF((x) => ({ ...x, newTime: e.target.value }))} /></div>
        <Textarea app label="Reason" placeholder="e.g. school event" value={f.reason} onChange={(e) => setF((x) => ({ ...x, reason: e.target.value }))} />
        <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button app disabled={!f.sessionId || !f.newDate || !f.newTime} onClick={() => { createRescheduleRequest({ sessionId: f.sessionId, courseId: sess.courseId, teacherId: sess.teacherId, requesterId: user.id, studentId: sess.studentIds[0], oldStart: sess.start, newStart: new Date(`${f.newDate}T${f.newTime}`).toISOString(), reason: f.reason }); setOpen(false); toast({ title: 'Request sent to the teacher', type: 'success' }) }}>Send request</Button></div>
      </div>
    </Dialog>
  </>)
}

export function ParentTrials() {
  const { user, state } = useParentData()
  const trials = state.trials.filter((t) => t.parentId === user.id || t.parentEmail === user.email)
  return (
    <div>
      <PageHeader icon={Sparkles} title="Free Trials" subtitle="Your booked trial lessons and their assessment reports." actions={<Button app to="/trial"><Plus className="h-4 w-4" /> Book a trial</Button>} />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {trials.length === 0 && <EmptyState icon={Sparkles} title="No trials yet" desc="Book a free 30-minute trial with any teacher." action={<Button app to="/trial">Book free trial</Button>} />}
        {trials.map((t) => (
          <div key={t.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{t.studentName} — {courseOf(t.courseId)?.title}</p><p className="text-sm text-ink/60">{fmtDateTime(t.start)} · with {teacherOf(t.teacherId)?.name}</p></div>
              <Badge status={t.assessment ? 'approved' : t.status}>{t.assessment ? 'Report ready' : t.status}</Badge>
            </div>
            {t.assessment && <div className="mt-3 rounded-xl bg-brand-50/60 p-4 text-sm">
              <p><b>Level:</b> {t.assessment.level}</p><p className="mt-1"><b>Strengths:</b> {t.assessment.strengths}</p><p className="mt-1"><b>To improve:</b> {t.assessment.weaknesses}</p><p className="mt-1"><b>Recommended:</b> {t.assessment.recommendation}</p>
            </div>}
          </div>))}
      </CardBody></Card>
    </div>
  )
}

export function ParentAttendance() {
  const { state, kids, sessions } = useParentData()
  const [kid, setKid] = useState('all')
  const past = sessions.filter((s) => ['completed', 'missed', 'cancelled'].includes(effectiveStatus(s)) && (kid === 'all' || s.studentIds.includes(kid))).sort(byDate('start', -1))
  return (
    <div>
      <PageHeader icon={ListChecks} title="Attendance" subtitle="Session-by-session attendance record." actions={<Select app value={kid} onChange={(e) => setKid(e.target.value)} className="w-44"><option value="all">All children</option>{kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</Select>} />
      <Card app><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm">
        <thead><tr className="border-b border-ink/8 text-left text-ink/60"><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Course</th><th className="px-5 py-3 font-medium">Child</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
        <tbody>{past.slice(0, 40).map((s) => { const sid = s.studentIds.find((id) => kids.some((k) => k.id === id)); const present = s.status === 'completed' && s.attendance?.[sid] !== false; return (
          <tr key={s.id} className="border-b border-ink/4 last:border-b-0"><td className="px-5 py-3 text-ink/70">{fmtDateTime(s.start)}</td><td className="max-w-[240px] truncate px-5 py-3">{courseOf(s.courseId)?.title}</td><td className="px-5 py-3">{kidName(state, sid)}</td>
            <td className="px-5 py-3"><Badge status={s.status === 'completed' ? (present ? 'approved' : 'missed') : effectiveStatus(s)}>{s.status === 'completed' ? (present ? 'Present' : 'Absent') : effectiveStatus(s)}</Badge></td></tr>) })}</tbody>
      </table></div>{past.length === 0 && <EmptyState icon={ListChecks} title="No past sessions yet" />}</Card>
    </div>
  )
}

export function ParentProgress() {
  const { state, kids, sessions } = useParentData()
  return (
    <div>
      <PageHeader icon={BarChart3} title="Progress" subtitle="Monthly learning progress for each child." />
      <div className="grid gap-4 lg:grid-cols-2">
        {kids.map((k) => {
          const kSess = sessions.filter((s) => s.studentIds.includes(k.id))
          const done = kSess.filter((s) => s.status === 'completed')
          const att = pct(done.filter((s) => s.attendance?.[k.id] !== false).length, done.length || 1)
          const hw = state.homework.filter((h) => h.studentId === k.id)
          const hwAvg = Math.round(hw.filter((h) => h.grade).reduce((n, h) => n + h.grade, 0) / (hw.filter((h) => h.grade).length || 1)) || null
          const fb = state.feedback.filter((f) => f.studentId === k.id).slice(0, 3)
          return (
            <Card app key={k.id}><CardBody className="!p-5">
              <p className="flex items-center gap-3 font-bold"><Avatar name={k.name} size="md" /> {k.name}</p>
              <div className="mt-4 space-y-3">
                {[['Attendance', att, `${att}%`], ['Homework average', hwAvg || 0, hwAvg ? `${hwAvg}/100` : '—'], ['Lessons completed', pct(done.length, kSess.length || 1), `${done.length}/${kSess.length}`]].map(([l, v, txt]) => <div key={l}><p className="flex justify-between text-sm"><span className="text-ink/60">{l}</span><b>{txt}</b></p><Progress value={v} className="mt-1.5" tone={v >= 80 ? 'bg-emerald-500' : v >= 50 ? 'bg-sun-500' : 'bg-coral-500'} /></div>)}
              </div>
              {fb.length > 0 && <div className="mt-4 border-t border-ink/5 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Latest teacher notes</p>
                {fb.map((f) => <p key={f.id} className="mt-2 rounded-lg bg-ink/4 p-2.5 text-xs leading-relaxed"><b>{fmtDate(f.createdAt)}:</b> Learned {f.learned}. <span className="text-ink/60">Focus: {f.weak}.</span></p>)}
              </div>}
            </CardBody></Card>)
        })}
      </div>
    </div>
  )
}

export function ParentRecordings() {
  const { state, kidIds } = useParentData()
  const recs = state.recordings.filter((r) => r.studentIds.some((id) => kidIds.includes(id))).sort((a, b) => new Date(b.start) - new Date(a.start))
  return (
    <div>
      <PageHeader icon={Film} title="Recordings" subtitle="Rewatch any recorded lesson." />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {recs.length === 0 && <EmptyState icon={Film} title="No recordings yet" />}
        {recs.slice(0, 30).map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 py-3.5">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50"><Play className="h-4 w-4 text-brand-600" /></span>
              <div className="min-w-0"><p className="truncate font-medium">{r.title}</p><p className="text-xs text-ink/55">{fmtDateTime(r.start)} · {r.duration} min · {kidName(state, r.studentIds.find((id) => kidIds.includes(id)))}</p></div></div>
            <Button app size="sm" variant="outline" onClick={() => toast({ title: 'Demo recording', desc: 'Real playback needs cloud recording storage — see Services & Costs.', type: 'info' })}><Play className="h-3.5 w-3.5" /> Watch</Button>
          </div>))}
      </CardBody></Card>
    </div>
  )
}

export function ParentHomework() {
  const { state, kids } = useParentData()
  const [kid, setKid] = useState('all')
  const list = state.homework.filter((h) => kids.some((k) => k.id === h.studentId) && (kid === 'all' || h.studentId === kid))
  return (
    <div>
      <PageHeader icon={NotebookPen} title="Homework" subtitle="Assignments across all your children." actions={<Select app value={kid} onChange={(e) => setKid(e.target.value)} className="w-44"><option value="all">All children</option>{kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</Select>} />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {list.length === 0 && <EmptyState icon={NotebookPen} title="No homework yet" />}
        {list.map((h) => (
          <div key={h.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{h.title} <span className="text-sm font-normal text-ink/50">· {kidName(state, h.studentId)}</span></p><Badge status={h.status} /></div>
            <p className="mt-1 text-sm text-ink/70">{h.description}</p>
            <p className="mt-1 text-xs text-ink/50">{courseOf(h.courseId)?.title} · due {fmtDate(h.dueAt)}{h.grade ? ` · scored ${h.grade}/100` : ''}</p>
            {h.gradeFeedback && <p className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800">Teacher: {h.gradeFeedback}</p>}
          </div>))}
      </CardBody></Card>
    </div>
  )
}

export function ParentCertificates({ role = 'parent' }) {
  const user = useCurrentUser()
  const state = useStore()
  const ids = role === 'parent' ? childrenOf(state, user.id).map((k) => k.id) : [user.id]
  const certs = state.certificates.filter((c) => ids.includes(c.studentId))
  const nav = useNavigate()
  return (
    <div>
      <PageHeader icon={Award} title="Certificates" subtitle="Milestones earned across courses." />
      {certs.length === 0 ? <Card app><EmptyState icon={Award} title="No certificates yet" desc="Certificates are issued when a course is completed and approved by the teacher." /></Card> :
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="rounded-2xl border border-sun-400/50 bg-gradient-to-b from-sun-400/10 to-white p-6 text-center shadow-card">
              <Award className="mx-auto h-10 w-10 text-sun-500" />
              <p className="mt-3 font-display text-xl font-bold">{c.title}</p>
              <p className="mt-1 text-sm text-ink/60">{kidName(state, c.studentId)} · issued {fmtDate(c.issuedAt)}</p>
              <p className="mt-1 text-xs text-ink/40">Certificate {c.code}</p>
              <Button app variant="outline" size="sm" className="mt-4" onClick={() => nav(`/certificate/${c.id}`)}><Printer className="h-3.5 w-3.5" /> View & print</Button>
            </div>))}
        </div>}
    </div>
  )
}

export function ParentFeedbackPage() {
  const { user, state, kids, kidIds } = useParentData()
  const { addReview } = useStore()
  const fb = state.feedback.filter((f) => kidIds.includes(f.studentId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const [open, setOpen] = useState(false)
  const enrolled = state.enrollments.filter((e) => kidIds.includes(e.studentId))
  const [f, setF] = useState({ courseId: enrolled[0]?.courseId || '', rating: 5, text: '' })
  return (
    <div>
      <PageHeader icon={MessageSquare} title="Feedback" subtitle="Teacher lesson reports for your children — and your reviews of us." actions={<Button app onClick={() => setOpen(true)}><Star className="h-4 w-4" /> Leave a review</Button>} />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {fb.length === 0 && <EmptyState icon={MessageSquare} title="No lesson feedback yet" desc="After each class, teachers write what was learned and what to practise." />}
        {fb.slice(0, 20).map((x) => (
          <div key={x.id} className="py-4">
            <p className="flex flex-wrap items-center gap-2 text-sm"><b>{kidName(state, x.studentId)}</b> <span className="text-ink/40">·</span> {courseOf(x.courseId)?.title} <span className="text-ink/40">·</span> <span className="text-ink/50">{fmtDate(x.createdAt)}</span><Stars value={x.engagement} className="ml-auto" /></p>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
              <p className="rounded-lg bg-emerald-50 p-2.5"><b className="text-emerald-700">Learned:</b> {x.learned}</p>
              <p className="rounded-lg bg-sun-400/15 p-2.5"><b className="text-sun-600">Focus on:</b> {x.weak}</p>
              <p className="rounded-lg bg-brand-50 p-2.5"><b className="text-brand-700">Practise:</b> {x.recommendations || '—'}</p>
            </div>
          </div>))}
      </CardBody></Card>
      <Dialog open={open} onClose={() => setOpen(false)} title="Review a course" desc="Your review appears on the course page.">
        <div className="space-y-4">
          <Select app label="Course" value={f.courseId} onChange={(e) => setF((x) => ({ ...x, courseId: e.target.value }))}>{[...new Set(enrolled.map((e) => e.courseId))].map((cid) => <option key={cid} value={cid}>{courseOf(cid)?.title}</option>)}</Select>
          <div><span className="label">Rating</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setF((x) => ({ ...x, rating: n }))}><Star className={cn('h-7 w-7', n <= f.rating ? 'fill-sun-400 text-sun-400' : 'fill-ink/10 text-ink/10')} /></button>)}</div></div>
          <Textarea app label="Your review" value={f.text} onChange={(e) => setF((x) => ({ ...x, text: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button app disabled={!f.courseId} onClick={() => { const c = courseOf(f.courseId); addReview({ courseId: f.courseId, teacherId: c.teacherId, authorName: user.name, authorId: user.id, rating: f.rating, text: f.text }); setOpen(false); toast({ title: 'JazakAllah khair for your review!', type: 'success' }) }}>Post review</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function ParentPayments() {
  const { user, state } = useParentData()
  const pays = state.payments.filter((p) => p.parentId === user.id)
  return (
    <div>
      <PageHeader icon={CreditCard} title="Payments" subtitle="Invoices and billing history. Pause or cancel from Enrolled Courses." />
      <Card app><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
        <thead><tr className="border-b border-ink/8 text-left text-ink/60"><th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Items</th><th className="px-5 py-3 font-medium">Method</th><th className="px-5 py-3 text-right font-medium">Total</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
        <tbody>{pays.map((p) => (
          <tr key={p.id} className="border-b border-ink/4 last:border-b-0">
            <td className="px-5 py-3 font-mono text-xs">{p.invoice}</td><td className="px-5 py-3 text-ink/70">{fmtDate(p.at)}</td>
            <td className="px-5 py-3"><p className="max-w-[280px]">{p.items.map((i) => courseOf(i.courseId)?.title.split(':')[0]).join(', ')}</p>{p.discount > 0 && <p className="text-xs text-emerald-700">saved {money(p.discount, { cents: true })}</p>}</td>
            <td className="px-5 py-3 text-ink/70">{p.method}</td><td className="px-5 py-3 text-right font-semibold">{money(p.total, { cents: true })}</td><td className="px-5 py-3"><Badge status="approved">Paid</Badge></td>
          </tr>))}</tbody>
      </table></div>{pays.length === 0 && <EmptyState icon={CreditCard} title="No payments yet" />}</Card>
    </div>
  )
}
