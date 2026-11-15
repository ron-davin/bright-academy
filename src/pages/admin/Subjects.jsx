import React, { useState } from 'react'
import { Plus, Pencil, Eye, EyeOff, Trash2, Shapes } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { SUBJECT_COLORS, SUBJECT_ICONS, DEFAULT_SUBJECTS } from '../../lib/data.js'
import { usePeople, useSubjects, Icons } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Confirm, Dialog, EmptyState, Input, Textarea, Badge } from '../../components/ui/index.jsx'
import { cn, uid } from '../../lib/utils.js'

const slug = (name) => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)

function SubjectForm({ subject, existing, onClose }) {
  const saveSubject = useStore((s) => s.saveSubject)
  const editing = !!subject
  const [f, setF] = useState({ name: subject?.name || '', desc: subject?.desc || '', icon: subject?.icon || 'BookOpen', colorKey: subject?.colorKey || 'sky' })
  const dupe = existing.some((s) => s.id !== subject?.id && s.name.trim().toLowerCase() === f.name.trim().toLowerCase())
  const submit = (e) => {
    e.preventDefault()
    if (dupe) return
    let id = subject?.id
    if (!id) { id = slug(f.name) || uid('subj'); if (existing.some((s) => s.id === id)) id = `${id}-${uid('').slice(-4)}` }
    saveSubject({ ...(subject || {}), id, name: f.name.trim(), desc: f.desc.trim(), icon: f.icon, colorKey: f.colorKey })
    toast({ title: editing ? 'Subject saved' : `${f.name.trim()} added`, type: 'success' })
    onClose()
  }
  const Preview = Icons[f.icon] || Icons.BookOpen
  return (
    <Dialog open onClose={onClose} title={editing ? `Edit ${subject.name}` : 'Add subject'} desc="Subjects appear on the homepage, the free-trial form and when creating classes." size="md">
      <form onSubmit={submit} className="space-y-4">
        <Input app label="Subject name" required maxLength={40} placeholder="e.g. Chess, Piano, Art" value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} error={dupe ? 'A subject with this name already exists.' : undefined} />
        <Textarea app label="Short description (shown on the homepage)" rows={2} maxLength={140} placeholder="One sentence about what students learn." value={f.desc} onChange={(e) => setF((x) => ({ ...x, desc: e.target.value }))} />
        <div><span className="label">Colour</span>
          <div className="flex flex-wrap gap-2">{Object.entries(SUBJECT_COLORS).map(([k, c]) => (
            <button key={k} type="button" aria-label={k} onClick={() => setF((x) => ({ ...x, colorKey: k }))} className={cn('h-8 w-8 rounded-full ring-offset-2', c.dot, f.colorKey === k ? 'ring-2 ring-brand-600' : 'hover:ring-2 hover:ring-gray-300')} />))}</div></div>
        <div><span className="label">Icon</span>
          <div className="grid grid-cols-8 gap-1.5">{SUBJECT_ICONS.map((n) => { const I = Icons[n]; return (
            <button key={n} type="button" aria-label={n} onClick={() => setF((x) => ({ ...x, icon: n }))} className={cn('flex h-10 items-center justify-center rounded-xl border', f.icon === n ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}><I className="h-5 w-5" /></button>) })}</div></div>
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', SUBJECT_COLORS[f.colorKey].color)}><Preview className="h-5 w-5" /></span>
          <div><p className="font-semibold text-ink">{f.name.trim() || 'Subject name'}</p><p className="text-xs text-gray-500">Preview</p></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><Button app variant="outline" onClick={onClose}>Cancel</Button><Button app type="submit" disabled={!f.name.trim() || dupe}>{editing ? 'Save' : 'Add subject'}</Button></div>
      </form>
    </Dialog>
  )
}

export default function Subjects() {
  const subjects = useSubjects({ all: true })
  const classes = useStore((s) => s.classes)
  const sessions = useStore((s) => s.sessions)
  const { saveSubject, removeSubject } = useStore()
  const { teachers } = usePeople()
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const inUse = (id) => classes.some((c) => c.subjectId === id) || sessions.some((s) => s.subjectId === id)
  const toggle = (s) => { saveSubject({ ...s, hidden: !s.hidden }); toast({ title: s.hidden ? `${s.name} is visible again` : `${s.name} hidden`, desc: s.hidden ? undefined : 'Existing classes keep running.' }) }
  return (
    <div>
      <PageTitle title="Subjects" subtitle="What the academy teaches. Hidden subjects are not offered for new classes or on the homepage — existing classes keep running."
        actions={<Button app onClick={() => setForm({})}><Plus className="h-4 w-4" /> Add subject</Button>} />
      {subjects.length === 0 ? <div className="app-card"><EmptyState icon={Shapes} title="No subjects yet" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => {
            const I = Icons[s.icon] || Icons.BookOpen
            const tCount = teachers.filter((t) => (t.subjects || []).includes(s.id)).length
            const cCount = classes.filter((c) => c.subjectId === s.id && c.status === 'active').length
            const builtIn = DEFAULT_SUBJECTS.some((d) => d.id === s.id)
            return (
              <div key={s.id} className={cn('app-card flex flex-col p-5', s.hidden && 'opacity-60')}>
                <div className="flex items-start gap-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', s.color)}><I className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{s.name}</p>{s.hidden && <Badge tone="bg-gray-100 text-gray-600">Hidden</Badge>}</div>
                    <p className="mt-0.5 text-xs text-gray-500">{tCount} teacher{tCount === 1 ? '' : 's'} · {cCount} active class{cCount === 1 ? '' : 'es'}</p></div>
                </div>
                {s.desc && <p className="mt-3 text-sm text-gray-600">{s.desc}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button app size="sm" variant="outline" onClick={() => setForm({ subject: s })}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button app size="sm" variant="outline" onClick={() => toggle(s)}>{s.hidden ? <><Eye className="h-3.5 w-3.5" /> Show</> : <><EyeOff className="h-3.5 w-3.5" /> Hide</>}</Button>
                  {!builtIn && !inUse(s.id) && <Button app size="sm" variant="ghost" onClick={() => setDel(s)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}
                </div>
              </div>)
          })}
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500">Tip: after adding a subject, open <b>People → Teachers</b> and tick it for the teachers who teach it.</p>
      {form && <SubjectForm subject={form.subject} existing={subjects} onClose={() => setForm(null)} />}
      <Confirm open={!!del} onClose={() => setDel(null)} danger confirmText="Delete subject" title={`Delete “${del?.name}”?`} desc="It has no classes, so nothing else changes." onConfirm={() => { removeSubject(del.id); toast({ title: 'Subject deleted' }) }} />
    </div>
  )
}
