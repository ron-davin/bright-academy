import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Video, CalendarDays, UserCheck } from 'lucide-react'
import { TEACHERS, FAQS, BRAND } from '../../lib/data.js'
import { SubjectIcon, useSubjects } from '../../components/app/common.jsx'
import { Button, Input, Select, Textarea, asset } from '../../components/ui/index.jsx'
import { useStore, useMe, toast } from '../../lib/store.js'
import { homeFor } from '../../components/app/AppShell.jsx'
import { cn } from '../../lib/utils.js'

function Header() {
  const me = useMe()
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5"><img src={asset('logo-mark-t.png')} alt="" className="h-9 w-9 object-contain" /><span className="text-lg font-bold text-ink">Bright Academy</span></Link>
        <nav className="hidden items-center gap-7 text-[15px] text-gray-600 md:flex">
          <a href="#subjects" className="hover:text-ink">Subjects</a><a href="#how" className="hover:text-ink">How it works</a><a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {me ? <Link to={homeFor(me.role)} className="btn btn-sm btn-primary">My dashboard</Link> : <Link to="/login" className="btn btn-sm btn-outline">Log in</Link>}
          <a href="#trial" className="btn btn-sm btn-primary hidden sm:inline-flex">Free trial</a>
        </div>
      </div>
    </header>
  )
}

function TrialForm() {
  const subjects = useSubjects()
  const addLead = useStore((s) => s.addLead)
  const [f, setF] = useState({ name: '', email: '', phone: '', studentAge: '', subject: '', times: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); addLead({ ...f, source: 'trial-form' }); setSent(true); toast({ title: 'Request sent', type: 'success' }) }
  if (sent) return (
    <div className="card p-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100"><Check className="h-6 w-6 text-emerald-700" /></span>
      <h3 className="mt-4 text-xl font-semibold text-ink">Thank you, {f.name.split(' ')[0]}!</h3>
      <p className="mt-2 text-gray-600">We'll contact you within one working day to book your free trial.</p>
    </div>
  )
  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Your name" required value={f.name} onChange={set('name')} />
        <Input label="Email" type="email" required value={f.email} onChange={set('email')} />
        <Input label="Phone / WhatsApp" type="tel" value={f.phone} onChange={set('phone')} />
        <Input label="Student's age" type="number" min="3" max="99" value={f.studentAge} onChange={set('studentAge')} />
      </div>
      <Select label="Subject" required value={f.subject} onChange={set('subject')}><option value="">Choose a subject…</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
      <Input label="Preferred days & times" placeholder="e.g. weekdays after 5 PM" value={f.times} onChange={set('times')} />
      <Textarea label="Anything else? (optional)" rows={3} value={f.message} onChange={set('message')} />
      <Button type="submit" size="lg" className="w-full">Request a free trial</Button>
      <p className="text-center text-xs text-gray-400">No payment needed. We'll reply within one working day.</p>
    </form>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {FAQS.map((f, i) => (
        <div key={f.q}>
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
            <span className="text-lg font-medium text-ink">{f.q}</span><ChevronDown className={cn('h-5 w-5 shrink-0 text-gray-400 transition-transform', open === i && 'rotate-180')} />
          </button>
          {open === i && <p className="-mt-1 pb-5 leading-relaxed text-gray-600">{f.a}</p>}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const subjects = useSubjects()
  return (
    <div className="bg-white">
      <Header />
      {/* Hero */}
      <section className="container-x grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow">Live online classes</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">Learn with a real teacher, <span className="text-brand-600">one class at a time.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600">Math, Science, English, Programming, Chess, Qur'an, Arabic and more — live, friendly lessons at times that fit your week.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#trial" className="btn btn-lg btn-primary">Book a free trial</a><Link to="/login" className="btn btn-lg btn-outline">Log in</Link></div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <div className="card p-6 shadow-float">
            <p className="text-sm font-medium text-gray-500">Today</p>
            <div className="mt-3 flex items-center gap-4 rounded-xl bg-brand-50 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-700"><SubjectIcon subjectId="math" /></span>
              <div className="flex-1"><p className="font-semibold text-ink">Math · Fractions</p><p className="text-sm text-gray-500">5:00 – 5:45 PM</p></div>
              <span className="btn btn-sm btn-primary pointer-events-none"><Video className="h-4 w-4" /> Join</span>
            </div>
            <div className="mt-3 flex items-center gap-4 rounded-xl p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><SubjectIcon subjectId="esl" /></span>
              <div className="flex-1"><p className="font-semibold text-ink">English (ESL)</p><p className="text-sm text-gray-500">Thursday · 4:00 PM</p></div>
            </div>
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">Homework: <span className="text-ink">Fractions worksheet, page 3</span></p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="border-t border-gray-100 bg-paper py-20">
        <div className="container-x">
          <h2 className="section-title text-center">Subjects</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">One-on-one or small-group classes for children, teens and adults.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((s) => (
              <div key={s.id} className="card p-6">
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', s.color)}><SubjectIcon subjectId={s.id} /></span>
                <h3 className="mt-4 font-semibold text-ink">{s.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="container-x">
          <h2 className="section-title text-center">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[[UserCheck, 'Request a free trial', 'Fill in the short form below. We contact you and book a free first lesson.'], [CalendarDays, 'Get your schedule', 'We create your login and set your weekly class times with your teacher.'], [Video, 'Join from anywhere', 'Log in, open “Today” and press Join. Video, chat and whiteboard are built in.']].map(([I, t, d], i) => (
              <div key={t} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><I className="h-6 w-6" /></span>
                <p className="mt-5 text-sm font-semibold text-brand-600">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{t}</h3>
                <p className="mx-auto mt-2 max-w-xs text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="border-t border-gray-100 bg-paper py-20">
        <div className="container-x">
          <h2 className="section-title text-center">Friendly, qualified teachers</h2>
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {TEACHERS.map((t) => (
              <div key={t.id} className="w-32 text-center">
                <img src={asset(t.photo)} alt={t.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                <p className="mt-3 text-sm font-semibold text-ink">{t.short}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container-x max-w-3xl"><h2 className="section-title mb-8 text-center">Questions</h2><Faq /></div>
      </section>

      {/* Trial form */}
      <section id="trial" className="border-t border-gray-100 bg-paper py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Book a free trial lesson</h2>
            <p className="mt-4 text-lg text-gray-600">Tell us who's learning and when suits you. There's no payment and no commitment.</p>
            <ul className="mt-8 space-y-3 text-gray-700">{['A free first lesson with a teacher', 'A weekly schedule that fits your family', 'Join from any device — nothing to install'].map((t) => <li key={t} className="flex items-center gap-3"><Check className="h-5 w-5 text-brand-600" />{t}</li>)}</ul>
            <p className="mt-8 text-sm text-gray-500">Questions? {BRAND.email}</p>
          </div>
          <TrialForm />
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="container-x flex flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bright Academy</p>
          <Link to="/login" className="hover:text-ink">Student & teacher login</Link>
        </div>
      </footer>
    </div>
  )
}
