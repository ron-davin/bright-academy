import React, { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Video, Plus, Trash2, BookOpen, Calculator, FlaskConical, Atom, Languages, Code2, Type, Landmark, ChessKnight, Music, Palette, Globe, PenTool, Brain, Microscope, Sigma, Leaf, History, Lightbulb, Rocket, Trophy, Mic, Camera, GraduationCap } from 'lucide-react'
export const Icons = { BookOpen, Calculator, FlaskConical, Atom, Languages, Code2, Type, Landmark, ChessKnight, Music, Palette, Globe, PenTool, Brain, Microscope, Sigma, Leaf, History, Lightbulb, Rocket, Trophy, Mic, Camera, GraduationCap }
import { useStore } from '../../lib/store.js'
import { subjectById, mergeSubjects } from '../../lib/data.js'
import { weekDays, startOfWeek, addDays, sameDay, isJoinable, ymd } from '../../lib/schedule.js'
import { Button, Badge, Select } from '../ui/index.jsx'
import { cn, fmtTime, DAYS, TIME_OPTIONS, timeLabel, cap } from '../../lib/utils.js'

// ---------- people ----------
export function usePeople() {
  const users = useStore((s) => s.users)
  return useMemo(() => {
    const byId = Object.fromEntries(users.map((u) => [u.id, u]))
    const sortByName = (a, b) => (a.name || '').localeCompare(b.name || '')
    return {
      byId,
      teachers: users.filter((u) => u.role === 'teacher').sort(sortByName),
      students: users.filter((u) => u.role === 'student').sort(sortByName),
      admins: users.filter((u) => u.role === 'admin').sort(sortByName),
    }
  }, [users])
}
export const names = (ids = [], byId) => ids.map((id) => byId[id]?.name || 'Unknown').join(', ')

// ---------- subjects ----------
// All subjects (built-in + admin-added). Pass { all: true } to include hidden ones.
export function useSubjects({ all = false } = {}) {
  const records = useStore((s) => s.subjects)
  return useMemo(() => mergeSubjects(records).filter((s) => all || !s.hidden), [records, all])
}
export function SubjectIcon({ subjectId, className = 'h-5 w-5' }) {
  const I = Icons[subjectById(subjectId).icon] || Icons.BookOpen
  return <I className={className} />
}
export function SubjectChip({ subjectId, className }) {
  const s = subjectById(subjectId)
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', s.color, className)}><SubjectIcon subjectId={subjectId} className="h-3.5 w-3.5" />{s.name}</span>
}

// ---------- sessions ----------
export function JoinButton({ sess, size = 'sm', label = 'Join' }) {
  const nav = useNavigate()
  if (!isJoinable(sess)) return null
  return <Button app size={size} onClick={(e) => { e.stopPropagation(); nav(`/class/${sess.id}`) }}><Video className="h-4 w-4" /> {label}</Button>
}

