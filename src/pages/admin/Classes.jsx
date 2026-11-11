import React, { useState } from 'react'
import { Plus, Search, Pencil, Pause, Play, Trash2, LayoutGrid } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { usePeople, SubjectChip, names, weeklySummary } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Confirm, EmptyState, Input, Badge } from '../../components/ui/index.jsx'
import ClassForm from './ClassForm.jsx'
import { cn } from '../../lib/utils.js'

export default function AdminClasses() {
  const classes = useStore((s) => s.classes)
  const sessions = useStore((s) => s.sessions)
  const { updateClass, deleteClass } = useStore()
  const { byId } = usePeople()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('active')
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const list = classes
    .filter((c) => status === 'all' || c.status === status)
    .filter((c) => !q || `${c.title} ${byId[c.teacherId]?.name} ${names(c.studentIds, byId)}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  const next = (c) => sessions.filter((s) => s.classId === c.id && s.status === 'scheduled' && new Date(s.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0]
  return (
    <div>
      <PageTitle title="Classes" subtitle="Every recurring class — who teaches it, who attends and when." actions={<Button app onClick={() => setForm({})}><Plus className="h-4 w-4" /> New class</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input app placeholder="Search class, teacher or student…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
        <div className="tabs">{[['active', 'Active'], ['paused', 'Paused'], ['all', 'All']].map(([v, l]) => <button key={v} type="button" onClick={() => setStatus(v)} className={cn('tab', status === v && 'tab-active')}>{l}</button>)}</div>
      </div>
      {list.length === 0 ? <div className="app-card"><EmptyState icon={LayoutGrid} title="No classes here" desc="Create a class to put it on the schedule." action={<Button app onClick={() => setForm({})}><Plus className="h-4 w-4" /> New class</Button>} /></div> : (
        <div className="space-y-3">
          {list.map((c) => { const n = next(c); return (
            <div key={c.id} className="app-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{c.title}</p><SubjectChip subjectId={c.subjectId} />{c.status !== 'active' && <Badge tone="bg-gray-100 text-gray-600" className="capitalize">{c.status}</Badge>}</div>
                <p className="mt-1 text-sm text-gray-600"><span className="text-gray-400">Teacher:</span> {byId[c.teacherId]?.name || '—'} · <span className="text-gray-400">Students:</span> {names(c.studentIds, byId)}</p>
                <p className="mt-0.5 text-sm text-gray-600"><span className="text-gray-400">Every</span> {weeklySummary(c.slots)}{n && <span className="text-gray-400"> · next {new Date(n.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button app size="sm" variant="outline" onClick={() => setForm({ editing: c })}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                {c.status === 'active'
                  ? <Button app size="sm" variant="outline" onClick={() => { updateClass(c.id, { status: 'paused' }); toast({ title: 'Class paused — future sessions removed' }) }}><Pause className="h-3.5 w-3.5" /> Pause</Button>
                  : <Button app size="sm" variant="outline" onClick={() => { updateClass(c.id, { status: 'active' }); toast({ title: 'Class resumed — sessions scheduled', type: 'success' }) }}><Play className="h-3.5 w-3.5" /> Resume</Button>}
                <Button app size="sm" variant="ghost" onClick={() => setDel(c)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
              </div>
            </div>) })}
        </div>
      )}
      {form && <ClassForm open editing={form.editing} onClose={() => setForm(null)} />}
      <Confirm open={!!del} onClose={() => setDel(null)} danger confirmText="Delete class" title={`Delete “${del?.title}”?`} desc="Upcoming sessions are removed. Past sessions stay in the history." onConfirm={() => { deleteClass(del.id); toast({ title: 'Class deleted' }) }} />
    </div>
  )
}
