import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users, ShieldCheck, ListChecks, Target, Star, Check, Phone, Mail } from 'lucide-react'
import { COURSES, TEACHERS, CATEGORIES, HERO_CARDS, STATS, HOW_IT_WORKS, TESTIMONIALS, FAQS, BRAND } from '../../lib/data.js'
import { CourseCard, TeacherCard, Testimonial } from '../../components/marketing/Cards.jsx'
import { Carousel, FAQ, PricingCards, Promise, useCountUp, useInView } from '../../components/marketing/Sections.jsx'
import { SectionHeading, Avatar, Input, Textarea, Button, asset } from '../../components/ui/index.jsx'
import { useStore, toast } from '../../lib/store.js'
import { cn } from '../../lib/utils.js'

function HeroCards() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % HERO_CARDS.length), 4200); return () => clearInterval(t) }, [])
  const pos = (idx) => { const d = (idx - i + HERO_CARDS.length) % HERO_CARDS.length; return d }
  const styles = ['z-30 translate-x-0 rotate-0 scale-100 opacity-100', 'z-20 translate-x-[38%] rotate-[7deg] scale-[.92] opacity-90', 'z-10 translate-x-[10%] rotate-[2deg] scale-[.84] opacity-0 sm:opacity-40', 'z-20 -translate-x-[38%] -rotate-[7deg] scale-[.92] opacity-90']
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[420px] sm:h-[460px]">
      <span className="absolute -top-3 left-1/2 z-40 -translate-x-1/2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm">Real student results</span>
      {HERO_CARDS.map((c, idx) => (
        <div key={c.subject} className={cn('absolute inset-x-6 top-6 rounded-3xl border border-ink/8 bg-gradient-to-b p-6 shadow-float transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] sm:inset-x-10', c.tone, styles[pos(idx)])} style={{ transformOrigin: '50% 120%' }}>
          <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold text-ink"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base shadow-sm">{c.icon}</span>{c.subject}</span><span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-sun-400 text-sun-400" />)}</span></div>
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">{c.label}</p>
          <p className="mt-2 font-display text-4xl font-black text-brand-800 sm:text-5xl">{c.big}</p>
          <p className="mt-5 min-h-[48px] text-[15px] leading-relaxed text-ink/80">{c.quote}</p>
          <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4 text-xs"><span className="font-semibold text-ink">{c.who}</span><span className="text-ink/50">Verified parent</span></div>
        </div>
      ))}
      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">{HERO_CARDS.map((_, idx) => <button key={idx} type="button" onClick={() => setI(idx)} className={cn('h-1.5 rounded-full transition-all', idx === i ? 'w-6 bg-brand-600' : 'w-1.5 bg-ink/20')} aria-label={`Slide ${idx + 1}`} />)}</div>
    </div>
  )
}

function Stat({ s, start }) { const v = useCountUp(s.value, { decimals: s.decimals || 0, start }); return <div className="text-center"><p className="font-display text-5xl font-black text-brand-700 sm:text-6xl">{s.decimals ? v.toFixed(1) : Math.round(v).toLocaleString()}{s.suffix}</p><p className="mt-2 text-sm text-ink/70">{s.label}</p></div> }

function LeadForm() {
  const addLead = useStore((s) => s.addLead)
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', message: '' }); const [ok, setOk] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); addLead({ ...f, source: 'home-consultation' }); setOk(true); toast({ title: 'Request received!', desc: 'Our academic team will reach out within one working day.', type: 'success' }) }
  if (ok) return <div className="rounded-3xl bg-white/10 p-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"><Check className="h-7 w-7 text-emerald-300" /></div><h3 className="mt-4 font-display text-2xl font-bold text-white">JazakAllah khair, {f.first}!</h3><p className="mt-2 text-sm text-cream/80">We received your request. Expect an email from our academic team within one working day, in sha Allah.</p></div>
  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-float sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2"><Input label="First Name" required value={f.first} onChange={set('first')} /><Input label="Last Name" required value={f.last} onChange={set('last')} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Input label="Email" type="email" required value={f.email} onChange={set('email')} /><Input label="Phone" type="tel" required placeholder="+1 555 000 0000" value={f.phone} onChange={set('phone')} /></div>
      <Textarea label="Message (optional)" placeholder="Tell us about your child: age, current level, goals…" value={f.message} onChange={set('message')} />
      <Button type="submit" variant="sun" className="w-full">Request my free consultation</Button>
      <p className="text-center text-xs text-ink/50">By submitting this form, you agree to our privacy policy and terms of service. We'll never share your information with third parties.</p>
    </form>
  )
}

