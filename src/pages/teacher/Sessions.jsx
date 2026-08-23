import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isToday } from 'date-fns'
import { CalendarDays, ChevronRight, MessageSquare, PenTool, Play, Video, Wand2, Save, CalendarClock } from 'lucide-react'
import { useStore, useCurrentUser, effectiveStatus, sessionsForTeacher } from '../../lib/store.js'
import { toast } from '../../lib/store.js'
import { Badge, Button, Card, CardBody, EmptyState, Input, PageHeader, Select, Avatar } from '../../components/ui/index.jsx'
import { courseOf, JoinButton } from '../../components/app/Shared.jsx'
import { cn, fmtDateTime, fmtTime, byDate, cap } from '../../lib/utils.js'
import { COURSES } from '../../lib/data.js'

function planFor(topic, course) {
  return [
    { t: 'Warm-up & revision (7 min)', d: `Salaam & duas, then quick revision of the last lesson. Ask the student to recite/recall yesterday's portion.` },
    { t: `New concept: ${topic} (15 min)`, d: `Introduce "${topic}" with 2–3 clear examples from the Mushaf/workbook. Model first, then repeat together.` },
    { t: 'Guided practice (15 min)', d: 'Student practises while you correct gently. Alternate reading lines; note every recurring mistake in the feedback form.' },
    { t: 'Wrap-up & homework (8 min)', d: `Summarise what was learned, celebrate one win, assign practice of "${topic}" and record the next session goal.` },
  ]
}

