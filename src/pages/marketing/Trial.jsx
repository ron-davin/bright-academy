import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Check, ChevronLeft, ChevronRight, PartyPopper, UserPlus } from 'lucide-react'
import { COURSES, TEACHERS } from '../../lib/data.js'
import { MiniCalendar } from './CourseDetail.jsx'
import { Input, Select, Button, Avatar } from '../../components/ui/index.jsx'
import { useStore, useUI, useCurrentUser, toast } from '../../lib/store.js'
import { childrenOf } from '../../lib/store.js'
import { cn, timeLabel, detectTimezone } from '../../lib/utils.js'

const TIMES = ['07:00', '07:30', '08:00', '09:00', '13:00', '13:30', '16:00', '16:30', '17:00', '17:30', '19:00', '19:30', '20:00']

export default function Trial() {
  const [params] = useSearchParams()
  const user = useCurrentUser()
  const users = useStore((s) => s.users)
  const addChild = useStore((s) => s.addChild)
  const bookTrial = useStore((s) => s.bookTrial)
  const openAuth = useUI((s) => s.openAuth)
  const preCourse = COURSES.find((c) => c.slug === params.get('course')) || (params.get('teacher') ? COURSES.find((c) => c.teacherId === params.get('teacher')) : null)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [f, setF] = useState({ courseId: preCourse?.id || '', childId: '', childName: '', childAge: '', childGrade: '', date: null, time: null, parentName: user?.role === 'parent' ? user.name : '', parentEmail: user?.role === 'parent' ? user.email : '', phone: '', notes: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const course = COURSES.find((c) => c.id === f.courseId)
  const teacher = course && TEACHERS.find((t) => t.id === course.teacherId)
  const kids = user?.role === 'parent' ? childrenOf({ users }, user.id) : []
  const steps = ['Course & student', 'Pick a time', 'Contact details', 'Confirm']
  const valid = [f.courseId && (f.childId || f.childName), f.date && f.time, f.parentName && f.parentEmail, true][step]
  const submit = () => {
    let childId = f.childId, childName = f.childName
    if (user?.role === 'parent' && !childId && childName) { const c = addChild(user.id, { name: childName, age: f.childAge, grade: f.childGrade }); childId = c.id }
    if (childId) childName = users.find((u) => u.id === childId)?.name || childName
    const [h, m] = f.time.split(':').map(Number)
    const start = new Date(f.date); start.setHours(h, m, 0, 0)
    bookTrial({ courseId: f.courseId, teacherId: course.teacherId, studentId: childId || null, studentName: childName, age: f.childAge ? +f.childAge : users.find((u) => u.id === childId)?.age, grade: f.childGrade || users.find((u) => u.id === childId)?.grade, parentName: f.parentName, parentEmail: f.parentEmail, parentId: user?.role === 'parent' ? user.id : null, phone: f.phone, notes: f.notes, start: start.toISOString(), end: new Date(start.getTime() + 30 * 60000).toISOString() })
    setDone(true); toast({ title: 'Trial booked!', desc: 'Check your email for the confirmation.', type: 'success' })
  }
  if (done) return (
    <section className="container-x flex min-h-[60vh] items-center justify-center py-20">
      <div className="max-w-lg rounded-3xl border border-ink/8 bg-white p-10 text-center shadow-card">
        <PartyPopper className="mx-auto h-12 w-12 text-sun-500" />
        <h1 className="mt-4 font-display text-3xl font-black text-ink">Free trial booked!</h1>
        <p className="mt-3 text-ink/70">{f.childName || 'Your child'} has a free 30-minute trial for <b>{course?.title}</b> with {teacher?.name} on <b>{format(f.date, 'EEEE, MMM d')} at {timeLabel(f.time)}</b>.</p>
        <p className="mt-3 text-sm text-ink/60">The teacher will assess the current level and send you a short report with a recommended plan.</p>
        <div className="mt-6 flex justify-center gap-3">{user ? <Link to={user.role === 'parent' ? '/parent/trials' : '/'} className="btn btn-md btn-primary">View my trials</Link> : <button type="button" className="btn btn-md btn-primary" onClick={() => openAuth('signup')}>Create account to manage it</button>}<Link to="/courses" className="btn btn-md btn-outline">Browse more courses</Link></div>
      </div>
    </section>
  )
  return (
    <section className="bg-paper py-14">
      <div className="container-x max-w-3xl">
        <div className="text-center"><h1 className="font-display text-4xl font-black text-ink">Book a Free Trial</h1><p className="mt-3 text-lg text-ink/70">30 minutes, live with the teacher. No card required.</p></div>
        <div className="mt-8 flex items-center justify-center gap-2">{steps.map((s, i) => <span key={s} className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-ink/10 text-ink/50')}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>)}</div>
        <div className="mt-6 rounded-3xl border border-ink/8 bg-white p-7 shadow-card sm:p-9">
          {step === 0 && <div className="space-y-5">
            <h2 className="text-xl font-bold text-ink">Who is taking the trial?</h2>
            <Select label="Course" required value={f.courseId} onChange={set('courseId')}><option value="">Select a course</option>{COURSES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}</Select>
            {user?.role === 'parent' && kids.length > 0 && <div><span className="label">Choose a child</span><div className="flex flex-wrap gap-2">{kids.map((k) => <button key={k.id} type="button" onClick={() => setF((x) => ({ ...x, childId: x.childId === k.id ? '' : k.id, childName: '' }))} className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium', f.childId === k.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 hover:bg-ink/5')}><Avatar name={k.name} size="xs" /> {k.name} ({k.age})</button>)}</div><p className="mt-2 text-xs text-ink/50">or add a new child below</p></div>}
            {!f.childId && <div className="grid gap-4 sm:grid-cols-[1.5fr_0.7fr_1fr]">
              <Input label="Child's full name" required placeholder="Full name" value={f.childName} onChange={set('childName')} />
              <Input label="Age" type="number" min="3" max="18" required placeholder="9" value={f.childAge} onChange={set('childAge')} />
              <Select label="Grade level" value={f.childGrade} onChange={set('childGrade')}><option value="">Select…</option>{['Pre-school', 'KG', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)].map((g) => <option key={g}>{g}</option>)}</Select>
            </div>}
            {!user && <p className="flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800"><UserPlus className="h-4 w-4 shrink-0" /> Have an account? <button type="button" className="font-semibold underline" onClick={() => openAuth('signin', '/trial')}>Sign in as a parent</button> to pick from your children.</p>}
          </div>}
          {step === 1 && <div>
            <h2 className="text-xl font-bold text-ink">Pick a date & time</h2>
            {teacher && <p className="mt-1 text-sm text-ink/60">Trial with {teacher.name} · 30 minutes · shown in your timezone ({detectTimezone()})</p>}
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <MiniCalendar selected={f.date} onSelect={(d) => setF((x) => ({ ...x, date: d, time: null }))} />
              <div>{f.date ? <><p className="font-semibold">{format(f.date, 'EEEE, MMMM d')}</p><div className="mt-3 grid grid-cols-3 gap-2">{TIMES.filter((_, i) => (f.date.getDate() + i) % 4 !== 0).map((tm) => <button key={tm} type="button" onClick={() => setF((x) => ({ ...x, time: tm }))} className={cn('rounded-lg border px-2 py-2 text-sm font-medium', f.time === tm ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 hover:border-brand-400 hover:bg-brand-50')}>{timeLabel(tm)}</button>)}</div></> : <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-ink/15 text-sm text-ink/50">Select a date first</div>}</div>
            </div>
          </div>}
          {step === 2 && <div className="space-y-4">
            <h2 className="text-xl font-bold text-ink">Parent contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Parent name" required value={f.parentName} onChange={set('parentName')} /><Input label="Email" type="email" required value={f.parentEmail} onChange={set('parentEmail')} /></div>
            <Input label="Phone (optional)" type="tel" value={f.phone} onChange={set('phone')} />
            <Input label="Anything the teacher should know? (optional)" placeholder="e.g. knows the letters but can't join them yet" value={f.notes} onChange={set('notes')} />
          </div>}
          {step === 3 && <div>
            <h2 className="text-xl font-bold text-ink">Confirm your free trial</h2>
            <div className="mt-5 space-y-3 rounded-2xl bg-ink/4 p-5 text-sm">
              {[['Course', `${course?.emoji} ${course?.title}`], ['Teacher', teacher?.name], ['Student', `${f.childId ? users.find((u) => u.id === f.childId)?.name : f.childName}${f.childAge ? ` (${f.childAge})` : ''}`], ['When', f.date && f.time ? `${format(f.date, 'EEE, MMM d')} · ${timeLabel(f.time)} (30 min)` : ''], ['Parent', `${f.parentName} · ${f.parentEmail}`]].map(([k, v]) => <p key={k} className="flex justify-between gap-6"><span className="text-ink/60">{k}</span><span className="text-right font-semibold text-ink">{v}</span></p>)}
            </div>
            <p className="mt-4 text-xs text-ink/50">Free of charge · No card required · You can reschedule up to 12 hours before.</p>
          </div>}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < 3 ? <Button onClick={() => setStep((s) => s + 1)} disabled={!valid}>Next <ChevronRight className="h-4 w-4" /></Button> : <Button variant="sun" onClick={submit}>Confirm free trial</Button>}
          </div>
        </div>
      </div>
    </section>
  )
}
