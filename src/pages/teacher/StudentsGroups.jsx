import React, { useMemo, useState } from 'react'
import { Users, UsersRound, Search, ChevronDown } from 'lucide-react'
import { useStore, useCurrentUser, effectiveStatus, sessionsForTeacher } from '../../lib/store.js'
import { Avatar, Badge, Card, CardBody, EmptyState, Input, PageHeader, Progress, Select, Tabs } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, pct } from '../../lib/utils.js'
import { timeLabel, DAYS } from '../../lib/utils.js'

export function TeacherStudents() {
  const user = useCurrentUser()
  const state = useStore()
  const [q, setQ] = useState('')
  const myCourses = [...new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.courseId))]
  const [courseId, setCourseId] = useState(myCourses[0] || 'all')
  const rows = useMemo(() => {
    const enr = state.enrollments.filter((e) => e.teacherId === user.teacherId && (courseId === 'all' || e.courseId === courseId))
    return enr.map((e) => {
      const st = state.users.find((u) => u.id === e.studentId)
      const sess = state.sessions.filter((s) => s.courseId === e.courseId && s.studentIds.includes(e.studentId))
      const past = sess.filter((s) => ['completed', 'missed'].includes(effectiveStatus(s)))
      const attended = past.filter((s) => s.attendance?.[e.studentId] !== false && effectiveStatus(s) === 'completed').length
      const totalPlanned = Math.max(past.length, e.perWeek * 8)
      return { e, st, attended, totalPlanned, att: pct(attended, past.length || 1) }
    }).filter((r) => r.st && (!q || r.st.name.toLowerCase().includes(q.toLowerCase())))
  }, [state, user, courseId, q])
  return (
    <div>
      <PageHeader icon={Users} title="My Students" subtitle="View student profiles and course progress." actions={<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input app placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56 pl-9" /></div>} />
      <div className="mb-4 flex flex-wrap gap-2">{myCourses.map((cid) => <button key={cid} type="button" onClick={() => setCourseId(cid)} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium', courseId === cid ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 bg-white hover:bg-ink/5')}>{courseOf(cid)?.emoji} {courseOf(cid)?.title.slice(0, 22)}{courseOf(cid)?.title.length > 22 ? '…' : ''}</button>)}</div>
      <Card app>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
          <thead><tr className="border-b border-ink/8 text-left text-ink/60"><th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Sessions Attended</th><th className="px-5 py-3 font-medium">Attendance</th><th className="px-5 py-3 font-medium">Plan</th></tr></thead>
          <tbody>
            {rows.map(({ e, st, attended, totalPlanned, att }) => (
              <tr key={e.id} className="border-b border-ink/4 last:border-b-0 hover:bg-ink/2">
                <td className="px-5 py-3"><span className="flex items-center gap-3"><Avatar name={st.name} size="sm" /><span><span className="block font-semibold text-ink">{st.name}</span><span className="block text-xs text-ink/50">{st.age ? `${st.age} yrs` : ''} {st.grade ? `· ${st.grade}` : ''}</span></span></span></td>
                <td className="px-5 py-3 font-medium">{attended}/{totalPlanned}</td>
                <td className="px-5 py-3"><span className="flex items-center gap-3"><Progress value={att} className="w-28" tone={att >= 80 ? 'bg-brand-600' : att >= 50 ? 'bg-sun-500' : 'bg-coral-500'} /><span className="text-xs font-semibold">{att}%</span></span></td>
                <td className="px-5 py-3"><Badge tone="bg-ink/5 text-ink/70" className="capitalize">{e.plan} · {e.perWeek}×/wk</Badge></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {rows.length === 0 && <EmptyState icon={Users} title="No students found" />}
      </Card>
    </div>
  )
}

export function TeacherGroups() {
  const user = useCurrentUser()
  const state = useStore()
  const groups = state.groups.filter((g) => g.teacherId === user.teacherId)
  const groupCourses = [...new Set(groups.map((g) => g.courseId))]
  const [courseId, setCourseId] = useState(groupCourses[0])
  const list = groups.filter((g) => g.courseId === courseId)
  return (
    <div>
      <PageHeader icon={UsersRound} title="Groups" subtitle="Browse and manage the student groups inside each of your group-type courses." />
      {groupCourses.length === 0 ? <Card app><EmptyState icon={UsersRound} title="No group courses" desc="Groups appear when you teach a group-type course." /></Card> : (<>
        <Select app className="mb-5 max-w-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>{groupCourses.map((cid) => <option key={cid} value={cid}>{courseOf(cid)?.title}</option>)}</Select>
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((g) => { const full = g.memberIds.length >= g.capacity; return (
            <Card app key={g.id}><CardBody className="!p-5">
              <div className="flex items-center justify-between"><p className="font-bold">{g.name}</p><Badge status={full ? 'full' : 'open'} /></div>
              <div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-ink/60"><Users className="h-4 w-4" /> Students</span><span className="font-semibold">{g.memberIds.length}/{g.capacity}</span></div>
              <Progress value={pct(g.memberIds.length, g.capacity)} className="mt-2" />
              <div className="mt-3 flex flex-wrap gap-2">{g.slots.map((s, i) => <Badge key={i} tone="bg-ink/5 text-ink/70">{DAYS[s.day]} {timeLabel(s.time)}</Badge>)}</div>
              <div className="mt-4 flex flex-wrap gap-2">{g.memberIds.map((id) => { const st = state.users.find((u) => u.id === id); return st && <span key={id} className="flex items-center gap-1.5 rounded-full bg-ink/4 py-1 pl-1 pr-3 text-xs font-medium"><Avatar name={st.name} size="xs" /> {st.name}</span> })}</div>
            </CardBody></Card>) })}
        </div>
      </>)}
    </div>
  )
}
