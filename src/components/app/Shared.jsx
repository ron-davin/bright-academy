import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, Play, Search, Send, Plus, Video } from 'lucide-react'
import { COURSES, TEACHERS } from '../../lib/data.js'
import { useStore, useCurrentUser, effectiveStatus, isJoinable, userById, EMPTY } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, Input } from '../ui/index.jsx'
import { cn, fmtTime, fmtDateTime, fmtRelative, cap, statusTone, groupBy, byDate } from '../../lib/utils.js'

export const courseOf = (id) => COURSES.find((c) => c.id === id)
export const teacherOf = (id) => TEACHERS.find((t) => t.id === id)

export function SessionRow({ sess, names, showDate, right }) {
  const st = effectiveStatus(sess)
  const live = st === 'live'
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', live && 'rounded-lg bg-emerald-50/60 px-3')}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', live ? 'bg-emerald-100' : 'bg-ink/5')}>{live ? <Play className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-ink/50" />}</span>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{courseOf(sess.courseId)?.title}{names ? ` — ${names}` : ''}</p>
          <p className="text-sm text-ink/60">{showDate ? fmtDateTime(sess.start) : fmtTime(sess.start)} - {fmtTime(sess.end)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-xs text-ink/50 sm:inline">{sess.studentIds.length} student{sess.studentIds.length > 1 ? 's' : ''}</span>
        <Badge status={st}>{live && <span className="mr-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}{live ? 'LIVE' : cap(st)}</Badge>
        {right}
      </div>
    </div>
  )
}

export function JoinButton({ sess, size = 'sm' }) {
  const nav = useNavigate()
  if (!isJoinable(sess)) return null
  return <Button app size={size} onClick={() => nav(`/classroom/${sess.id}`)} className="animate-bounce"><Video className="h-3.5 w-3.5" /> Join</Button>
}

export function MonthCalendar({ sessions, renderLabel }) {
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const byDay = useMemo(() => groupBy(sessions, (s) => format(new Date(s.start), 'yyyy-MM-dd')), [sessions])
  const days = useMemo(() => { const out = []; let d = startOfWeek(startOfMonth(month), { weekStartsOn: 0 }); const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 }); while (d <= end) { out.push(d); d = addDays(d, 1) } return out }, [month])
  const [selected, setSelected] = useState(null)
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button app variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>Today</Button>
        <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} className="rounded-lg border border-ink/10 p-1.5 hover:bg-ink/5" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} className="rounded-lg border border-ink/10 p-1.5 hover:bg-ink/5" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
        <p className="ml-1 text-lg font-bold text-ink">{format(month, 'MMMM yyyy')}</p>
      </div>
      <div className="overflow-x-auto"><div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-l border-t border-ink/8 text-center text-[11px] font-bold uppercase tracking-wider text-ink/50">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="border-b border-r border-ink/8 bg-ink/3 py-2">{d}</div>)}</div>
        <div className="grid grid-cols-7 border-l border-ink/8">
          {days.map((d, i) => { const key = format(d, 'yyyy-MM-dd'); const list = (byDay[key] || []).sort(byDate('start')); return (
            <div key={i} className={cn('min-h-[110px] border-b border-r border-ink/8 p-1.5', !isSameMonth(d, month) && 'bg-ink/2 opacity-60')}>
              <p className={cn('mb-1 text-right text-xs font-medium', isSameDay(d, new Date()) ? 'font-bold text-brand-700' : 'text-ink/50')}>{isSameDay(d, new Date()) ? `Today ${format(d, 'd')}` : format(d, 'd')}</p>
              {list.slice(0, 2).map((s) => { const st = effectiveStatus(s); return (
                <div key={s.id} className={cn('mb-1 cursor-pointer rounded-md border-l-2 px-1.5 py-1 text-[10px] leading-tight', st === 'completed' ? 'border-ink/20 bg-ink/4 text-ink/60' : st === 'cancelled' || st === 'missed' ? 'border-coral-400 bg-coral-500/8 text-coral-700' : st === 'live' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-brand-400 bg-brand-50 text-brand-900')} onClick={() => setSelected(isSameDay(selected || 0, d) ? null : d)}>
                  <p className="font-semibold">{fmtTime(s.start)} – {fmtTime(s.end)}</p>
                  <p className="truncate">{courseOf(s.courseId)?.title}</p>
                  {renderLabel && <p className="truncate text-[9px] opacity-70">{renderLabel(s)}</p>}
                </div>) })}
              {list.length > 2 && <button type="button" className="text-[10px] font-semibold text-brand-700 hover:underline" onClick={() => setSelected(isSameDay(selected || 0, d) ? null : d)}>+{list.length - 2} more</button>}
            </div>) })}
        </div>
      </div></div>
      {selected && <div className="mt-4 rounded-xl border border-ink/8 bg-white p-4">
        <p className="font-bold text-ink">{format(selected, 'EEEE, MMMM d')}</p>
        <div className="divide-y divide-ink/5">{(byDay[format(selected, 'yyyy-MM-dd')] || []).sort(byDate('start')).map((s) => <SessionRow key={s.id} sess={s} names={renderLabel ? renderLabel(s) : ''} right={<JoinButton sess={s} />} />)}</div>
      </div>}
    </div>
  )
}