export default function Home() {
  const [statsRef, statsIn] = useInView()
  const featured = COURSES.filter((c) => c.featured)
  return (
    <>
      {/* HERO */}
      <section className="grain relative overflow-hidden bg-gradient-to-b from-white to-paper">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-sun-400/20 blur-3xl" /><div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"><Sparkles className="h-3.5 w-3.5 text-sun-500" /> Outcome-driven Islamic learning</span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">Islamic learning that guarantees your child's <span className="text-sun-500">progress</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">Not random tutoring. Bright Academy offers structured Quran, Arabic and Islamic Studies courses with clear outcomes, vetted teachers and monthly progress tracking — so you see real results.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/find-course" className="btn btn-lg btn-ink">Find your child's course <ArrowRight className="h-4 w-4" /></Link><Link to="/trial" className="btn btn-lg btn-light border border-ink/10">Book a free trial</Link></div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3"><div className="flex -space-x-2">{TEACHERS.slice(0, 4).map((t) => <Avatar key={t.id} src={t.photo} name={t.name} size="sm" ring />)}</div><p className="text-sm"><span className="font-bold text-ink">850+ families</span><br /><span className="text-ink/60">learning every week</span></p></div>
              <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2"><span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-emerald-500 text-emerald-500" />)}</span><p className="text-sm"><span className="font-bold">Excellent</span> <span className="font-semibold">4.9</span> <span className="text-ink/50">· 320+ parent reviews</span></p></div>
            </div>
          </div>
          <div className="animate-fade-up delay-200"><HeroCards /><p className="mt-6 text-center"><Link to="/results" className="text-sm font-semibold text-brand-700 hover:underline">View all success cases →</Link></p></div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="bg-ink text-cream">
        <div className="container-x grid grid-cols-2 gap-px py-10 lg:grid-cols-4">
          {[[Users, '1-on-1 & small groups', 'Private or 4–8 per class'], [ShieldCheck, 'Vetted teachers', 'Ijazah-certified, background-checked'], [ListChecks, 'Structured curriculum', 'Term-by-term progress plans'], [Target, 'Outcome-driven', 'Measurable results, every term']].map(([I, t, d]) => (
            <div key={t} className="flex items-start gap-3 px-4 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><I className="h-5 w-5 text-sun-400" /></span><div><p className="font-semibold">{t}</p><p className="text-sm text-cream/60">{d}</p></div></div>
          ))}
        </div>
      </section>

      {/* WAYS TO GROW */}
      <section className="bg-paper py-20 lg:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Ways to grow" title="Pick a path that fits your child." action={<Link to="/courses" className="btn btn-md btn-outline">Browse all programs <ArrowRight className="h-4 w-4" /></Link>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/courses?category=${c.slug}`} className="group rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-float">
                <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl text-2xl', c.color)}>{c.emoji}</span>
                <h3 className="mt-5 font-display text-2xl font-bold text-ink">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{c.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2 transition-all">Explore <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PARENT FAVOURITES */}
      <section className="grain relative bg-white py-20 lg:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Parent favourites" title="Courses families love this term." action={<Link to="/courses" className="btn btn-md btn-outline">See all courses <ArrowRight className="h-4 w-4" /></Link>} />
          <Carousel itemClass="w-[320px] sm:w-[380px]">{featured.map((c) => <CourseCard key={c.id} course={c} />)}</Carousel>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-brand-900 py-20 text-cream lg:py-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="container-x relative">
          <SectionHeading light eyebrow="How it works" title="From curious to confident in three steps." />
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => <div key={s.n} className="rounded-3xl border border-white/10 bg-white/5 p-7"><p className="font-display text-5xl font-black text-sun-400">{s.n}</p><h3 className="mt-4 text-xl font-bold">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-cream/70">{s.desc}</p></div>)}
          </div>
          <div className="mt-10"><Link to="/how-it-works" className="btn btn-md btn-sun">See how Bright Academy works <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="bg-white py-20" ref={statsRef}>
        <div className="container-x">
          <SectionHeading eyebrow="Real outcomes" title="Numbers that matter to parents." align="center" />
          <div className="grid grid-cols-2 gap-10 sm:gap-14 lg:grid-cols-4">{STATS.map((s) => <Stat key={s.label} s={s} start={statsIn} />)}</div>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Expert instructors" title="Real teachers, real connection, real progress." desc="Learn from vetted, Ijazah-certified teachers with real classroom experience. With small, live classes and personal attention, your child gets the mentorship they need to thrive." action={<Link to="/instructors" className="btn btn-md btn-outline">View all teachers <ArrowRight className="h-4 w-4" /></Link>} />
          <Carousel itemClass="w-[320px] sm:w-[400px]">{TEACHERS.map((t) => <TeacherCard key={t.id} teacher={t} compact />)}</Carousel>
        </div>
      </section>

      {/* BECOME A TUTOR */}
      <section className="bg-paper pb-16">
        <div className="container-x grid items-center gap-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white md:grid-cols-2 md:gap-10 lg:p-12">
          <div><h2 className="font-display text-3xl font-black sm:text-4xl">Become a tutor</h2><p className="mt-3 max-w-md text-cream/80">Earn by sharing your knowledge of the Quran, Arabic or Islamic sciences with students worldwide. Teach online with Bright Academy.</p>
            <ul className="mt-6 space-y-2 text-sm">{['Find new students', 'Grow your teaching', 'Get paid securely'].map((t) => <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-sun-400" /> {t}</li>)}</ul>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/become-teacher" className="btn btn-md btn-sun">Become a tutor</Link><Link to="/how-it-works" className="btn btn-md border border-white/30 text-white hover:bg-white/10">How our platform works</Link></div></div>
          <div className="flex justify-center"><div className="grid grid-cols-3 gap-3">{TEACHERS.slice(0, 6).map((t, i) => <img key={t.id} src={asset(t.photo)} alt={t.name} className={cn('h-24 w-24 rounded-2xl object-cover shadow-lg sm:h-28 sm:w-28', i % 2 ? 'translate-y-4' : '')} />)}</div></div>
        </div>
      </section>

      {/* TRUSTED */}
      <section className="container-x py-4 sm:py-8">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 text-center shadow-card">
          <p className="eyebrow">Trusted worldwide</p><h3 className="mt-3 font-display text-2xl font-bold text-ink">Families from 30+ countries learn with Bright Academy</h3>
          <p className="mt-4 text-3xl tracking-wider">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇲🇾 🇸🇬 🇮🇩 🇵🇰 🇦🇪 🇸🇦 🇿🇦 🇳🇬 🇺🇿 🇹🇷 🇩🇪</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="overflow-hidden bg-white py-24">
        <div className="container-x"><SectionHeading eyebrow="Loved by families" title="Hundreds of parents. One happy classroom." align="center" /></div>
        <div className="mask-fade-x"><div className="marquee flex w-max gap-5 pb-2">{[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => <Testimonial key={i} t={t} />)}</div></div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-paper py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Transparent pricing" title="Simple. No hidden fees." desc="Pick the format that suits your child. Prices vary by subject and teacher — browse courses to see exact rates." align="center" />
          <PricingCards /><Promise />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div><p className="eyebrow">FAQ</p><h2 className="section-title mt-3">Questions parents ask.</h2><p className="mt-4 text-ink/70">Can't find your answer? Our team replies within one working day.</p><a href={`mailto:${BRAND.email}`} className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-700"><Mail className="h-4 w-4" /> {BRAND.email}</a></div>
          <FAQ items={FAQS} />
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="grain relative overflow-hidden bg-ink py-24 text-cream">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="container-x relative grid gap-14 lg:grid-cols-2">
          <div><p className="eyebrow text-sun-400">Free consultation</p><h2 className="section-title mt-3 text-white">Let's build the right plan for your child.</h2><p className="mt-5 text-lg text-cream/75">Tell us a little about your child and goals. Our academic team will reach out with tailored recommendations — usually within one working day.</p>
            <ul className="mt-8 space-y-3">{['A free 1-on-1 consultation with our academic team', 'A personalised Quran / Arabic / Islamic Studies plan', 'No obligation — cancel anytime, no card required'].map((t) => <li key={t} className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sun-400/20"><Check className="h-3 w-3 text-sun-400" /></span><span className="text-cream/90">{t}</span></li>)}</ul>
            <p className="mt-8 flex items-center gap-2 text-sm text-cream/70"><Phone className="h-4 w-4" /> {BRAND.phone}</p></div>
          <LeadForm />
        </div>
      </section>
    </>
  )
}
