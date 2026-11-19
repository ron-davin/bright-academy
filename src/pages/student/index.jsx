import React from 'react'
import { CalendarDays, BookMarked, NotebookPen } from 'lucide-react'
import { useStore, useMe } from '../../lib/store.js'
import { subjectById } from '../../lib/data.js'
import { sameDay, isJoinable, addDays, startOfDay } from '../../lib/schedule.js'
import { usePeople, SessionRow, SubjectIcon, SubjectChip, ClassStartButtons, weeklySummary } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { EmptyState } from '../../components/ui/index.jsx'
import { cn, fmtTime, greeting } from '../../lib/utils.js'

const byStart = (a, b) => new Date(a.start) - new Date(b.start)
const useMine = () => { const me = useMe(); return useStore((s) => s.sessions).filter((x) => x.studentIds?.includes(me?.id)) }
const teacherName = (byId, s) => byId[s.teacherId]?.name || 'Your teacher'
const dayLabel = (d) => { const now = new Date(); if (sameDay(d, now)) return 'Today'; if (sameDay(d, addDays(now, 1))) return 'Tomorrow'; return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }

export function StudentToday() {
  const me = useMe()
  const { byId } = usePeople()
  const mine = useMine().sort(byStart)
  const now = new Date()
  const next = mine.find((s) => s.status !== 'cancelled' && new Date(s.end) > now)
  const homework = [...mine].filter((s) => s.homework && s.status !== 'cancelled' && new Date(s.start) < addDays(now, 7)).sort((a, b) => new Date(b.start) - new Date(a.start)).slice(0, 3)
  const cancelledSoon = mine.filter((s) => s.status === 'cancelled' && new Date(s.start) > now && new Date(s.start) < addDays(now, 7))
  return (
    <div>
      <PageTitle title={`${greeting()}, ${me.firstName || me.name}!`} />
      {next ? (
        <div className={cn('app-card mb-6 p-6 sm:p-8', isJoinable(next) ? 'border-emerald-300 bg-emerald-50/50' : 'border-brand-200 bg-brand-50/40')}>
          <p className="text-sm font-semibold text-brand-700">{next.status === 'live' ? 'Your class is live now' : `Next class · ${dayLabel(next.start)}`}</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border', subjectById(next.subjectId).color)}><SubjectIcon subjectId={next.subjectId} className="h-8 w-8" /></span>
            <div className="flex-1"><p className="text-2xl font-bold text-ink">{subjectById(next.subjectId).name}</p><p className="text-lg text-gray-600">{fmtTime(next.start)} – {fmtTime(next.end)} · with {teacherName(byId, next)}</p></div>
            <ClassStartButtons sess={next} />
          </div>
        </div>
      ) : <div className="app-card mb-6"><EmptyState icon={CalendarDays} title="No classes scheduled yet" desc="The academy will add your classes soon." /></div>}
      {cancelledSoon.length > 0 && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{cancelledSoon.map((s) => <p key={s.id}>Cancelled: {subjectById(s.subjectId).name} on {dayLabel(s.start)} at {fmtTime(s.start)}</p>)}</div>}
      <section className="app-card p-5">
        <h2 className="flex items-center gap-2 font-semibold text-ink"><NotebookPen className="h-5 w-5 text-brand-600" /> Homework</h2>
        {homework.length === 0 ? <p className="mt-3 text-sm text-gray-500">No homework right now.</p> : (
          <div className="mt-3 space-y-3">{homework.map((s) => (
            <div key={s.id} className="rounded-xl bg-gray-50 p-4"><div className="flex flex-wrap items-center gap-2 text-sm"><SubjectChip subjectId={s.subjectId} /><span className="text-gray-500">{new Date(s.start) > now ? `for ${dayLabel(s.start)}'s class` : `from ${dayLabel(s.start)}'s class`}</span></div>
              <p className="mt-2 text-ink">{s.homework}</p>{s.topic && <p className="mt-1 text-xs text-gray-500">Topic: {s.topic}</p>}</div>))}</div>
        )}
      </section>
    </div>
  )
}

export function StudentSchedule() {
  const { byId } = usePeople()
  const now = startOfDay(new Date())
  const mine = useMine().filter((s) => new Date(s.start) >= now && new Date(s.start) < addDays(now, 21)).sort(byStart)
  const days = [...new Set(mine.map((s) => startOfDay(s.start).getTime()))]
  return (
    <div>
      <PageTitle title="My schedule" subtitle="Your classes for the next 3 weeks." />
      {mine.length === 0 ? <div className="app-card"><EmptyState icon={CalendarDays} title="No upcoming classes" /></div> : (
        <div className="space-y-5">{days.map((d) => (
          <section key={d}><h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{dayLabel(d)}</h2>
            <div className="app-card p-2">{mine.filter((s) => startOfDay(s.start).getTime() === d).map((s) => <SessionRow key={s.id} sess={s} who={`with ${teacherName(byId, s)}`} />)}</div></section>))}</div>
      )}
    </div>
  )
}

export function StudentClasses() {
  const me = useMe()
  const { byId } = usePeople()
  const classes = useStore((s) => s.classes).filter((c) => c.studentIds.includes(me.id) && c.status === 'active')
  return (
    <div>
      <PageTitle title="My classes" />
      {classes.length === 0 ? <div className="app-card"><EmptyState icon={BookMarked} title="No classes yet" desc="The academy will add you to a class soon." /></div> : (
        <div className="grid gap-4 sm:grid-cols-2">{classes.map((c) => (
          <div key={c.id} className="app-card p-6">
            <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', subjectById(c.subjectId).color)}><SubjectIcon subjectId={c.subjectId} className="h-6 w-6" /></span>
            <p className="mt-4 text-lg font-semibold text-ink">{subjectById(c.subjectId).name}</p>
            <p className="text-gray-600">with {byId[c.teacherId]?.name || 'your teacher'}</p>
            <p className="mt-3 text-sm text-gray-500">Every {weeklySummary(c.slots)}</p>
            {c.studentIds.length > 1 && <p className="mt-1 text-xs text-gray-400">Group class · {c.studentIds.length} students</p>}
          </div>))}</div>
      )}
    </div>
  )
}
