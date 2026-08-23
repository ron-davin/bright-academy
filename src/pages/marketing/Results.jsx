import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, BadgeCheck, Quote } from 'lucide-react'
import { RESULTS } from '../../lib/data.js'
import { Avatar } from '../../components/ui/index.jsx'

export default function Results() {
  return (
    <>
      <section className="bg-paper py-16 text-center">
        <div className="container-x"><p className="eyebrow">Real students. Real results.</p>
          <h1 className="mt-3 font-display text-4xl font-black text-ink sm:text-5xl">Recitation that flows. Iman that lasts.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">Students at Bright Academy don't just keep up — they leap ahead. See the milestones, certificates and transformations our learners earn every term.</p>
          <div className="mt-7 flex justify-center gap-3"><Link to="/find-course" className="btn btn-md btn-ink">Find my course</Link><Link to="/how-it-works" className="btn btn-md btn-outline">How it works</Link></div></div>
      </section>
      <section className="container-x py-14">
        <h2 className="text-center font-display text-2xl font-bold text-ink">Trusted by Parents. Loved by Students.</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{RESULTS.stats.map((s) => <div key={s.l} className="rounded-2xl border border-ink/8 bg-white p-5 text-center shadow-card"><p className="font-display text-3xl font-black text-brand-700">{s.v}</p><p className="mt-1 text-xs text-ink/60">{s.l}</p></div>)}</div>
      </section>
      <section className="bg-paper py-14">
        <div className="container-x">
          <h2 className="font-display text-3xl font-black text-ink">Learning Transformations</h2>
          <p className="mt-2 text-ink/70">Average before/after results across our cohorts this year.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESULTS.transformations.map((t) => (
              <div key={t.subject} className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card">
                <p className="font-semibold text-ink">{t.subject}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/50">Before</p><p className="mt-1 text-xl font-bold text-ink/50">{t.before}</p></div>
                  <ArrowRight className="h-5 w-5 text-sun-500" />
                  <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">After</p><p className="mt-1 text-xl font-bold text-emerald-700">{t.after}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x py-14">
        <p className="eyebrow">Verified credentials</p><h2 className="mt-2 font-display text-3xl font-black text-ink">Certificates students earn</h2>
        <p className="mt-2 text-ink/70">Recognised milestones that build confidence and mark real mastery.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{RESULTS.certificates.map((cx) => <div key={cx.title} className="rounded-2xl border border-sun-400/40 bg-gradient-to-b from-sun-400/10 to-white p-6 text-center shadow-card"><Award className="mx-auto h-8 w-8 text-sun-500" /><p className="mt-3 font-semibold leading-snug text-ink">{cx.title}</p><p className="mt-2 text-xs text-ink/60">{cx.org}</p></div>)}</div>
      </section>
      <section className="bg-paper py-14">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          {RESULTS.stories.map((s) => <div key={s.who} className="rounded-3xl border border-ink/8 bg-white p-8 shadow-card"><Quote className="h-7 w-7 text-brand-300" /><p className="mt-4 text-lg font-medium leading-relaxed text-ink">“{s.quote}”</p><p className="mt-5 font-semibold text-ink">{s.who}</p><p className="flex items-center gap-1.5 text-sm text-emerald-700"><BadgeCheck className="h-4 w-4" /> {s.detail}</p></div>)}
        </div>
      </section>
      <section className="container-x py-14">
        <p className="eyebrow">Student showcase</p><h2 className="mt-2 font-display text-3xl font-black text-ink">Student works we're proud of</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">{RESULTS.works.map((w) => <div key={w.title} className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card"><div className="flex items-start justify-between"><p className="font-semibold text-ink">{w.title}</p><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">{w.score}</span></div><p className="mt-2 text-xs text-ink/60">{w.meta}</p></div>)}</div>
      </section>
      <section className="bg-paper py-14">
        <div className="container-x">
          <p className="eyebrow">Parent voices</p><h2 className="mt-2 font-display text-3xl font-black text-ink">Parent feedback</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">{RESULTS.parents.map((p) => <div key={p.name} className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card"><div className="flex items-center gap-3"><Avatar name={p.name} size="md" /><div><p className="font-semibold text-ink">{p.name}</p><p className="text-xs text-ink/60">{p.detail}</p></div></div><p className="mt-4 text-sm leading-relaxed text-ink/75">“{p.quote}”</p></div>)}</div>
        </div>
      </section>
      <section className="container-x pb-20">
        <div className="rounded-3xl bg-ink p-10 text-center text-cream">
          <h2 className="font-display text-3xl font-black text-white">Your child's results story starts here.</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/75">Join hundreds of families turning struggle into mastery — one lesson at a time.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/find-course" className="btn btn-md btn-sun">Find My Course</Link><Link to="/trial" className="btn btn-md border border-white/25 text-white hover:bg-white/10">Book a Free Trial</Link></div>
        </div>
      </section>
    </>
  )
}
