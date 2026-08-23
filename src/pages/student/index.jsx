import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isToday } from 'date-fns'
import { LayoutDashboard, CalendarDays, Film, CalendarClock, GraduationCap, ListChecks, NotebookPen, School, MessageSquare, BarChart3, Award, Play, Flame, Trophy, Star, Send, Paperclip, BadgeCheck } from 'lucide-react'
import { useStore, useCurrentUser, effectiveStatus, sessionsForStudent, enrollmentsForStudent, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Dialog, EmptyState, Input, PageHeader, Progress, StatCard, Stars, Textarea } from '../../components/ui/index.jsx'
import { MonthCalendar, SessionRow, JoinButton, courseOf, teacherOf } from '../../components/app/Shared.jsx'
import { cn, fmtDate, fmtDateTime, fmtTime, byDate, pct, greeting } from '../../lib/utils.js'
import { ParentCertificates } from '../parent/index.jsx'

const useStudentData = () => { const user = useCurrentUser(); const state = useStore(); return { user, state, sessions: sessionsForStudent(state, user.id), enrollments: enrollmentsForStudent(state, user.id) } }

export function StudentDashboard() {
  const { user, state, sessions, enrollments } = useStudentData()
  const now = new Date()
  const today = sessions.filter((s) => isToday(new Date(s.start))).sort(byDate('start'))
  const upcoming = sessions.filter((s) => new Date(s.start) > now && !isToday(new Date(s.start)) && s.status === 'scheduled').sort(byDate('start')).slice(0, 5)
  const live = sessions.find((s) => s.status === 'live')
  const hw = state.homework.filter((h) => h.studentId === user.id && ['assigned', 'revision'].includes(h.status))
  const done = sessions.filter((s) => s.status === 'completed')
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-display text-2xl font-black sm:text-3xl">{greeting()}, {user.firstName}! 🌟</h1><p className="mt-1 text-white/75">Ready for today's lessons, in sha Allah?</p></div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center"><p className="flex items-center gap-1 text-xl font-bold"><Flame className="h-5 w-5 text-sun-400" /> {user.streak || 0}</p><p className="text-[11px] text-white/70">day streak</p></div>
          <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center"><p className="flex items-center gap-1 text-xl font-bold"><Trophy className="h-5 w-5 text-sun-400" /> {user.points || 0}</p><p className="text-[11px] text-white/70">points</p></div>
        </div>
      </div>
      {live && <Card app className="border-emerald-300"><CardBody className="!p-4 flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Your {courseOf(live.courseId)?.title} class is LIVE now!</p><JoinButton sess={live} size="md" /></CardBody></Card>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Classes today" value={today.length} icon={CalendarDays} tone="green" desc={today[0] ? `Next: ${fmtTime((today.find((s) => new Date(s.start) > now) || today[0]).start)}` : ''} />
        <StatCard title="My courses" value={enrollments.filter((e) => e.status === 'active').length} icon={GraduationCap} tone="blue" />
        <StatCard title="Homework due" value={hw.length} icon={NotebookPen} tone={hw.length ? 'sun' : 'default'} />
        <StatCard title="Lessons completed" value={done.length} icon={BadgeCheck} tone="violet" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card app>
          <CardHeader title="Today & upcoming" />
          <CardBody>{[...today.filter((s) => new Date(s.end) > now), ...upcoming].length === 0 ? <EmptyState icon={CalendarClock} title="Nothing coming up" desc="Enjoy your free time — or revise!" /> :
            <div className="divide-y divide-ink/5">{[...today.filter((s) => new Date(s.end) > now), ...upcoming].slice(0, 5).map((s) => <SessionRow key={s.id} sess={s} showDate right={<JoinButton sess={s} />} />)}</div>}</CardBody>
        </Card>
        <Card app>
          <CardHeader title="Homework to do" />
          <CardBody>{hw.length === 0 ? <EmptyState icon={NotebookPen} title="All caught up!" desc="MashaAllah — no homework pending." /> :
            <div className="divide-y divide-ink/5">{hw.map((h) => <div key={h.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{h.title}</p><p className="text-xs text-ink/55">{courseOf(h.courseId)?.title} · due {fmtDate(h.dueAt)}</p></div><Button app size="sm" variant="outline" to="/student/homework">Open</Button></div>)}</div>}</CardBody>
        </Card>
      </div>
    </div>
  )
}

export function StudentSessions() {
  const { sessions } = useStudentData()
  const now = new Date()
  const upcoming = sessions.filter((s) => new Date(s.end) > now && !['cancelled'].includes(s.status)).sort(byDate('start'))
  const past = sessions.filter((s) => new Date(s.end) <= now).sort(byDate('start', -1))
  return (
    <div>
      <PageHeader icon={CalendarDays} title="Sessions" subtitle="Join upcoming classes and review past ones." />
      <h2 className="mb-2 font-semibold">Upcoming</h2>
      <Card app className="mb-6"><CardBody className="!py-2">{upcoming.length === 0 ? <EmptyState icon={CalendarDays} title="No upcoming sessions" /> : <div className="divide-y divide-ink/5">{upcoming.slice(0, 12).map((s) => <SessionRow key={s.id} sess={s} showDate right={<JoinButton sess={s} />} />)}</div>}</CardBody></Card>
      <h2 className="mb-2 font-semibold">Past</h2>
      <Card app><CardBody className="!py-2"><div className="divide-y divide-ink/5">{past.slice(0, 15).map((s) => <SessionRow key={s.id} sess={s} showDate />)}</div></CardBody></Card>
    </div>
  )
}

export function StudentSchedule() { const { sessions } = useStudentData(); return <div><PageHeader icon={CalendarClock} title="Schedule" subtitle="Your month at a glance." /><Card app><CardBody className="!p-5"><MonthCalendar sessions={sessions} /></CardBody></Card></div> }

export function StudentRecordings() {
  const { user, state } = useStudentData()
  const recs = state.recordings.filter((r) => r.studentIds.includes(user.id)).sort((a, b) => new Date(b.start) - new Date(a.start))
  return (
    <div><PageHeader icon={Film} title="Recordings" subtitle="Rewatch your lessons any time." />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {recs.length === 0 && <EmptyState icon={Film} title="No recordings yet" />}
        {recs.slice(0, 30).map((r) => <div key={r.id} className="flex items-center justify-between gap-3 py-3.5">
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50"><Play className="h-4 w-4 text-brand-600" /></span><div className="min-w-0"><p className="truncate font-medium">{r.title}</p><p className="text-xs text-ink/55">{fmtDateTime(r.start)} · {r.duration} min</p></div></div>
          <Button app size="sm" variant="outline" onClick={() => toast({ title: 'Demo recording', desc: 'Real playback needs cloud storage — see Services & Costs.', type: 'info' })}><Play className="h-3.5 w-3.5" /> Watch</Button>
        </div>)}
      </CardBody></Card></div>
  )
}

export function StudentCourses() {
  const { state, sessions, enrollments } = useStudentData()
  return (
    <div><PageHeader icon={GraduationCap} title="My Courses" subtitle="Your enrolled programs and progress." />
      <div className="grid gap-4 lg:grid-cols-2">
        {enrollments.map((e) => { const c = courseOf(e.courseId); const t = teacherOf(e.teacherId); const done = sessions.filter((s) => s.courseId === e.courseId && s.status === 'completed').length; const target = c.weeks * e.perWeek; return (
          <Card app key={e.id}><CardBody className="!p-5">
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{c.emoji}</span>
              <div className="min-w-0 flex-1"><p className="font-bold leading-snug">{c.title}</p><p className="mt-0.5 flex items-center gap-2 text-sm text-ink/60"><Avatar src={t?.photo} name={t?.name} size="xs" /> {t?.name}</p></div><Badge status={e.status} /></div>
            <p className="mt-4 flex justify-between text-sm"><span className="text-ink/60">Progress</span><b>{done}/{target} lessons</b></p>
            <Progress value={pct(done, target)} className="mt-1.5" />
            <div className="mt-3 flex flex-wrap gap-1.5">{c.skills.slice(0, 3).map((s) => <span key={s} className="rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{s}</span>)}</div>
          </CardBody></Card>) })}
        {enrollments.length === 0 && <Card app className="lg:col-span-2"><EmptyState icon={GraduationCap} title="No courses yet" desc="Ask your parent to enroll you, or browse the catalog." action={<Button app to="/courses">Browse courses</Button>} /></Card>}
      </div>
    </div>
  )
}

export function StudentAttendance() {
  const { user, sessions } = useStudentData()
  const past = sessions.filter((s) => ['completed', 'missed'].includes(effectiveStatus(s))).sort(byDate('start', -1))
  const attended = past.filter((s) => s.status === 'completed' && s.attendance?.[user.id] !== false).length
  return (
    <div><PageHeader icon={ListChecks} title="Attendance" subtitle={`${attended} of ${past.length} sessions attended (${pct(attended, past.length || 1)}%).`} />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">{past.slice(0, 40).map((s) => { const present = s.status === 'completed' && s.attendance?.[user.id] !== false; return (
        <div key={s.id} className="flex items-center justify-between py-3"><div><p className="font-medium">{courseOf(s.courseId)?.title}</p><p className="text-xs text-ink/55">{fmtDateTime(s.start)}</p></div><Badge status={present ? 'approved' : 'missed'}>{present ? 'Present' : 'Absent'}</Badge></div>) })}</CardBody></Card></div>
  )
}

