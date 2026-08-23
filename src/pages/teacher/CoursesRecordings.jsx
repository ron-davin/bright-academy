import React, { useState } from 'react'
import { GraduationCap, FileText, Film, Plus, Play, Download, Layers, Users, Clock, CalendarDays, X } from 'lucide-react'
import { useStore, useCurrentUser, sessionsForTeacher, toast } from '../../lib/store.js'
import { Badge, Button, Card, CardBody, Dialog, EmptyState, Input, PageHeader, Select, StatCard, Textarea } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, fmtDateTime, fmtDate } from '../../lib/utils.js'
import { SUBJECTS } from '../../lib/data.js'

export function TeacherCourses() {
  const user = useCurrentUser()
  const state = useStore()
  const myCourseIds = [...new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.courseId))]
  return (
    <div>
      <PageHeader icon={GraduationCap} title="My Courses" subtitle="View your assigned courses and curriculum." />
      <div className="grid gap-4 lg:grid-cols-2">
        {myCourseIds.map((cid) => { const c = courseOf(cid); const students = new Set(state.enrollments.filter((e) => e.courseId === cid && e.teacherId === user.teacherId && e.status === 'active').map((e) => e.studentId)).size; const lessons = state.lessons.filter((l) => l.courseId === cid && l.teacherId === user.teacherId); const weekly = state.sessions.filter((s) => s.courseId === cid && s.teacherId === user.teacherId && new Date(s.start) > new Date() && new Date(s.start) < new Date(Date.now() + 7 * 864e5)).length; return (
          <Card app key={cid}><CardBody className="!p-5">
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{c.emoji}</span>
              <div className="min-w-0"><p className="font-bold leading-snug">{c.title}</p><p className="mt-1 line-clamp-2 text-sm text-ink/60">{c.summary}</p></div></div>
            <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="bg-emerald-100 text-emerald-700">{c.level}</Badge><Badge tone={c.type === 'group' ? 'bg-sun-400/20 text-sun-600' : 'bg-sky-400/15 text-sky-500'}>{c.type === 'group' ? 'Group' : 'One-on-One'}</Badge><Badge tone="bg-ink/5 text-ink/70">Active</Badge></div>
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-ink/3 p-3 text-center">
              {[[Layers, lessons.length, 'Lessons'], [Users, students, 'Students'], [Clock, `${c.ages[0]}–${c.ages[1]}`, 'Ages'], [CalendarDays, weekly, 'Sessions/wk']].map(([I, v, l]) => <div key={l}><I className="mx-auto h-4 w-4 text-ink/40" /><p className="mt-1 text-lg font-bold">{v}</p><p className="text-[11px] text-ink/50">{l}</p></div>)}
            </div>
            <div className="mt-4 border-t border-ink/5 pt-3 text-sm"><p className="flex justify-between font-semibold">Lessons <span className="text-ink/50">{lessons.length} total</span></p>
              {lessons.length === 0 ? <p className="mt-1.5 text-ink/50">No lessons added yet.</p> : <ul className="mt-1.5 space-y-1">{lessons.slice(0, 3).map((l) => <li key={l.id} className="truncate text-ink/70">{l.order}. {l.title}</li>)}{lessons.length > 3 && <li className="text-xs text-ink/40">+{lessons.length - 3} more</li>}</ul>}</div>
          </CardBody></Card>) })}
      </div>
    </div>
  )
}

