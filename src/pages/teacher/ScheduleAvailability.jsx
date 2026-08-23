import React, { useState } from 'react'
import { Clock, Plus, Trash2, CalendarClock, Globe, CalendarCheck } from 'lucide-react'
import { useStore, useCurrentUser, sessionsForTeacher, toast } from '../../lib/store.js'
import { Button, Card, CardBody, CardHeader, PageHeader, Select } from '../../components/ui/index.jsx'
import { MonthCalendar } from '../../components/app/Shared.jsx'
import { DAYS, TIME_OPTIONS, timeLabel, TIMEZONES, tzOffsetLabel } from '../../lib/utils.js'

export function TeacherSchedule() {
  const user = useCurrentUser()
  const state = useStore()
  const sessions = sessionsForTeacher(state, user.teacherId)
  const nameOf = (s) => s.studentIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
  return (
    <div>
      <PageHeader icon={CalendarClock} title="Schedule" subtitle="Monthly session calendar" />
      <Card app><CardBody className="!p-5"><MonthCalendar sessions={sessions} renderLabel={(s) => `Student: ${nameOf(s)}`} /></CardBody></Card>
    </div>
  )
}

export function TeacherAvailability() {
  const user = useCurrentUser()
  const slots = useStore((s) => s.availability[user.id]) || []
  const { addAvailability, removeAvailability, updateUser } = useStore()
  const [f, setF] = useState({ day: 1, from: '11:30', to: '17:00' })
  const add = () => { if (f.from >= f.to) return toast({ title: 'End time must be after start time', type: 'warning' }); addAvailability(user.id, f); toast({ title: 'Time slot added', type: 'success' }) }
  return (
    <div>
      <PageHeader icon={Clock} title="Availability" subtitle="Set your weekly teaching schedule" />
      <div className="space-y-4">
        <Card app>
          <CardHeader title="Timezone" subtitle="All times will be shown in your selected timezone" />
          <CardBody><Select app className="max-w-xs" value={user.timezone} onChange={(e) => { updateUser(user.id, { timezone: e.target.value }); toast({ title: 'Timezone updated', type: 'success' }) }}>{[user.timezone, ...TIMEZONES.filter((t) => t !== user.timezone)].map((t) => <option key={t} value={t}>{tzOffsetLabel(t)} - {t}</option>)}</Select></CardBody>
        </Card>
        <Card app>
          <CardHeader title={<span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Time Slot</span>} />
          <CardBody>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block"><span className="label">Day</span><Select app value={f.day} onChange={(e) => setF((x) => ({ ...x, day: +e.target.value }))} className="w-40">{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select></label>
              <label className="block"><span className="label">From</span><Select app value={f.from} onChange={(e) => setF((x) => ({ ...x, from: e.target.value }))} className="w-32">{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select></label>
              <label className="block"><span className="label">To</span><Select app value={f.to} onChange={(e) => setF((x) => ({ ...x, to: e.target.value }))} className="w-32">{TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</Select></label>
              <Button app onClick={add}><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </CardBody>
        </Card>
        <Card app>
          <CardHeader title={<span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Weekly Schedule</span>} subtitle={`${slots.length} time slots configured`} />
          <CardBody>
            {DAYS.map((d, i) => { const list = slots.filter((s) => s.day === i).sort((a, b) => a.from.localeCompare(b.from)); return (
              <div key={d} className="border-b border-ink/5 py-3 last:border-b-0">
                <p className="font-semibold">{d}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.length === 0 && <p className="text-sm text-ink/40">Not available</p>}
                  {list.map((s) => <span key={s.id} className="flex items-center gap-2 rounded-full bg-sun-400/80 py-1.5 pl-3.5 pr-2 text-sm font-semibold text-ink">{timeLabel(s.from)} – {timeLabel(s.to)}<button type="button" onClick={() => removeAvailability(user.id, s.id)} className="rounded-full p-1 hover:bg-ink/10" aria-label="Remove slot"><Trash2 className="h-3.5 w-3.5" /></button></span>)}
                </div>
              </div>) })}
          </CardBody>
        </Card>
        <p className="flex items-center gap-2 text-xs text-ink/50"><Globe className="h-4 w-4" /> Parents can only book trials and lessons inside your available hours.</p>
      </div>
    </div>
  )
}