export function MessagesPage({ basePath }) {
  const user = useCurrentUser()
  const conversations = useStore((s) => s.conversations)
  const users = useStore((s) => s.users)
  const { sendMessage, markConversationRead, startConversation } = useStore()
  const [activeId, setActiveId] = useState(null)
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [showNew, setShowNew] = useState(false)
  const mine = conversations.filter((c) => c.participantIds.includes(user.id))
    .map((c) => ({ ...c, other: users.find((u) => u.id === c.participantIds.find((p) => p !== user.id)), last: c.messages[c.messages.length - 1] }))
    .filter((c) => !q || c.other?.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.last?.at || b.createdAt) - new Date(a.last?.at || a.createdAt))
  const active = mine.find((c) => c.id === activeId)
  const contacts = useMemo(() => {
    if (user.role === 'teacher') { const s = useStore.getState(); const studentIds = new Set(s.enrollments.filter((e) => e.teacherId === user.teacherId).map((e) => e.studentId)); const list = []; studentIds.forEach((id) => { const st = users.find((u) => u.id === id); if (st) { list.push(st); if (st.parentId) { const p = users.find((u) => u.id === st.parentId); if (p) list.push(p) } } }); return [...new Set(list)] }
    const s = useStore.getState()
    const ids = user.role === 'parent' ? (user.children || []).flatMap((cid) => s.enrollments.filter((e) => e.studentId === cid).map((e) => e.teacherId)) : s.enrollments.filter((e) => e.studentId === user.id).map((e) => e.teacherId)
    return [...new Set(ids)].map((tid) => users.find((u) => u.role === 'teacher' && u.teacherId === tid)).filter(Boolean)
  }, [users, user])
  const open = (c) => { setActiveId(c.id); markConversationRead(c.id, user.id) }
  const send = (e) => { e.preventDefault(); if (!text.trim() || !active) return; sendMessage(active.id, user.id, text.trim()); setText('') }
  return (
    <Card app className="flex h-[calc(100svh-160px)] min-h-[480px] overflow-hidden">
      <div className={cn('flex w-full flex-col border-r border-ink/8 sm:w-[320px]', active && 'hidden sm:flex')}>
        <div className="flex items-center justify-between border-b border-ink/5 p-4"><p className="text-lg font-bold">Chats</p><button type="button" onClick={() => setShowNew((v) => !v)} className="rounded-lg p-1.5 text-ink/60 hover:bg-ink/5" aria-label="New chat"><Plus className="h-5 w-5" /></button></div>
        {showNew && <div className="border-b border-ink/5 p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/50">Start a conversation</p><div className="max-h-40 space-y-1 overflow-y-auto thin-scroll">{contacts.map((c) => <button key={c.id} type="button" className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-ink/5" onClick={() => { const id = startConversation([user.id, c.id]); setShowNew(false); setActiveId(id) }}><Avatar src={c.avatar} name={c.name} size="xs" /> {c.name} <span className="text-xs text-ink/40">({c.role})</span></button>)}{contacts.length === 0 && <p className="p-2 text-xs text-ink/50">No contacts yet — enroll in a course first.</p>}</div></div>}
        <div className="border-b border-ink/5 p-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input app placeholder="Search conversations…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div></div>
        <div className="flex-1 overflow-y-auto thin-scroll">
          {mine.map((c) => { const unread = c.messages.filter((m) => m.senderId !== user.id && !(m.readBy || []).includes(user.id)).length; return (
            <button key={c.id} type="button" onClick={() => open(c)} className={cn('flex w-full items-center gap-3 border-b border-ink/4 px-4 py-3 text-left hover:bg-ink/3', activeId === c.id && 'bg-brand-50/60')}>
              <Avatar src={c.other?.avatar} name={c.other?.name || '?'} size="md" />
              <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="truncate font-semibold text-ink">{c.other?.name || 'Unknown'}</span><span className="shrink-0 text-[11px] text-ink/40">{c.last ? format(new Date(c.last.at), 'MMM d') : ''}</span></span><span className="block truncate text-sm text-ink/55">{c.last?.senderId === user.id ? 'You: ' : ''}{c.last?.text || 'No messages yet'}</span></span>
              {unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </button>) })}
          {mine.length === 0 && <p className="p-6 text-center text-sm text-ink/50">No conversations yet.</p>}
        </div>
      </div>
      <div className={cn('flex min-w-0 flex-1 flex-col', !active && 'hidden sm:flex')}>
        {active ? (<>
          <div className="flex items-center gap-3 border-b border-ink/5 px-4 py-3">
            <button type="button" className="rounded-lg p-1 text-ink/50 hover:bg-ink/5 sm:hidden" onClick={() => setActiveId(null)}><ChevronLeft className="h-5 w-5" /></button>
            <Avatar src={active.other?.avatar} name={active.other?.name || '?'} size="sm" /><div><p className="font-semibold leading-tight">{active.other?.name}</p><p className="text-xs capitalize text-ink/50">{active.other?.role}</p></div>
            <span className="ml-auto rounded-full border border-ink/10 px-2.5 py-1 text-[11px] text-ink/50">🛡 Monitored for safety</span>
          </div>
          <div className="flex flex-1 flex-col-reverse overflow-y-auto thin-scroll p-4">
            <div className="space-y-3">
              {active.messages.map((m) => { const own = m.senderId === user.id; return (
                <div key={m.id} className={cn('flex', own && 'justify-end')}>
                  <div className={cn('max-w-[75%] rounded-2xl px-3.5 py-2 text-sm', own ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-ink/6 text-ink')}>{m.text}<p className={cn('mt-0.5 text-[10px]', own ? 'text-white/60' : 'text-ink/40')}>{fmtTime(m.at)}</p></div>
                </div>) })}
              {active.messages.length === 0 && <p className="py-10 text-center text-sm text-ink/50">Say salaam 👋 — messages are monitored for child safety.</p>}
            </div>
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-ink/5 p-3">
            <Input app placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} className="flex-1" />
            <Button app type="submit" disabled={!text.trim()}><Send className="h-4 w-4" /> Send</Button>
          </form>
        </>) : <EmptyState className="flex-1" icon={Send} title="Select a conversation" desc="Choose from your existing conversations or start a new one" />}
      </div>
    </Card>
  )
}