export function CourseProposals() {
  const user = useCurrentUser()
  const proposals = useStore((s) => s.proposals).filter((p) => p.teacherId === user.teacherId)
  const { createProposal } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ title: '', subject: SUBJECTS[0], type: 'individual', description: '', outcome: '' })
  const counts = { total: proposals.length, pending: proposals.filter((p) => p.status === 'pending').length, approved: proposals.filter((p) => p.status === 'approved').length, rejected: proposals.filter((p) => p.status === 'rejected').length }
  return (
    <div>
      <PageHeader icon={FileText} title="Course Proposals" subtitle="Pitch new course ideas to the academy. Track review status and updates here." actions={<Button app onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Proposal</Button>} />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total" value={counts.total} icon={Layers} tone="violet" /><StatCard title="Pending" value={counts.pending} icon={Clock} tone="sun" /><StatCard title="Approved" value={counts.approved} icon={GraduationCap} tone="green" /><StatCard title="Rejected" value={counts.rejected} icon={X} tone="red" />
      </div>
      <Card app><CardBody className="!py-3">
        {proposals.length === 0 && <EmptyState icon={FileText} title="No proposals yet" desc="Share your next course idea with the academy." action={<Button app onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create proposal</Button>} />}
        <div className="divide-y divide-ink/5">{proposals.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 py-4">
            <div><p className="font-semibold">{p.title}</p><p className="text-sm text-ink/60">{p.subject} · {p.type === 'group' ? 'Group' : '1-on-1'} · submitted {fmtDate(p.createdAt)}</p><p className="mt-1 line-clamp-2 text-sm text-ink/70">{p.description}</p></div>
            <Badge status={p.status} />
          </div>))}</div>
      </CardBody></Card>
      <Dialog open={open} onClose={() => setOpen(false)} title="Propose a new course" size="lg">
        <div className="space-y-4">
          <Input app label="Course title" required placeholder="e.g. Tafsir of Juz Amma for Teens" value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select app label="Subject" value={f.subject} onChange={(e) => setF((x) => ({ ...x, subject: e.target.value }))}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</Select>
            <Select app label="Format" value={f.type} onChange={(e) => setF((x) => ({ ...x, type: e.target.value }))}><option value="individual">1-on-1</option><option value="group">Group</option></Select>
          </div>
          <Textarea app label="Description" required rows={4} placeholder="What will students learn, week by week?" value={f.description} onChange={(e) => setF((x) => ({ ...x, description: e.target.value }))} />
          <Input app label="Expected outcome" required placeholder="What measurable result will students achieve?" value={f.outcome} onChange={(e) => setF((x) => ({ ...x, outcome: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button app disabled={!f.title || !f.description || !f.outcome} onClick={() => { createProposal({ teacherId: user.teacherId, ...f }); setOpen(false); toast({ title: 'Proposal submitted for review', type: 'success' }) }}>Submit proposal</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function TeacherRecordings() {
  const user = useCurrentUser()
  const state = useStore()
  const [courseId, setCourseId] = useState('all')
  const recs = state.recordings.filter((r) => r.teacherId === user.teacherId && (courseId === 'all' || r.courseId === courseId)).sort((a, b) => new Date(b.start) - new Date(a.start))
  const myCourses = [...new Set(state.recordings.filter((r) => r.teacherId === user.teacherId).map((r) => r.courseId))]
  const counts = { total: recs.length, ready: recs.filter((r) => r.status === 'ready').length, processing: recs.filter((r) => r.status === 'processing').length, failed: 0 }
  const nameOf = (r) => r.studentIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
  return (
    <div>
      <PageHeader icon={Film} title="Recordings" subtitle="Access and share session recordings with your students." actions={<Select app value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-48"><option value="all">All courses</option>{myCourses.map((cid) => <option key={cid} value={cid}>{courseOf(cid)?.title}</option>)}</Select>} />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Total recordings', counts.total], ['Ready to watch', counts.ready], ['Processing', counts.processing], ['Failed', counts.failed]].map(([l, v]) => <Card app key={l}><CardBody className="!p-5"><p className="text-sm text-ink/60">{l}</p><p className="mt-2 text-3xl font-bold">{v}</p></CardBody></Card>)}
      </div>
      <Card app>
        <div className="border-b border-ink/5 px-5 py-4"><p className="font-bold">Latest recordings</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-ink/8 text-left text-ink/60"><th className="px-5 py-3 font-medium">Session</th><th className="px-5 py-3 font-medium">Scheduled</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody>{recs.slice(0, 25).map((r) => (
            <tr key={r.id} className="border-b border-ink/4 last:border-b-0 hover:bg-ink/2">
              <td className="px-5 py-3"><p className="max-w-[260px] truncate font-medium">{courseOf(r.courseId)?.title} — {nameOf(r)}</p><p className="text-xs text-ink/50">{courseOf(r.courseId)?.title}</p></td>
              <td className="px-5 py-3 text-ink/70">{fmtDateTime(r.start)}</td>
              <td className="px-5 py-3 text-ink/70">{r.duration} min</td>
              <td className="px-5 py-3"><Badge status={r.status} /></td>
              <td className="px-5 py-3"><div className="flex justify-end gap-2">
                <Button app size="sm" onClick={() => toast({ title: 'Demo recording', desc: 'Real playback requires cloud recording storage — see Services & Costs.', type: 'info' })}><Play className="h-3.5 w-3.5" /> Watch</Button>
                <Button app size="sm" variant="outline" onClick={() => toast({ title: `~${r.sizeMb} MB video`, desc: 'Downloads work once cloud storage is connected.', type: 'info' })}><Download className="h-3.5 w-3.5" /> Download</Button>
              </div></td>
            </tr>))}</tbody>
        </table></div>
        {recs.length === 0 && <EmptyState icon={Film} title="No recordings yet" desc="Recordings appear after you record a live session." />}
      </Card>
    </div>
  )
}
