import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, ShieldCheck, Video, Star, Clock, Users, BadgeCheck, ShoppingCart, ArrowRight, Check } from 'lucide-react'
import { COURSES, TEACHERS } from '../../lib/data.js'
import { useStore, useUI, useCurrentUser, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Stars, asset } from '../../components/ui/index.jsx'
import { cn, money, fmtDate, timeLabel, detectTimezone } from '../../lib/utils.js'

const AVAIL_TIMES = { morning: ['07:00', '07:30', '08:00', '08:30', '09:00'], afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'], evening: ['17:00', '17:30', '18:00', '19:00', '19:30', '20:00', '20:30', '21:00'] }

export function MiniCalendar({ selected, onSelect, hasTimes = () => true }) {
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const days = useMemo(() => { const out = []; let d = startOfWeek(startOfMonth(month), { weekStartsOn: 1 }); const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 }); while (d <= end) { out.push(d); d = addDays(d, 1) } return out }, [month])
  const today = new Date()
  return (
    <div>
      <div className="flex items-center justify-between"><p className="font-semibold text-ink">{format(month, 'MMMM yyyy')}</p><div className="flex gap-1">
        <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} className="rounded-lg border border-ink/10 p-1.5 hover:bg-ink/5" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} className="rounded-lg border border-ink/10 p-1.5 hover:bg-ink/5" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-ink/50">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d} className="py-1">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => { const past = d < today && !isSameDay(d, today); const off = !isSameMonth(d, month); const avail = !past && !off && hasTimes(d); return (
          <button key={i} type="button" disabled={!avail} onClick={() => onSelect(d)} className={cn('aspect-square rounded-lg text-sm font-medium transition-colors', off && 'text-ink/20', past && 'text-ink/25', avail && 'text-ink hover:bg-brand-50', selected && isSameDay(d, selected) && 'bg-brand-600 text-white hover:bg-brand-600', isSameDay(d, today) && !isSameDay(d, selected || 0) && 'ring-1 ring-brand-400')}>{format(d, 'd')}</button>) })}
      </div>
    </div>
  )
}

