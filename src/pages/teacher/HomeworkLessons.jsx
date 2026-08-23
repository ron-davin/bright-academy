import React, { useMemo, useState } from 'react'
import { NotebookPen, BookOpen, Plus, Paperclip, Download, MessageSquare, Send, Check, RotateCcw, Trash2, Eye, EyeOff } from 'lucide-react'
import { useStore, useCurrentUser, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, Dialog, EmptyState, Input, PageHeader, Select, Textarea } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, fmtDate, fmtRelative } from '../../lib/utils.js'

export function TeacherHomework() {
  const user = useCurrentUser()
  const state = useStore()
  const { createHomework, gradeHomework, addHomeworkMessage } = useStore()
  const myCourses = [...new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.courseId))]
  const [courseId, setCourseId] = useState(myCourses[0] || '')
  const [studentFilter, setStudentFilter] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [nf, setNf] = useState({ studentId: 'all', title: '', description: '', attachmentName: '' })
  const [grade, setGrade] = useState({ score: 90, feedback: '' })
  const [msg, setMsg] = useState('')
  const students = state.enrollments.filter((e) => e.teacherId === user.teacherId && e.courseId === courseId).map((e) => state.users.find((u) => u.id === e.studentId)).filter(Boolean)
  const list = state.homework.filter((h) => h.teacherId === user.teacherId && h.courseId === courseId && (studentFilter === 'all' || h.studentId === studentFilter))
  const buckets = [['Assigned — awaiting submission', list.filter((h) => h.status === 'assigned')], ['Submitted — needs review', list.filter((h) => h.status === 'submitted')], ['Needs revision', list.filter((h) => h.status === 'revision')], ['Graded', list.filter((h) => h.status === 'graded')]]
  const active = list.find((h) => h.id === activeId)
  const stOf = (h) => state.users.find((u) => u.id === h.studentId)
  const assign = () => {
    const targets = nf.studentId === 'all' ? students.map((s) => s.id) : [nf.studentId]
    targets.forEach((sid) => createHomework({ teacherId: user.teacherId, courseId, studentId: sid, title: nf.title, description: nf.description, attachment: nf.attachmentName ? { name: nf.attachmentName, size: '—' } : null, dueAt: new Date(Date.now() + 5 * 864e5).toISOString() }))
    setShowNew(false); setNf({ studentId: 'all', title: '', description: '', attachmentName: '' })
    toast({ title: `Assigned to ${targets.length} student${targets.length > 1 ? 's' : ''}`, type: 'success' })
  }
  return (
    <div>
      <PageHeader icon={NotebookPen} title="Homework" subtitle="Review student submissions and provide feedback." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {myCourses.map((cid) => <button key={cid} type="button" onClick={() => { setCourseId(cid); setActiveId(null); setStudentFilter('all') }} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium', courseId === cid ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 bg-white hover:bg-ink/5')}>{courseOf(cid)?.emoji} {courseOf(cid)?.title.slice(0, 24)}…</button>)}
        <span className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/50">Student <Select app value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className="w-44 normal-case tracking-normal"><option value="all">All</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div>
          <Button app className="w-full" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New Assignment</Button>
          <div className="mt-4 space-y-5">
            {buckets.map(([label, items]) => (
              <div key={label}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">{label} ({items.length})</p>
                {items.length === 0 && <p className="rounded-lg border border-dashed border-ink/10 p-3 text-xs text-ink/40">{label.startsWith('Needs') ? 'No revisions requested.' : 'Empty'}</p>}
                <div className="space-y-2">{items.map((h) => (
                  <button key={h.id} type="button" onClick={() => setActiveId(h.id)} className={cn('w-full rounded-xl border bg-white p-3.5 text-left shadow-sm', activeId === h.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink/8 hover:border-brand-300')}>
                    <p className="font-semibold">{h.title}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{stOf(h)?.name} • {courseOf(h.courseId)?.title.slice(0, 32)}…</p>
                    <Badge status={h.status} className="mt-2" />
                  </button>))}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {active ? (
            <div className="space-y-4">
              <Card app><CardBody className="!p-5">
                <p className="flex items-center gap-2 text-lg font-bold"><NotebookPen className="h-5 w-5 text-brand-600" /> {active.title}</p>
                <p className="mt-1 text-sm text-ink/60">{stOf(active)?.name} · due {fmtDate(active.dueAt)}</p>
                <p className="mt-3 text-sm leading-relaxed">{active.description}</p>
                {active.attachment && <p className="mt-4 text-sm font-semibold">Attachments</p>}
                {active.attachment && <span className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm"><Paperclip className="h-4 w-4 text-brand-600" /> {active.attachment.name} <span className="text-xs text-ink/40">{active.attachment.size}</span><Download className="h-4 w-4 cursor-pointer text-ink/40 hover:text-ink" /></span>}
                {active.submission && (
                  <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                    <p className="text-sm font-bold">Submission <span className="font-normal text-ink/50">· {fmtRelative(active.submission.at)}</span></p>
                    <p className="mt-1.5 text-sm">{active.submission.text}</p>
                    {active.submission.attachment && <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs"><Paperclip className="h-3.5 w-3.5" /> {active.submission.attachment.name}</p>}
                  </div>
                )}
                {active.status === 'graded' && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm"><b className="text-emerald-700">Graded: {active.grade}/100.</b> {active.gradeFeedback}</p>}
                {active.status === 'revision' && <p className="mt-4 rounded-xl bg-coral-500/10 p-3 text-sm"><b className="text-coral-600">Revision requested.</b> {active.gradeFeedback}</p>}
                {active.status === 'submitted' && (
                  <div className="mt-4 rounded-xl border border-ink/10 p-4">
                    <p className="text-sm font-bold">Grade this submission</p>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <label className="block"><span className="label">Score /100</span><Input app type="number" min="0" max="100" value={grade.score} onChange={(e) => setGrade((x) => ({ ...x, score: +e.target.value }))} className="w-24" /></label>
                      <label className="block flex-1 min-w-[220px]"><span className="label">Feedback</span><Input app placeholder="MashaAllah! Watch the Madd in…" value={grade.feedback} onChange={(e) => setGrade((x) => ({ ...x, feedback: e.target.value }))} /></label>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button app variant="success" size="sm" onClick={() => { gradeHomework(active.id, { grade: grade.score, feedback: grade.feedback }); toast({ title: 'Homework graded', type: 'success' }) }}><Check className="h-4 w-4" /> Grade</Button>
                      <Button app variant="outline" size="sm" onClick={() => { gradeHomework(active.id, { feedback: grade.feedback || 'Please review and resubmit.', status: 'revision' }); toast({ title: 'Revision requested' }) }}><RotateCcw className="h-4 w-4" /> Request revision</Button>
                    </div>
                  </div>
                )}
              </CardBody></Card>
              <Card app><CardBody className="!p-5">
                <p className="flex items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Homework conversation <span className="badge border border-ink/10 bg-white text-ink/50">🛡 Monitored for safety</span></span><span className="text-xs font-normal text-ink/50">{(active.conversation || []).length} messages</span></p>
                <div className="mt-3 max-h-56 space-y-2 overflow-y-auto thin-scroll">
                  {(active.conversation || []).length === 0 && <p className="py-6 text-center text-sm text-ink/45">No messages yet. Say hello or attach feedback to get started.</p>}
                  {(active.conversation || []).map((m) => { const own = m.senderId === user.id; return <div key={m.id} className={cn('flex', own && 'justify-end')}><p className={cn('max-w-[80%] rounded-xl px-3 py-1.5 text-sm', own ? 'bg-brand-600 text-white' : 'bg-ink/6')}>{m.text}</p></div> })}
                </div>
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!msg.trim()) return; addHomeworkMessage(active.id, { senderId: user.id, text: msg }); setMsg('') }}>
                  <Input app placeholder="Write a message…" value={msg} onChange={(e) => setMsg(e.target.value)} /><Button app type="submit" variant="outline"><Send className="h-4 w-4" /></Button>
                </form>
              </CardBody></Card>
            </div>
          ) : <Card app className="border-dashed"><EmptyState className="py-24" icon={NotebookPen} title="Select an assignment" desc="Review submissions, grade work and message the student." /></Card>}
        </div>
      </div>
      <Dialog open={showNew} onClose={() => setShowNew(false)} title="New assignment" desc={courseOf(courseId)?.title}>
        <div className="space-y-4">
          <Select app label="Assign to" value={nf.studentId} onChange={(e) => setNf((x) => ({ ...x, studentId: e.target.value }))}><option value="all">All students in this course ({students.length})</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Input app label="Title" required placeholder="e.g. Surah Al-Ikhlas — reading log" value={nf.title} onChange={(e) => setNf((x) => ({ ...x, title: e.target.value }))} />
          <Textarea app label="Instructions" required placeholder="What should the student do?" value={nf.description} onChange={(e) => setNf((x) => ({ ...x, description: e.target.value }))} />
          <Input app label="Attachment name (optional, demo)" placeholder="worksheet.pdf" value={nf.attachmentName} onChange={(e) => setNf((x) => ({ ...x, attachmentName: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setShowNew(false)}>Cancel</Button><Button app disabled={!nf.title || !nf.description} onClick={assign}>Assign</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function TeacherLessons() {
  const user = useCurrentUser()
  const state = useStore()
  const { createLesson, updateLesson, deleteLesson } = useStore()
  const myCourses = [...new Set(state.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.courseId))]
  const [courseId, setCourseId] = useState(myCourses[0] || '')
  const [showNew, setShowNew] = useState(false)
  const [nf, setNf] = useState({ title: '', objectives: '', materials: '' })
  const list = state.lessons.filter((l) => l.courseId === courseId && l.teacherId === user.teacherId).sort((a, b) => a.order - b.order)
  return (
    <div>
      <PageHeader icon={BookOpen} title="Lessons" subtitle="Create, publish, and manage lessons by course." actions={<Button app onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New lesson</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">{myCourses.map((cid) => <button key={cid} type="button" onClick={() => setCourseId(cid)} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium', courseId === cid ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 bg-white hover:bg-ink/5')}>{courseOf(cid)?.emoji} {courseOf(cid)?.title.slice(0, 24)}…</button>)}</div>
      <Card app><CardBody className="!py-3">
        {list.length === 0 && <EmptyState icon={BookOpen} title="No lessons yet" desc="Create lessons after choosing a course." action={<Button app onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Create lesson</Button>} />}
        <div className="divide-y divide-ink/5">
          {list.map((l) => (
            <div key={l.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">{l.order}</span>
                <div><p className="font-semibold">{l.title}</p><p className="text-sm text-ink/60">{l.objectives}</p>{l.materials?.length > 0 && <p className="mt-1 flex flex-wrap gap-1.5">{l.materials.map((m) => <span key={m} className="rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/60">📎 {m}</span>)}</p>}</div></div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge status={l.published ? 'active' : 'pending'}>{l.published ? 'Published' : 'Draft'}</Badge>
                <Button app variant="outline" size="sm" onClick={() => updateLesson(l.id, { published: !l.published })}>{l.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {l.published ? 'Unpublish' : 'Publish'}</Button>
                <button type="button" className="rounded-lg p-2 text-ink/40 hover:bg-coral-500/10 hover:text-coral-600" onClick={() => deleteLesson(l.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </CardBody></Card>
      <Dialog open={showNew} onClose={() => setShowNew(false)} title="New lesson" desc={courseOf(courseId)?.title}>
        <div className="space-y-4">
          <Input app label="Lesson title" required placeholder="e.g. Madd — natural lengthening" value={nf.title} onChange={(e) => setNf((x) => ({ ...x, title: e.target.value }))} />
          <Textarea app label="Objectives" placeholder="Students will be able to…" value={nf.objectives} onChange={(e) => setNf((x) => ({ ...x, objectives: e.target.value }))} />
          <Input app label="Materials (comma-separated)" placeholder="Tajweed chart (PDF), Practice audio" value={nf.materials} onChange={(e) => setNf((x) => ({ ...x, materials: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setShowNew(false)}>Cancel</Button><Button app disabled={!nf.title} onClick={() => { createLesson({ courseId, teacherId: user.teacherId, order: list.length + 1, title: nf.title, objectives: nf.objectives, materials: nf.materials ? nf.materials.split(',').map((s) => s.trim()) : [], published: false }); setShowNew(false); setNf({ title: '', objectives: '', materials: '' }); toast({ title: 'Lesson created', type: 'success' }) }}>Create lesson</Button></div>
        </div>
      </Dialog>
    </div>
  )
}
