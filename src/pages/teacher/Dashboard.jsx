import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isToday, isSameDay } from 'date-fns'
import { BookOpen, CalendarClock, CalendarDays, ClipboardList, GraduationCap, Users, AlertTriangle, CheckCircle2, ArrowRight, Clock } from 'lucide-react'
import { useStore, useCurrentUser, effectiveStatus, sessionsForTeacher, EMPTY } from '../../lib/store.js'
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, StatCard, Avatar } from '../../components/ui/index.jsx'
import { SessionRow, JoinButton, courseOf } from '../../components/app/Shared.jsx'
import { greeting, fmtTime, fmtDateTime, byDate, cn } from '../../lib/utils.js'

export default function TeacherDashboard() {
  const user = useCurrentUser()
  const state = useStore()
  const nav = useNavigate()
  const now = new Date()
  const all = sessionsForTeacher(state, user.teacherId)
  const today = all.filter((s) => isToday(new Date(s.start))).sort(byDate('start'))
  const upcoming = all.filter((s) => new Date(s.start) > now && !isToday(new Date(s.start)) && s.status === 'scheduled').sort(byDate('start')).slice(0, 10)
  const active = all.find((s) => s.status === 'live')
  const enrolled = new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId && e.status === 'active').map((e) => e.studentId))
  const courses = new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.courseId))
  const weekAgo = new Date(now - 7 * 864e5)
  const alertStudents = new Set(all.filter((s) => effectiveStatus(s) === 'missed' && new Date(s.start) > weekAgo).flatMap((s) => s.studentIds))
  const pendingTrials = state.trials.filter((t) => t.teacherId === user.teacherId && t.status === 'completed' && !t.assessment)
  const nextToday = today.find((s) => new Date(s.start) > now && s.status === 'scheduled')
  const nameOf = (s) => s.studentIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
  return (
    <div className="space-y-5">
      {pendingTrials.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-sun-400/50 bg-sun-400/10 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-sun-600" /><div><p className="text-sm font-semibold text-ink">You have {pendingTrials.length} trial assessment{pendingTrials.length > 1 ? 's' : ''} to submit</p><p className="text-xs text-ink/60">Students and parents are waiting for their trial report.</p></div></div>
          <Button app variant="sun" size="sm" onClick={() => nav('/teacher/trial-assessments')}>Submit now <ArrowRight className="h-4 w-4" /></Button>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><BookOpen className="h-6 w-6" /></span>
          <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting()}, {user.name}!</h1><p className="mt-0.5 text-sm text-ink/60">Here's your teaching overview for today.</p></div>
        </div>
        <div className="flex gap-2"><Button app variant="outline" size="sm" to="/teacher/schedule"><CalendarClock className="h-4 w-4" /> Schedule</Button><Button app variant="outline" size="sm" to="/teacher/courses"><GraduationCap className="h-4 w-4" /> Courses</Button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Classes" value={today.length} desc={nextToday ? `Next: ${fmtTime(nextToday.start)}` : 'No more classes today'} icon={CalendarDays} tone="green" />
        <StatCard title="Assigned Courses" value={courses.size} icon={GraduationCap} tone="blue" />
        <StatCard title="Active Students" value={enrolled.size} icon={Users} tone="sky" />
        <StatCard title="Student Alerts" value={alertStudents.size} desc={alertStudents.size ? 'Missed classes this week' : 'All on track'} icon={AlertTriangle} tone={alertStudents.size ? 'red' : 'default'} />
      </div>
      {active && (
        <Card app>
          <CardHeader title="Active Session" />
          <CardBody>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold">{courseOf(active.courseId)?.title}</p><p className="text-sm text-ink/60">{nameOf(active)}</p></div>
                <div className="flex flex-col items-end gap-2"><Badge status="live"><span className="mr-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> LIVE</Badge><JoinButton sess={active} /></div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-ink/60"><span>Students: {active.studentIds.length}</span><span>Duration: {Math.round((new Date(active.end) - new Date(active.start)) / 60000)} min</span>{active.topic && <span>Topic: {active.topic}</span>}</div>
            </div>
          </CardBody>
        </Card>
      )}
      <Card app>
        <CardHeader title="Today's Schedule" action={<Button app variant="ghost" size="sm" to="/teacher/sessions">View all <ArrowRight className="h-3.5 w-3.5" /></Button>} />
        <CardBody>
          {today.length === 0 ? <EmptyState icon={Clock} title="No classes today" desc="Enjoy your free time or prepare for upcoming sessions." /> :
            <div className="divide-y divide-ink/5">{today.map((s) => <SessionRow key={s.id} sess={s} names={nameOf(s)} right={<JoinButton sess={s} />} />)}</div>}
        </CardBody>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card app>
          <CardHeader title="Upcoming Schedule" action={<Button app variant="ghost" size="sm" to="/teacher/schedule">View all <ArrowRight className="h-3.5 w-3.5" /></Button>} />
          <CardBody>{upcoming.length === 0 ? <EmptyState icon={CalendarClock} title="No upcoming lessons scheduled." /> :
            <div className="divide-y divide-ink/5">{upcoming.map((s) => <div key={s.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{courseOf(s.courseId)?.title}</p><p className="text-sm text-ink/60">{fmtDateTime(s.start)} - {fmtTime(s.end)}</p></div><Badge tone="bg-white border border-ink/10 text-ink/70">{s.studentIds.length} student{s.studentIds.length > 1 ? 's' : ''}</Badge></div>)}</div>}</CardBody>
        </Card>
        <Card app>
          <CardHeader title="Student Alerts" action={<Button app variant="ghost" size="sm" to="/teacher/students">View all <ArrowRight className="h-3.5 w-3.5" /></Button>} />
          <CardBody>
            {alertStudents.size === 0 ? (
              <div className="flex flex-col items-center py-6 text-center"><span className="rounded-full bg-emerald-100 p-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></span><p className="mt-2 text-sm font-medium">All students on track</p><p className="mt-0.5 text-xs text-ink/60">No attendance issues this week.</p></div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center"><span className="rounded-full bg-sun-400/25 p-2"><AlertTriangle className="h-5 w-5 text-sun-600" /></span><p className="mt-2 text-sm font-medium">{alertStudents.size} student{alertStudents.size > 1 ? 's' : ''} need attention</p><p className="mt-0.5 text-xs text-ink/60">Missed classes this week</p><Button app variant="outline" size="sm" className="mt-3" to="/teacher/students">Review Students</Button></div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