export function StudentHomework() {
  const { user, state } = useStudentData()
  const { submitHomework } = useStore()
  const [openFor, setOpenFor] = useState(null)
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const list = state.homework.filter((h) => h.studentId === user.id)
  const buckets = [['To do', list.filter((h) => ['assigned', 'revision'].includes(h.status))], ['Submitted', list.filter((h) => h.status === 'submitted')], ['Graded', list.filter((h) => h.status === 'graded')]]
  return (
    <div><PageHeader icon={NotebookPen} title="Homework" subtitle="Submit your work and see grades." />
      <div className="space-y-6">
        {buckets.map(([label, items]) => (
          <div key={label}><h2 className="mb-2 font-semibold">{label} <span className="badge bg-ink/10 text-ink/70">{items.length}</span></h2>
            <Card app><CardBody className="!py-2 divide-y divide-ink/5">
              {items.length === 0 && <p className="py-6 text-center text-sm text-ink/45">Nothing here.</p>}
              {items.map((h) => (
                <div key={h.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{h.title}</p><Badge status={h.status} /></div>
                  <p className="mt-1 text-sm text-ink/70">{h.description}</p>
                  <p className="mt-1 text-xs text-ink/50">{courseOf(h.courseId)?.title} · due {fmtDate(h.dueAt)}</p>
                  {h.attachment && <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-1.5 text-xs"><Paperclip className="h-3.5 w-3.5" /> {h.attachment.name}</p>}
                  {h.status === 'graded' && <p className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-sm"><b className="text-emerald-700">{h.grade}/100</b> — {h.gradeFeedback}</p>}
                  {h.status === 'revision' && <p className="mt-2 rounded-lg bg-coral-500/10 p-2.5 text-sm text-coral-700">{h.gradeFeedback}</p>}
                  {['assigned', 'revision'].includes(h.status) && <Button app size="sm" className="mt-3" onClick={() => setOpenFor(h)}><Send className="h-3.5 w-3.5" /> Submit work</Button>}
                </div>))}
            </CardBody></Card>
          </div>))}
      </div>
      <Dialog open={!!openFor} onClose={() => setOpenFor(null)} title={`Submit — ${openFor?.title}`}>
        <div className="space-y-4">
          <Textarea app label="What did you do?" required placeholder="e.g. I read the surah 10 times and recorded myself…" value={text} onChange={(e) => setText(e.target.value)} />
          <Input app label="Attachment name (optional, demo)" placeholder="my-recitation.m4a" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpenFor(null)}>Cancel</Button><Button app disabled={!text} onClick={() => { submitHomework(openFor.id, { text, attachment: fileName ? { name: fileName, size: '—' } : null }); setOpenFor(null); setText(''); setFileName(''); toast({ title: 'Homework submitted!', type: 'success' }) }}>Submit</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function StudentTeachers() {
  const { state, enrollments } = useStudentData()
  const tids = [...new Set(enrollments.map((e) => e.teacherId))]
  return (
    <div><PageHeader icon={School} title="My Teachers" subtitle="The teachers guiding your journey." />
      <div className="grid gap-4 sm:grid-cols-2">
        {tids.map((tid) => { const t = teacherOf(tid); return t && (
          <Card app key={tid}><CardBody className="!p-5 flex items-center gap-4">
            <Avatar src={t.photo} name={t.name} size="xl" />
            <div><p className="font-bold">{t.name}</p><p className="text-sm text-ink/60">{t.subjects.join(' & ')}</p><p className="mt-1 flex items-center gap-1 text-sm"><Stars value={t.rating} /> {t.rating.toFixed(1)}</p>
              <Button app size="sm" variant="outline" className="mt-2" to={`/student/messages`}>Message</Button></div>
          </CardBody></Card>) })}
      </div>
    </div>
  )
}

export function StudentFeedbackPage() {
  const { user, state } = useStudentData()
  const fb = state.feedback.filter((f) => f.studentId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return (
    <div><PageHeader icon={MessageSquare} title="Feedback" subtitle="What your teachers said after each lesson." />
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {fb.length === 0 && <EmptyState icon={MessageSquare} title="No feedback yet" />}
        {fb.slice(0, 20).map((x) => (
          <div key={x.id} className="py-4"><p className="flex items-center gap-2 text-sm"><b>{courseOf(x.courseId)?.title}</b><span className="text-ink/50">· {fmtDate(x.createdAt)}</span><Stars value={x.engagement} className="ml-auto" /></p>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3"><p className="rounded-lg bg-emerald-50 p-2.5"><b className="text-emerald-700">You learned:</b> {x.learned}</p><p className="rounded-lg bg-sun-400/15 p-2.5"><b className="text-sun-600">Work on:</b> {x.weak}</p><p className="rounded-lg bg-brand-50 p-2.5"><b className="text-brand-700">Practise:</b> {x.recommendations || '—'}</p></div>
          </div>))}
      </CardBody></Card></div>
  )
}

export function StudentProgress() {
  const { user, state, sessions, enrollments } = useStudentData()
  const { requestCompletion } = useStore()
  const done = sessions.filter((s) => s.status === 'completed')
  const att = pct(done.filter((s) => s.attendance?.[user.id] !== false).length, done.length || 1)
  const hw = state.homework.filter((h) => h.studentId === user.id && h.grade)
  const hwAvg = Math.round(hw.reduce((n, h) => n + h.grade, 0) / (hw.length || 1)) || 0
  return (
    <div><PageHeader icon={BarChart3} title="Progress" subtitle="Your learning journey in numbers." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Attendance" value={`${att}%`} icon={ListChecks} tone="green" />
        <StatCard title="Homework average" value={hw.length ? `${hwAvg}/100` : '—'} icon={NotebookPen} tone="sun" />
        <StatCard title="Lessons completed" value={done.length} icon={BadgeCheck} tone="blue" />
        <StatCard title="Points earned" value={user.points || 0} icon={Trophy} tone="violet" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {enrollments.map((e) => { const c = courseOf(e.courseId); const cDone = done.filter((s) => s.courseId === e.courseId).length; const target = c.weeks * e.perWeek; const ready = pct(cDone, target) >= 90; const pending = state.approvalRequests.some((a) => a.studentId === user.id && a.courseId === e.courseId && a.status === 'pending'); return (
          <Card app key={e.id}><CardBody className="!p-5">
            <p className="font-bold">{c.emoji} {c.title}</p>
            <p className="mt-3 flex justify-between text-sm"><span className="text-ink/60">Course progress</span><b>{cDone}/{target}</b></p>
            <Progress value={pct(cDone, target)} className="mt-1.5" />
            <div className="mt-4">
              {pending ? <Badge status="pending">Completion request pending</Badge> :
                <Button app size="sm" variant={ready ? 'primary' : 'outline'} disabled={!ready} onClick={() => { requestCompletion({ courseId: e.courseId, teacherId: e.teacherId, studentId: user.id, enrollmentId: e.id, eligibility: { attendance: att, lessonsCompleted: `${cDone}/${target}`, homeworkAvg: hwAvg } }); toast({ title: 'Completion request sent to your teacher', type: 'success' }) }}><Award className="h-3.5 w-3.5" /> {ready ? 'Request completion certificate' : `Certificate at 90% (now ${pct(cDone, target)}%)`}</Button>}
            </div>
          </CardBody></Card>) })}
      </div>
    </div>
  )
}

export const StudentCertificates = () => <ParentCertificates role="student" />