export default function TeacherSessions() {
  const user = useCurrentUser()
  const state = useStore()
  const { updateSession } = useStore()
  const nav = useNavigate()
  const [courseFilter, setCourseFilter] = useState('all')
  const [kind, setKind] = useState('all')
  const [when, setWhen] = useState('today')
  const [activeId, setActiveId] = useState(null)
  const [topic, setTopic] = useState('')
  const [plan, setPlan] = useState(null)
  const now = new Date()
  const all = sessionsForTeacher(state, user.teacherId).filter((s) => (courseFilter === 'all' || s.courseId === courseFilter) && (kind === 'all' || (kind === 'trial' ? s.type === 'trial' : s.type !== 'trial')))
  const buckets = {
    today: all.filter((s) => isToday(new Date(s.start))).sort(byDate('start')),
    upcoming: all.filter((s) => new Date(s.start) > now && !isToday(new Date(s.start)) && s.status === 'scheduled').sort(byDate('start')),
    done: all.filter((s) => s.status === 'completed').sort(byDate('start', -1)),
    missed: all.filter((s) => ['missed', 'cancelled'].includes(effectiveStatus(s))).sort(byDate('start', -1)),
  }
  const counts = { today: buckets.today.length, upcoming: buckets.upcoming.length, completed: buckets.done.length, missed: buckets.missed.length }
  const list = buckets[when] || []
  const active = all.find((s) => s.id === activeId)
  const teacherCourses = [...new Set(sessionsForTeacher(state, user.teacherId).map((s) => s.courseId))].map(courseOf).filter(Boolean)
  const nameOf = (s) => s.studentIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
  const select = (s) => { setActiveId(s.id); setTopic(s.topic || ''); setPlan(null) }
  const saveTopic = () => { updateSession(active.id, { topic }); toast({ title: 'Lesson topic saved', type: 'success' }) }
  return (
    <div>
      <PageHeader icon={Video} title="Sessions" subtitle="Manage your teaching sessions" actions={
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge bg-sun-400/15 text-sun-600">◉ {counts.today} today</span><span className="badge bg-brand-100 text-brand-700">▤ {counts.upcoming} upcoming</span>
          <span className="badge bg-emerald-100 text-emerald-700">✓ {counts.completed} completed</span><span className="badge bg-coral-500/10 text-coral-600">⚠ {counts.missed} missed</span>
        </div>} />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div>
          <Select app value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}><option value="all">All courses ({teacherCourses.length})</option>{teacherCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
          <div className="tabs mt-3 w-full">{['all', 'trial', 'regular'].map((k) => <button key={k} type="button" className={cn('tab flex-1', kind === k && 'tab-active')} onClick={() => setKind(k)}>{cap(k)}</button>)}</div>
          <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-lg border border-ink/10 bg-white text-center text-sm">
            {[['today', 'Today'], ['upcoming', 'Upcoming'], ['done', 'Done'], ['missed', 'Missed']].map(([k, l]) => <button key={k} type="button" onClick={() => setWhen(k)} className={cn('border-r border-ink/10 py-2 last:border-r-0', when === k ? 'bg-white font-bold shadow-inner' : 'bg-ink/3 text-ink/60 hover:bg-ink/5')}>{l}<span className="block text-xs font-normal text-ink/50">{k === 'done' ? counts.completed : counts[k === 'missed' ? 'missed' : k]}</span></button>)}
          </div>
          <div className="mt-3 space-y-2">
            {list.slice(0, 30).map((s) => (
              <button key={s.id} type="button" onClick={() => select(s)} className={cn('w-full rounded-xl border bg-white p-3.5 text-left shadow-sm transition-colors', activeId === s.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink/8 hover:border-brand-300')}>
                <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{courseOf(s.courseId)?.title} — {nameOf(s)}</p><ChevronRight className="h-4 w-4 shrink-0 text-ink/30" /></div>
                <p className="mt-1 text-xs text-ink/60">👤 {nameOf(s)}</p>
                <p className="mt-0.5 flex items-center justify-between text-xs text-ink/60"><span>🕐 {when === 'today' ? fmtTime(s.start) : fmtDateTime(s.start)}</span><Badge status={effectiveStatus(s)} className="!text-[10px]" /></p>
              </button>
            ))}
            {list.length === 0 && <EmptyState icon={CalendarDays} title="No sessions here" desc="Pick another tab or course filter." />}
          </div>
        </div>
        <div>
          {active ? (
            <div className="space-y-4">
              <Card app><CardBody className="!p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="flex items-center gap-2 text-lg font-bold"><span>📖</span> {courseOf(active.courseId)?.title} — {nameOf(active)}</p>
                    <p className="mt-1 text-sm text-ink/70">Student{active.studentIds.length > 1 ? 's' : ''}: <b>{nameOf(active)}</b></p>
                    <p className="text-sm text-ink/60">{fmtDateTime(active.start)} · {fmtTime(active.start)}–{fmtTime(active.end)}</p></div>
                  <Badge status={effectiveStatus(active)} />
                </div>
                <div className="mt-4 rounded-xl bg-ink/4 p-4">
                  <p className="text-sm font-semibold">Lesson Topic</p>
                  <div className="mt-2 flex gap-2"><Input app placeholder="e.g. Noon Sakinah — the four rules" value={topic} onChange={(e) => setTopic(e.target.value)} /><Button app variant="outline" onClick={saveTopic} disabled={!topic || topic === active.topic}><Save className="h-4 w-4" /> Save</Button></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button app onClick={() => nav(`/classroom/${active.id}`)} disabled={['completed', 'cancelled'].includes(active.status)}><Play className="h-4 w-4" /> Enter Classroom</Button>
                  <Button app variant="outline" onClick={() => nav(`/classroom/${active.id}?tab=whiteboard`)}><PenTool className="h-4 w-4" /> Whiteboard</Button>
                  <Button app variant="outline" onClick={() => { const st = state.users.find((u) => u.id === active.studentIds[0]); const target = st?.parentId ? st.parentId : active.studentIds[0]; const id = useStore.getState().startConversation([user.id, target]); nav('/teacher/messages') }}><MessageSquare className="h-4 w-4" /> Chat</Button>
                </div>
              </CardBody></Card>
              <Card app className="border-sun-400/40 bg-gradient-to-b from-sun-400/8 to-white">
                <CardBody className="!p-5">
                  <span className="badge border border-sun-400/50 bg-white text-sun-600">PREP ASSISTANT</span>
                  {!plan ? (<>
                    <h3 className="mt-3 text-2xl font-bold">{active.topic ? `Plan for: ${active.topic}` : 'No plan yet'}</h3>
                    <p className="mt-1 text-sm text-ink/60">{active.topic ? 'Generate a structured 45-minute plan for this topic.' : 'Add a lesson topic above, then generate a tailored 45-minute plan.'}</p>
                    <Button app className="mt-4" disabled={!active.topic && !topic} onClick={() => setPlan(planFor(active.topic || topic, courseOf(active.courseId)))}><Wand2 className="h-4 w-4" /> Draft Lesson Plan</Button>
                    <p className="mt-2 text-[11px] text-ink/45">Demo generator (free). Production version would call an LLM API — see Services & Costs.</p>
                  </>) : (<>
                    <h3 className="mt-3 text-lg font-bold">45-minute plan — {active.topic || topic}</h3>
                    <ol className="mt-3 space-y-3">{plan.map((p, i) => <li key={i} className="rounded-xl border border-ink/8 bg-white p-3.5"><p className="text-sm font-semibold">{i + 1}. {p.t}</p><p className="mt-1 text-sm text-ink/70">{p.d}</p></li>)}</ol>
                  </>)}
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card app className="border-dashed"><EmptyState className="py-24" icon={CalendarDays} title="Pick a session on the left" desc="Choose any class to see its lesson topic, prep plan, and wrap-up actions." /></Card>
          )}
        </div>
      </div>
    </div>
  )
}