export function StatusBadge({ status }) {
  if (status === 'scheduled') return null
  const tone = { live: 'bg-emerald-100 text-emerald-700', completed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-50 text-red-600' }[status] || 'bg-gray-100 text-gray-600'
  return <Badge tone={tone}>{status === 'live' ? '● Live now' : cap(status)}</Badge>
}

export function SessionRow({ sess, who, showDate, onClick }) {
  return (
    <div onClick={onClick} className={cn('flex items-center gap-4 rounded-xl px-3 py-3', onClick && 'cursor-pointer hover:bg-gray-50', sess.status === 'cancelled' && 'opacity-60')}>
      <div className="w-20 shrink-0 text-sm">
        {showDate && <p className="text-xs font-medium text-gray-500">{new Date(sess.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
        <p className="font-semibold text-ink">{fmtTime(sess.start)}</p>
      </div>
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', subjectById(sess.subjectId).color)}><SubjectIcon subjectId={sess.subjectId} className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium text-ink', sess.status === 'cancelled' && 'line-through')}>{subjectById(sess.subjectId).name}{sess.oneOff ? ' · extra class' : ''}</p>
        <p className="truncate text-sm text-gray-500">{who}</p>
      </div>
      <StatusBadge status={sess.status} />
      <JoinButton sess={sess} />
    </div>
  )
}

// ---------- week calendar ----------
const HOUR_PX = 52
export function WeekCalendar({ week, onWeek, sessions, label, onSessionClick, onSlotClick, availability = [], startHour = 6, endHour = 23 }) {
  const days = weekDays(week)
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
  const now = new Date()
  const scroller = useRef(null)
  const firstHour = useMemo(() => { const hs = sessions.filter((s) => new Date(s.start) >= days[0] && new Date(s.start) < addDays(days[6], 1)).map((s) => new Date(s.start).getHours()); return hs.length ? Math.min(...hs) : 8 }, [sessions, +days[0]]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = Math.max(0, (firstHour - startHour - 0.5) * HOUR_PX) }, [+week, firstHour, startHour]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="app-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
        <Button app variant="outline" size="sm" onClick={() => onWeek(startOfWeek(new Date()))}>Today</Button>
        <button type="button" onClick={() => onWeek(addDays(week, -7))} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Previous week"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={() => onWeek(addDays(week, 7))} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Next week"><ChevronRight className="h-5 w-5" /></button>
        <p className="ml-1 font-semibold text-ink">{days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <div className="overflow-x-auto thin-scroll">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200 text-center">
            <div />
            {days.map((d) => (
              <div key={+d} className={cn('py-2', sameDay(d, now) && 'text-brand-700')}>
                <p className="text-xs font-medium uppercase text-gray-500">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p className={cn('mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold', sameDay(d, now) && 'bg-brand-600 text-white')}>{d.getDate()}</p>
              </div>
            ))}
          </div>
          <div ref={scroller} className="relative grid max-h-[68vh] grid-cols-[56px_repeat(7,1fr)] overflow-y-auto thin-scroll">
            <div>{hours.map((h) => <div key={h} style={{ height: HOUR_PX }} className="pr-2 text-right text-[11px] text-gray-400">{timeLabel(`${String(h).padStart(2, '0')}:00`).replace(':00', '')}</div>)}</div>
            {days.map((d) => {
              const daySessions = sessions.filter((s) => sameDay(s.start, d))
              const windows = availability.filter((w) => w.day === d.getDay())
              return (
                <div key={+d} className="relative border-l border-gray-100" style={{ height: hours.length * HOUR_PX }}>
                  {windows.map((w, i) => <div key={i} className="absolute inset-x-0 bg-brand-50/70" style={{ top: ((toMin(w.from) - startHour * 60) / 60) * HOUR_PX, height: ((toMin(w.to) - toMin(w.from)) / 60) * HOUR_PX }} />)}
                  {hours.map((h) => (
                    <div key={h} style={{ height: HOUR_PX }} className={cn('relative border-t border-gray-100', onSlotClick && 'cursor-pointer hover:bg-brand-50/60')}
                      onClick={() => onSlotClick?.(d, `${String(h).padStart(2, '0')}:00`)} />
                  ))}
                  {daySessions.map((s) => {
                    const st = new Date(s.start), en = new Date(s.end)
                    const top = ((st.getHours() * 60 + st.getMinutes() - startHour * 60) / 60) * HOUR_PX
                    const height = Math.max(22, ((en - st) / 36e5) * HOUR_PX - 2)
                    const subj = subjectById(s.subjectId)
                    return (
                      <button key={s.id} type="button" onClick={(e) => { e.stopPropagation(); onSessionClick?.(s) }}
                        className={cn('absolute inset-x-1 overflow-hidden rounded-lg border px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition hover:shadow', subj.color, s.status === 'cancelled' && 'opacity-50 line-through', s.status === 'live' && 'ring-2 ring-emerald-500')}
                        style={{ top, height }}>
                        <p className="font-semibold">{fmtTime(s.start)} {subj.name}</p>
                        {height > 34 && <p className="truncate opacity-80">{label?.(s)}</p>}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- availability editor ----------
export function AvailabilityEditor({ windows, onChange }) {
  const order = [1, 2, 3, 4, 5, 6, 0]
  const add = (day) => onChange([...windows, { day, from: '16:00', to: '20:00' }])
  const update = (i, patch) => onChange(windows.map((w, k) => (k === i ? { ...w, ...patch } : w)))
  const remove = (i) => onChange(windows.filter((_, k) => k !== i))
  return (
    <div className="divide-y divide-gray-100">
      {order.map((day) => {
        const list = windows.map((w, i) => ({ ...w, i })).filter((w) => w.day === day)
        return (
          <div key={day} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
            <p className="w-28 shrink-0 pt-2 font-medium text-ink">{DAYS[day]}</p>
            <div className="flex-1 space-y-2">
              {list.length === 0 && <p className="pt-2 text-sm text-gray-400">Not available</p>}
              {list.map((w) => (
                <div key={w.i} className="flex items-center gap-2">
                  <Select app value={w.from} onChange={(e) => update(w.i, { from: e.target.value })} className="w-32">{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select>
                  <span className="text-gray-400">to</span>
                  <Select app value={w.to} onChange={(e) => update(w.i, { to: e.target.value })} className="w-32">{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select>
                  <button type="button" onClick={() => remove(w.i)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <Button app variant="ghost" size="sm" onClick={() => add(day)}><Plus className="h-4 w-4" /> Add hours</Button>
          </div>
        )
      })}
    </div>
  )
}

export const weeklySummary = (slots = []) => slots.map((s) => `${DAYS[s.day].slice(0, 3)} ${timeLabel(s.time)}`).join(' · ')
export { ymd }
