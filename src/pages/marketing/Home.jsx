import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, GraduationCap, Clock, Star } from 'lucide-react'
import { COURSES, TEACHERS, TESTIMONIALS, FAQS } from '../../lib/data.js'
import { FAQ, PricingCards } from '../../components/marketing/Sections.jsx'
import { Avatar, Input, Textarea, Button, asset } from '../../components/ui/index.jsx'
import { useStore, toast } from '../../lib/store.js'

const SectionHead = ({ eyebrow, title, desc }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="section-title mt-3">{title}</h2>
    {desc && <p className="mt-4 text-ink/70">{desc}</p>}
  </div>
)

function LeadForm() {
  const addLead = useStore((s) => s.addLead)
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', message: '' })
  const [ok, setOk] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); addLead({ ...f, source: 'home-consultation' }); setOk(true); toast({ title: 'Request received!', desc: 'We will reach out within one working day.', type: 'success' }) }
  if (ok) return <div className="rounded-2xl bg-white p-8 text-center"><Check className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-3 font-bold text-ink">JazakAllah khair, {f.first}!</p><p className="mt-1 text-sm text-ink/60">Our team will contact you within one working day, in sha Allah.</p></div>
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-6 text-ink shadow-float">
      <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="First name" required value={f.first} onChange={set('first')} /><Input placeholder="Last name" required value={f.last} onChange={set('last')} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Input type="email" placeholder="Email" required value={f.email} onChange={set('email')} /><Input type="tel" placeholder="Phone" required value={f.phone} onChange={set('phone')} /></div>
      <Textarea rows={2} placeholder="Your child's age, level and goals (optional)" value={f.message} onChange={set('message')} />
      <Button type="submit" variant="sun" className="w-full">Request a free consultation</Button>
    </form>
  )
}

export default function Home() {
  const courses = COURSES.filter((c) => c.featured).slice(0, 6)
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <p className="font-[Amiri,serif] text-xl text-sun-300">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] sm:text-6xl">Learn the Qur'an, Arabic &amp; Islam — <span className="text-sun-400">brightly</span>.</h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">Live online classes for kids and teens in Qur'an recitation, Tajweed, Hifz, Arabic and Islamic Studies — taught by qualified teachers, at times that fit your family.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/trial" className="btn btn-lg btn-sun">Book a free trial</Link>
              <a href="#courses" className="btn btn-lg border border-white/25 text-white hover:bg-white/10">Explore courses</a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
              <span className="text-sun-400">★★★★★</span><span>4.9 average rating</span><span>•</span><span>850+ families</span><span>•</span><span>7 qualified teachers</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-t-[10rem] rounded-b-3xl border border-white/15 bg-white/5 px-8 pb-10 pt-16 text-center">
              <img src={asset('logo-mark-t.png')} alt="" className="mx-auto h-24 w-24 object-contain" />
              <p className="mt-6 font-[Amiri,serif] text-3xl leading-relaxed text-sun-300">رَّبِّ زِدْنِي عِلْمًا</p>
              <p className="mt-3 text-sm italic text-white/70">"My Lord, increase me in knowledge." — Qur'an 20:114</p>
            </div>
            <div className="absolute -left-6 top-10 hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-float sm:flex"><GraduationCap className="h-4 w-4 text-brand-600" /> Ijazah &amp; degree-qualified</div>
            <div className="absolute -bottom-5 -right-4 hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-float sm:flex"><Clock className="h-4 w-4 text-brand-600" /> Flexible class times</div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <div className="border-b border-ink/5 bg-paper">
        <div className="container-x grid grid-cols-2 gap-6 py-8 text-center lg:grid-cols-4">
          {[['850+', 'Families learning'], ['7', 'Qualified teachers'], ['30+', 'Countries reached'], ['4.9 / 5', 'Average rating']].map(([v, l]) => (
            <div key={l}><p className="font-display text-3xl font-black text-brand-700">{v}</p><p className="text-sm text-ink/60">{l}</p></div>
          ))}
        </div>
      </div>

      {/* Courses */}
      <section id="courses" className="py-20">
        <div className="container-x">
          <SectionHead eyebrow="Our courses" title="A path for every learner" desc="From the first Arabic letter to the final page of Hifz — structured courses with clear outcomes." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article key={c.id} className="flex flex-col rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{c.emoji}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{c.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink/70">{c.type === 'group' ? 'Small group' : '1-on-1'}</span>
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink/70">Ages {c.ages[0]}–{c.ages[1]}</span>
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink/70">from ${c.price}/mo</span>
                </div>
                <Link to={`/courses/${c.slug}`} className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700 hover:gap-2 transition-all">View course <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/courses" className="btn btn-md btn-outline">See all courses</Link></div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-paper py-20">
        <div className="container-x">
          <SectionHead eyebrow="How it works" title="Start learning in three steps" desc="Your first trial lesson is free — no card required." />
          <div className="grid gap-6 md:grid-cols-3">
            {[['1', 'Tell us about your child', 'Age, current level and goals — we match the right course and teacher.'], ['2', 'Book a free trial', 'Meet the teacher live online and get a short level assessment.'], ['3', 'Learn every week', 'Live classes, homework and progress reports in your parent dashboard.']].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl bg-white p-7 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{n}</span>
                <h3 className="mt-4 text-lg font-bold text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section id="teachers" className="py-20">
        <div className="container-x">
          <SectionHead eyebrow="Meet the teachers" title="Learn from people who live this knowledge" desc="Graduates of the Islamic University of Madinah, Taif University and more — with years of teaching experience." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEACHERS.map((t) => (
              <Link key={t.id} to={`/instructors/${t.slug}`} className="group rounded-2xl border border-ink/8 bg-white p-5 text-center shadow-card hover:shadow-float">
                <img src={asset(t.photo)} alt={t.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                <h3 className="mt-4 font-bold text-ink group-hover:text-brand-700">{t.name}</h3>
                <p className="mt-1 text-sm text-brand-700">{t.subjects.join(' & ')}</p>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink/55"><Star className="h-3.5 w-3.5 fill-sun-400 text-sun-400" /> {t.rating.toFixed(1)} · {t.years}+ years</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-paper py-20">
        <div className="container-x">
          <SectionHead eyebrow="Parent stories" title="Loved by families worldwide" />
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((q) => (
              <article key={q.name} className="rounded-2xl bg-white p-6 shadow-card">
                <p className="text-sun-500">★★★★★</p>
                <p className="mt-3 leading-relaxed text-ink/80">“{q.text}”</p>
                <div className="mt-5 flex items-center gap-3"><Avatar name={q.name} size="sm" /><div><p className="text-sm font-semibold">{q.name}</p><p className="text-xs text-ink/55">{q.role}</p></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container-x max-w-5xl">
          <SectionHead eyebrow="Pricing" title="Simple plans, no surprises" desc="Every course starts with a free trial. Pause or cancel anytime." />
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-paper py-20">
        <div className="container-x max-w-3xl">
          <SectionHead eyebrow="FAQ" title="Questions parents ask" />
          <FAQ items={FAQS.slice(0, 6)} />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand-900 py-20 text-white">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-black">Begin your child's journey today</h2>
            <p className="mt-4 text-white/75">Book a free trial lesson, or leave your details and our team will recommend the right course.</p>
            <Link to="/trial" className="btn btn-lg btn-sun mt-6">Book a free trial</Link>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  )
}
