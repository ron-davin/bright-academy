import React, { useMemo, useState } from 'react'
import { AlertTriangle, Plus, Trash2, Search, CircleCheck } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { SUBJECTS, subjectById } from '../../lib/data.js'
import { expandClass, findConflicts, outsideAvailability, addDays, ymd } from '../../lib/schedule.js'
import { usePeople, SubjectIcon, names } from '../../components/app/common.jsx'
import { Button, Dialog, Input, Select } from '../../components/ui/index.jsx'
import { cn, DAYS, TIME_OPTIONS, timeLabel, fmtTime } from '../../lib/utils.js'

const LENGTHS = [30, 45, 60, 90]
const fmtWhen = (iso) => `${new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${fmtTime(iso)}`

export default function ClassForm({ open, onClose, editing, prefill }) {
  const { teachers, students, byId } = usePeople()
  const sessions = useStore((s) => s.sessions)
  const availability = useStore((s) => s.availability)
  const { createClass, updateClass } = useStore()
  const init = editing || { subjectId: '', teacherId: '', studentIds: [], slots: prefill?.slots || [{ day: 1, time: '17:00', minutes: 45 }], startDate: prefill?.startDate || ymd(new Date()), endDate: '', title: '' }
  const [f, setF] = useState({ ...init, endDate: init.endDate || '' })
  const [q, setQ] = useState('')
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  const subjectTeachers = teachers.filter((t) => t.active !== false && (!f.subjectId || (t.subjects || []).includes(f.subjectId)))
  const teacherList = subjectTeachers.length ? subjectTeachers : teachers.filter((t) => t.active !== false)
  const studentList = students.filter((s) => s.active !== false && (!q || s.name.toLowerCase().includes(q.toLowerCase())))

  const { conflicts, outside } = useMemo(() => {
    if (!f.teacherId || !f.slots.length || !f.startDate) return { conflicts: [], outside: [] }
    const now = new Date()
    const proposed = expandClass({ ...f, id: 'draft', status: 'active', endDate: f.endDate || null }, now, addDays(now, 56))
    const raw = findConflicts(proposed, sessions, { teacherId: f.teacherId, studentIds: f.studentIds, ignoreClassId: editing?.id })
    const seen = new Set(); const uniq = []
    for (const c of raw) { const k = `${c.who}${c.personId}${c.existing.classId || c.existing.id}`; if (!seen.has(k)) { seen.add(k); uniq.push(c) } }
    return { conflicts: uniq, outside: outsideAvailability(f.slots, availability[f.teacherId] || []) }
  }, [f, sessions, availability, editing])

  const valid = f.subjectId && f.teacherId && f.studentIds.length && f.slots.length && f.startDate
  const save = () => {
    const title = f.title.trim() || `${subjectById(f.subjectId).name} — ${names(f.studentIds, byId)}`
    const data = { title, subjectId: f.subjectId, teacherId: f.teacherId, studentIds: f.studentIds, slots: f.slots, startDate: f.startDate, endDate: f.endDate || null }
    if (editing) { updateClass(editing.id, data); toast({ title: 'Class updated', desc: 'Future sessions were rescheduled.', type: 'success' }) }
    else { createClass(data); toast({ title: 'Class created', desc: 'Sessions added for the next 8 weeks.', type: 'success' }) }
    onClose()
  }
  const toggleStudent = (id) => set({ studentIds: f.studentIds.includes(id) ? f.studentIds.filter((x) => x !== id) : [...f.studentIds, id] })
  const updateSlot = (i, patch) => set({ slots: f.slots.map((s, k) => (k === i ? { ...s, ...patch } : s)) })

  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit class' : 'New class'} desc={editing ? 'Changes apply to future sessions. Past sessions stay as they were.' : 'Pick a subject, teacher, students and weekly times.'} size="lg">
      <div className="space-y-6">
        {/* 1 Subject */}
        <div>
          <p className="label">1. Subject</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s.id} type="button" onClick={() => set({ subjectId: s.id, teacherId: (byId[f.teacherId]?.subjects || []).includes(s.id) ? f.teacherId : '' })}
                className={cn('inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium', f.subjectId === s.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-gray-200 hover:bg-gray-50')}>
                <SubjectIcon subjectId={s.id} className="h-4 w-4" />{s.name}
              </button>
            ))}
          </div>
        </div>
        {/* 2 Teacher */}
        <div>
          <p className="label">2. Teacher</p>
          <Select app value={f.teacherId} onChange={(e) => set({ teacherId: e.target.value })}>
            <option value="">Choose a teacher…</option>
            {teacherList.map((t) => <option key={t.id} value={t.id}>{t.name}{t.subjects?.length ? ` — ${t.subjects.map((x) => subjectById(x).name).join(', ')}` : ''}</option>)}
          </Select>
          {f.subjectId && !subjectTeachers.length && <p className="mt-1.5 text-xs text-amber-700">No teacher has {subjectById(f.subjectId).name} in their subjects yet — showing all teachers. Add subjects in People.</p>}
        </div>
        {/* 3 Students */}
        <div>
          <p className="label">3. Students <span className="font-normal text-gray-400">({f.studentIds.length} selected — 1 for one-on-one, more for a group)</span></p>
          {f.studentIds.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">{f.studentIds.map((id) => <button key={id} type="button" onClick={() => toggleStudent(id)} className="rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">{byId[id]?.name} ✕</button>)}</div>}
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input app placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 thin-scroll">
            {studentList.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 text-sm last:border-0 hover:bg-gray-50">
                <input type="checkbox" checked={f.studentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} className="h-4 w-4 accent-brand-600" />
                <span className="flex-1">{s.name}</span><span className="text-xs text-gray-400">{s.email}</span>
              </label>
            ))}
            {studentList.length === 0 && <p className="px-3 py-4 text-center text-sm text-gray-400">No students found. Add them in People.</p>}
          </div>
        </div>
        {/* 4 Weekly times */}
        <div>
          <p className="label">4. Weekly times</p>
          <div className="space-y-2">
            {f.slots.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Select app value={s.day} onChange={(e) => updateSlot(i, { day: +e.target.value })} className="w-36">{[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}</Select>
                <Select app value={s.time} onChange={(e) => updateSlot(i, { time: e.target.value })} className="w-32">{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select>
                <Select app value={s.minutes} onChange={(e) => updateSlot(i, { minutes: +e.target.value })} className="w-28">{LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}</Select>
                {f.slots.length > 1 && <button type="button" onClick={() => set({ slots: f.slots.filter((_, k) => k !== i) })} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove day"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          <Button app variant="ghost" size="sm" className="mt-2" onClick={() => set({ slots: [...f.slots, { ...f.slots[f.slots.length - 1], day: (f.slots[f.slots.length - 1].day + 2) % 7 }] })}><Plus className="h-4 w-4" /> Add another day</Button>
        </div>
        {/* 5 Dates */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Input app label="5. Starts on" type="date" value={f.startDate} onChange={(e) => set({ startDate: e.target.value })} />
          <Input app label="Ends on (optional)" type="date" value={f.endDate} onChange={(e) => set({ endDate: e.target.value })} />
          <Input app label="Class name (optional)" placeholder="Auto" value={f.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        {/* Checks */}
        {f.teacherId && f.studentIds.length > 0 && (
          conflicts.length ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> Double-booked — change the time to continue</p>
              <ul className="mt-2 space-y-1 text-red-700">{conflicts.slice(0, 5).map((c, i) => <li key={i}>• {byId[c.personId]?.name || 'Someone'} already has {subjectById(c.existing.subjectId).name} on {fmtWhen(c.existing.start)}</li>)}</ul>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CircleCheck className="h-4 w-4" /> No clashes for the teacher or students in the next 8 weeks</p>
          )
        )}
        {outside.length > 0 && <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> {outside.map((s) => `${DAYS[s.day]} ${timeLabel(s.time)}`).join(', ')} is outside {byId[f.teacherId]?.name}'s availability. You can still save.</p>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button app variant="outline" onClick={onClose}>Cancel</Button>
          <Button app disabled={!valid || conflicts.length > 0} onClick={save}>{editing ? 'Save changes' : 'Create class'}</Button>
        </div>
      </div>
    </Dialog>
  )
}
