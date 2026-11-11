import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CalendarPlus, AlertTriangle, Pencil, Ban, RotateCcw, Trash2, Video } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { SUBJECTS, subjectById } from '../../lib/data.js'
import { startOfWeek, weekDays, findConflicts, fromYmd, at, ymd } from '../../lib/schedule.js'
import { usePeople, WeekCalendar, SubjectChip, StatusBadge, names } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Dialog, Input, Select } from '../../components/ui/index.jsx'
import ClassForm from './ClassForm.jsx'
import { TIME_OPTIONS, timeLabel, fmtTime, cn } from '../../lib/utils.js'

const LENGTHS = [30, 45, 60, 90]
const hhmm = (d) => `${String(new Date(d).getHours()).padStart(2, '0')}:${String(new Date(d).getMinutes()).padStart(2, '0')}`
const fmtWhen = (iso) => `${new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, ${fmtTime(iso)}`

function ConflictNote({ conflicts, byId }) {
  if (!conflicts.length) return null
  return <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{byId[conflicts[0].personId]?.name || 'Someone'} already has {subjectById(conflicts[0].existing.subjectId).name} at {fmtTime(conflicts[0].existing.start)} that day.</p>
}

function SessionPanel({ sess, onClose, onEditClass }) {
  const { byId, teachers } = usePeople()
  const sessions = useStore((s) => s.sessions)
  const cls = useStore((s) => s.classes.find((c) => c.id === sess.classId))
  const { moveSession, updateSession } = useStore()
  const nav = useNavigate()
  const [mode, setMode] = useState(null)
  const minutes = Math.round((new Date(sess.end) - new Date(sess.start)) / 6e4)
  const [mv, setMv] = useState({ date: ymd(sess.start), time: hhmm(sess.start), minutes })
  const [teacherId, setTeacherId] = useState(sess.teacherId)
  const moved = useMemo(() => { const start = at(fromYmd(mv.date), mv.time); return { start: start.toISOString(), end: new Date(+start + mv.minutes * 6e4).toISOString() } }, [mv])
  const moveConflicts = findConflicts([moved], sessions, { teacherId: sess.teacherId, studentIds: sess.studentIds, ignoreSessionId: sess.id })
  const teacherConflicts = findConflicts([sess], sessions, { teacherId, ignoreSessionId: sess.id })
  const del = () => { useStore.setState((s) => ({ sessions: s.sessions.filter((x) => x.id !== sess.id) })); toast({ title: 'Extra class deleted' }); onClose() }
  return (
    <Dialog open onClose={onClose} size="md" title={subjectById(sess.subjectId).name} desc={fmtWhen(sess.start) + ` · ${minutes} min`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><SubjectChip subjectId={sess.subjectId} /><StatusBadge status={sess.status} />{sess.oneOff && <span className="badge bg-gray-100 text-gray-600">Extra class</span>}{sess.moved && <span className="badge bg-amber-50 text-amber-700">Moved</span>}</div>
        <dl className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
          <dt className="text-gray-500">Teacher</dt><dd className="font-medium">{byId[sess.teacherId]?.name || '—'}</dd>
          <dt className="text-gray-500">Students</dt><dd className="font-medium">{names(sess.studentIds, byId) || '—'}</dd>
          {cls && <><dt className="text-gray-500">Class</dt><dd>{cls.title}</dd></>}
          {sess.topic && <><dt className="text-gray-500">Topic</dt><dd>{sess.topic}</dd></>}
          {sess.homework && <><dt className="text-gray-500">Homework</dt><dd>{sess.homework}</dd></>}
        </dl>

        {mode === 'move' && (
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <p className="font-semibold">Move this session</p>
            <div className="grid grid-cols-3 gap-2">
              <Input app type="date" value={mv.date} onChange={(e) => setMv((x) => ({ ...x, date: e.target.value }))} />
              <Select app value={mv.time} onChange={(e) => setMv((x) => ({ ...x, time: e.target.value }))}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select>
              <Select app value={mv.minutes} onChange={(e) => setMv((x) => ({ ...x, minutes: +e.target.value }))}>{LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}</Select>
            </div>
            <ConflictNote conflicts={moveConflicts} byId={byId} />
            <div className="flex justify-end gap-2"><Button app variant="ghost" onClick={() => setMode(null)}>Back</Button><Button app disabled={moveConflicts.length > 0} onClick={() => { moveSession(sess.id, moved.start, moved.end); toast({ title: 'Session moved', type: 'success' }); onClose() }}>Move session</Button></div>
          </div>
        )}
        {mode === 'teacher' && (
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <p className="font-semibold">Substitute teacher for this session</p>
            <Select app value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>{teachers.filter((t) => t.active !== false).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
            <ConflictNote conflicts={teacherConflicts} byId={byId} />
            <div className="flex justify-end gap-2"><Button app variant="ghost" onClick={() => setMode(null)}>Back</Button><Button app disabled={teacherConflicts.length > 0 || teacherId === sess.teacherId} onClick={() => { updateSession(sess.id, { teacherId }); toast({ title: 'Teacher changed for this session', type: 'success' }); onClose() }}>Save</Button></div>
          </div>
        )}

        {!mode && (
          <div className="grid gap-2 sm:grid-cols-2">
            {sess.status === 'scheduled' && <Button app variant="outline" onClick={() => setMode('move')}><CalendarPlus className="h-4 w-4" /> Move this session</Button>}
            {sess.status === 'scheduled' && <Button app variant="outline" onClick={() => setMode('teacher')}><Pencil className="h-4 w-4" /> Change teacher</Button>}
            {sess.status === 'scheduled' && <Button app variant="outline" onClick={() => { updateSession(sess.id, { status: 'cancelled' }); toast({ title: 'Session cancelled' }); onClose() }}><Ban className="h-4 w-4" /> Cancel session</Button>}
            {sess.status === 'cancelled' && <Button app variant="outline" onClick={() => { updateSession(sess.id, { status: 'scheduled' }); toast({ title: 'Session restored', type: 'success' }); onClose() }}><RotateCcw className="h-4 w-4" /> Restore session</Button>}
            {cls && <Button app variant="outline" onClick={() => onEditClass(cls)}><Pencil className="h-4 w-4" /> Edit whole class</Button>}
            {sess.oneOff && sess.status !== 'completed' && <Button app variant="outline" onClick={del}><Trash2 className="h-4 w-4" /> Delete extra class</Button>}
            {['scheduled', 'live'].includes(sess.status) && <Button app variant="ghost" onClick={() => nav(`/class/${sess.id}`)}><Video className="h-4 w-4" /> Open classroom</Button>}
          </div>
        )}
      </div>
    </Dialog>
  )
}

function OneOffForm({ onClose, prefill }) {
  const { teachers, students, byId } = usePeople()
  const sessions = useStore((s) => s.sessions)
  const addOneOff = useStore((s) => s.addOneOff)
  const [f, setF] = useState({ subjectId: SUBJECTS[0].id, teacherId: '', studentIds: [], date: prefill?.date || ymd(new Date()), time: prefill?.time || '17:00', minutes: 45 })
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const start = at(fromYmd(f.date), f.time); const end = new Date(+start + f.minutes * 6e4)
  const conflicts = f.teacherId ? findConflicts([{ start: start.toISOString(), end: end.toISOString() }], sessions, { teacherId: f.teacherId, studentIds: f.studentIds }) : []
  const valid = f.teacherId && f.studentIds.length
  return (
    <Dialog open onClose={onClose} title="Extra class" desc="A single session — e.g. a make-up or trial lesson." size="md">
      <div className="space-y-4">
        <Select app label="Subject" value={f.subjectId} onChange={(e) => set({ subjectId: e.target.value })}>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        <Select app label="Teacher" value={f.teacherId} onChange={(e) => set({ teacherId: e.target.value })}><option value="">Choose…</option>{teachers.filter((t) => t.active !== false).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
        <div><span className="label">Students</span><div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 thin-scroll">{students.filter((s) => s.active !== false).map((s) => (
          <label key={s.id} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 text-sm last:border-0 hover:bg-gray-50"><input type="checkbox" checked={f.studentIds.includes(s.id)} onChange={() => set({ studentIds: f.studentIds.includes(s.id) ? f.studentIds.filter((x) => x !== s.id) : [...f.studentIds, s.id] })} className="h-4 w-4 accent-brand-600" />{s.name}</label>))}</div></div>
        <div className="grid grid-cols-3 gap-2">
          <Input app label="Date" type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} />
          <Select app label="Time" value={f.time} onChange={(e) => set({ time: e.target.value })}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select>
          <Select app label="Length" value={f.minutes} onChange={(e) => set({ minutes: +e.target.value })}>{LENGTHS.map((m) => <option key={m} value={m}>{m} min</option>)}</Select>
        </div>
        <ConflictNote conflicts={conflicts} byId={byId} />
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><Button app variant="outline" onClick={onClose}>Cancel</Button>
          <Button app disabled={!valid || conflicts.length > 0} onClick={() => { addOneOff({ subjectId: f.subjectId, teacherId: f.teacherId, studentIds: f.studentIds, start: start.toISOString(), end: end.toISOString(), classId: null }); toast({ title: 'Extra class added', type: 'success' }); onClose() }}>Add extra class</Button></div>
      </div>
    </Dialog>
  )
}

export default function AdminSchedule() {
  const { byId, teachers, students } = usePeople()
  const sessions = useStore((s) => s.sessions)
  const availability = useStore((s) => s.availability)
  const [week, setWeek] = useState(startOfWeek(new Date()))
  const [filter, setFilter] = useState({ teacherId: '', studentId: '', subjectId: '' })
  const [panel, setPanel] = useState(null)
  const [classForm, setClassForm] = useState(null) // {editing?, prefill?}
  const [oneOff, setOneOff] = useState(null)
  const days = weekDays(week)
  const visible = sessions.filter((s) => new Date(s.start) >= days[0] && new Date(s.start) < new Date(+days[6] + 864e5)
    && (!filter.teacherId || s.teacherId === filter.teacherId) && (!filter.studentId || s.studentIds.includes(filter.studentId)) && (!filter.subjectId || s.subjectId === filter.subjectId))
  const label = (s) => `${byId[s.teacherId]?.name?.split(' ')[0] || ''} · ${names(s.studentIds, byId)}`
  return (
    <div>
      <PageTitle title="Schedule" subtitle="Click an empty time to create a class, or a class to move, cancel or change it."
        actions={<><Button app variant="outline" onClick={() => setOneOff({})}><CalendarPlus className="h-4 w-4" /> Extra class</Button><Button app onClick={() => setClassForm({})}><Plus className="h-4 w-4" /> New class</Button></>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select app value={filter.teacherId} onChange={(e) => setFilter((x) => ({ ...x, teacherId: e.target.value }))} className="w-48"><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
        <Select app value={filter.studentId} onChange={(e) => setFilter((x) => ({ ...x, studentId: e.target.value }))} className="w-48"><option value="">All students</option>{students.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
        <Select app value={filter.subjectId} onChange={(e) => setFilter((x) => ({ ...x, subjectId: e.target.value }))} className="w-48"><option value="">All subjects</option>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        {(filter.teacherId || filter.studentId || filter.subjectId) && <Button app variant="ghost" onClick={() => setFilter({ teacherId: '', studentId: '', subjectId: '' })}>Clear filters</Button>}
      </div>
      <WeekCalendar week={week} onWeek={setWeek} sessions={visible} label={label} onSessionClick={setPanel}
        availability={filter.teacherId ? availability[filter.teacherId] || [] : []}
        onSlotClick={(d, time) => setClassForm({ prefill: { slots: [{ day: d.getDay(), time, minutes: 45 }], startDate: ymd(d) } })} />
      {filter.teacherId && <p className="mt-2 text-xs text-gray-500"><span className="mr-1 inline-block h-3 w-3 rounded bg-brand-50 align-middle ring-1 ring-brand-100" /> Shaded = {byId[filter.teacherId]?.name}'s available hours</p>}
      <div className={cn('mt-3 flex flex-wrap gap-3 text-xs text-gray-500')}>{SUBJECTS.map((s) => <span key={s.id} className="flex items-center gap-1.5"><span className={cn('h-2.5 w-2.5 rounded-full', s.dot)} />{s.name}</span>)}</div>
      {panel && <SessionPanel key={panel.id} sess={sessions.find((s) => s.id === panel.id) || panel} onClose={() => setPanel(null)} onEditClass={(cls) => { setPanel(null); setClassForm({ editing: cls }) }} />}
      {classForm && <ClassForm open editing={classForm.editing} prefill={classForm.prefill} onClose={() => setClassForm(null)} />}
      {oneOff && <OneOffForm prefill={oneOff} onClose={() => setOneOff(null)} />}
    </div>
  )
}