export default function CourseDetail() {
  const { slug } = useParams()
  const course = COURSES.find((c) => c.slug === slug)
  const nav = useNavigate()
  const user = useCurrentUser()
  const openAuth = useUI((s) => s.openAuth)
  const addToCart = useStore((s) => s.addToCart)
  const reviews = useStore((s) => s.reviews)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [expanded, setExpanded] = useState(false)
  if (!course) return <div className="container-x py-24 text-center"><h1 className="text-2xl font-bold">Course not found</h1><Link to="/courses" className="btn btn-md btn-primary mt-6">Browse all courses</Link></div>
  const t = TEACHERS.find((x) => x.id === course.teacherId)
  const courseReviews = reviews.filter((r) => r.courseId === course.id)
  const dayTimes = (d) => { const dow = d.getDay(); const base = dow === 0 || dow === 6 ? [...AVAIL_TIMES.morning, ...AVAIL_TIMES.afternoon] : [...AVAIL_TIMES.morning.slice(0, 3), ...AVAIL_TIMES.evening]; return base.filter((_, i) => (d.getDate() + i) % 3 !== 0) }
  const goTrial = () => nav(`/trial?course=${course.slug}${date && time ? `&start=${format(date, 'yyyy-MM-dd')}T${time}` : ''}`)
  const enroll = (planId) => { if (!user) return openAuth('signup', `/courses/${slug}`); if (user.role === 'teacher') return toast({ title: 'Teachers cannot enroll', desc: 'Switch to a parent or student account.', type: 'warning' }); nav(`/checkout?course=${course.id}&plan=${planId}`) }
  const cart = (planId) => { if (!user) return openAuth('signup', `/courses/${slug}`); addToCart(user.id, { courseId: course.id, plan: planId, studentId: null }); toast({ title: 'Added to cart', desc: course.title, type: 'success' }) }
  return (
    <>
      <section className="border-b border-ink/5 bg-gradient-to-b from-paper to-white">
        <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.5fr_1fr] lg:py-16">
          <div>
            <div className="flex flex-wrap items-center gap-2"><Badge tone="bg-sun-400/20 text-sun-600">⭐ Top rated tutoring</Badge><Badge tone="bg-brand-100 text-brand-700">{course.subject}</Badge></div>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight text-ink sm:text-5xl">{course.title}</h1>
            <p className={cn('mt-5 max-w-2xl leading-relaxed text-ink/75', !expanded && 'line-clamp-4')}>{course.description}</p>
            <button type="button" className="mt-2 text-sm font-semibold text-brand-700 hover:underline" onClick={() => setExpanded((e) => !e)}>{expanded ? 'Read less' : 'Read more'}</button>
            <Link to={`/instructors/${t.slug}`} className="mt-6 flex w-fit items-center gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-card hover:shadow-float">
              <Avatar src={t.photo} name={t.name} size="lg" />
              <div><p className="font-bold text-ink">{t.name}</p><p className="text-sm text-ink/60">{t.years}+ years teaching experience</p><div className="mt-1 flex items-center gap-1 text-sm"><Stars value={t.rating} /> <span className="font-semibold">{t.rating.toFixed(1)}</span> <span className="text-ink/50">({courseReviews.length || course.reviews} reviews)</span></div></div>
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="bg-ink/5 text-ink/80">{course.level}</Badge><Badge tone="bg-ink/5 text-ink/80"><Users className="h-3.5 w-3.5" /> Ages {course.ages[0]}–{course.ages[1]}</Badge>
              <Badge tone="bg-ink/5 text-ink/80">{course.type === 'group' ? `Group · max ${course.groupSize}` : '1-on-1'}</Badge><Badge tone="bg-ink/5 text-ink/80"><Clock className="h-3.5 w-3.5" /> {course.weeks} weeks</Badge>
              <Badge tone={course.slots <= 5 ? 'bg-coral-500/10 text-coral-600' : 'bg-emerald-100 text-emerald-700'}>{course.slots <= 5 ? `Only ${course.slots} slots this week` : `${course.slots >= 30 ? '30+' : course.slots} slots this week`}</Badge>
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#plans" className="btn btn-md btn-ink">View pricing & schedule</a><button type="button" onClick={goTrial} className="btn btn-md btn-sun">Book free trial</button></div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-ink/60"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Safe & secure</span><span className="flex items-center gap-1.5"><Video className="h-4 w-4 text-brand-600" /> Live {course.type === 'group' ? 'group' : '1-on-1'} classes</span><span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-600" /> Vetted teacher</span></div>
          </div>
          <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
            <p className="eyebrow">What your child will achieve</p>
            <ul className="mt-4 space-y-3">{course.achieve.map((a) => <li key={a} className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3 w-3 text-emerald-700" /></span><span className="text-sm leading-relaxed text-ink/80">{a}</span></li>)}</ul>
            <p className="eyebrow mt-6">Curriculum</p>
            <ol className="mt-3 space-y-2">{course.curriculum.map((c, i) => <li key={c} className="flex items-start gap-3 text-sm text-ink/80"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">{i + 1}</span>{c}</li>)}</ol>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="container-x py-14">
        <div className="mx-auto max-w-4xl rounded-3xl border border-ink/8 bg-white p-6 shadow-card sm:p-8">
          <p className="eyebrow">Class calendar</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">Available class times</h2>
          <p className="mt-1 text-ink/60">Pick a date, then choose a time that fits your child's routine</p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <MiniCalendar selected={date} onSelect={(d) => { setDate(d); setTime(null) }} />
            <div>
              {date ? (<>
                <p className="font-semibold text-ink">{format(date, 'EEEE, MMMM d')}</p>
                <p className="text-sm text-ink/60">{dayTimes(date).length} times available · Live {course.type === 'group' ? 'group' : '1-on-1'} lesson</p>
                <div className="mt-4 grid grid-cols-3 gap-2">{dayTimes(date).map((tm) => <button key={tm} type="button" onClick={() => setTime(tm)} className={cn('rounded-lg border px-2 py-2 text-sm font-medium', time === tm ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 text-ink hover:border-brand-400 hover:bg-brand-50')}>{timeLabel(tm)}</button>)}</div>
                <p className="mt-3 text-xs text-ink/50">All times shown in your timezone ({detectTimezone()})</p>
                <Button variant="sun" className="mt-5 w-full" onClick={goTrial}>Reserve a spot — Free Trial <ArrowRight className="h-4 w-4" /></Button>
              </>) : <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-ink/15 text-sm text-ink/50">Select a date to see available times</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {courseReviews.length > 0 && (
        <section className="container-x pb-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-ink">What parents say</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{courseReviews.map((r) => <div key={r.id} className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Avatar name={r.authorName} size="sm" /><div><p className="text-sm font-semibold">{r.authorName}</p><p className="text-xs text-ink/50">{fmtDate(r.at)}</p></div></div><Stars value={r.rating} /></div>{r.text && <p className="mt-3 text-sm leading-relaxed text-ink/75">{r.text}</p>}</div>)}</div>
          </div>
        </section>
      )}

      {/* Plans */}
      <section id="plans" className="bg-paper py-16">
        <div className="container-x">
          <div className="text-center"><h2 className="font-display text-4xl font-black text-ink">Choose your plan</h2><p className="mt-2 text-ink/60">Enroll in {course.title} — pick the intensity that fits your child</p></div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {course.plans.map((p) => (
              <div key={p.id} className={cn('relative flex flex-col rounded-3xl border bg-white p-7', p.tag === 'Most Popular' ? 'border-brand-600 shadow-float' : 'border-ink/10 shadow-card')}>
                {p.tag && <span className={cn('absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white', p.tag === 'Most Popular' ? 'bg-brand-600' : 'bg-sun-500')}>{p.tag}</span>}
                <h3 className="text-lg font-bold text-ink">{p.name}</h3><p className="mt-1 text-sm text-ink/60">{p.desc}</p>
                <p className="mt-4"><span className="font-display text-4xl font-black text-ink">{money(p.price)}</span><span className="text-ink/60">/mo</span></p>
                <p className="text-sm font-medium text-brand-700">{p.perWeek}× per week</p>
                <ul className="mt-5 space-y-2">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>)}</ul>
                <div className="mt-auto space-y-2 pt-6"><Button className="w-full" onClick={() => enroll(p.id)}>Enroll</Button><Button variant="outline" className="w-full" onClick={() => cart(p.id)}><ShoppingCart className="h-4 w-4" /> Add to cart</Button></div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-ink/8 bg-white p-6 text-center shadow-card">
            <p className="font-semibold text-ink">Need more than 3 lessons per week?</p><p className="mt-1 text-sm text-ink/60">Request a custom intensive plan with additional weekly sessions.</p>
            <RequestCustom course={course} />
            <p className="mt-4 text-xs text-ink/50">No commitment. Cancel anytime. All plans auto-renew monthly.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function RequestCustom({ course }) {
  const addCustomPlanRequest = useStore((s) => s.addCustomPlanRequest)
  const user = useCurrentUser()
  const [sent, setSent] = useState(false)
  if (sent) return <p className="mt-3 text-sm font-semibold text-emerald-700">Request sent — we'll email you a custom plan within one working day.</p>
  return <Button variant="outline" size="sm" className="mt-3" onClick={() => { addCustomPlanRequest({ courseId: course.id, userId: user?.id, email: user?.email }); setSent(true) }}>Request custom plan</Button>
}
