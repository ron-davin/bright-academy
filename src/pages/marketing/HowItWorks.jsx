import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HOW_IT_WORKS_LONG } from '../../lib/data.js'

export default function HowItWorks() {
  return (
    <>
      <section className="bg-paper py-16 text-center"><div className="container-x"><p className="eyebrow">From sign-up to mastery</p><h1 className="mt-3 font-display text-4xl font-black text-ink sm:text-5xl">How Bright Academy Works</h1><p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">From choosing a program to tracking measurable results — here's what the journey looks like.</p></div></section>
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          {HOW_IT_WORKS_LONG.map((s) => (
            <div key={s.n} className="flex gap-6 rounded-3xl border border-ink/8 bg-white p-7 shadow-card">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-display text-xl font-black text-white">{s.n}</span>
              <div><h2 className="text-xl font-bold text-ink">{s.title}</h2><p className="mt-2 leading-relaxed text-ink/70">{s.desc}</p></div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 max-w-3xl rounded-3xl bg-ink p-10 text-center text-cream">
          <h2 className="font-display text-3xl font-black text-white">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/75">Join hundreds of families who trust Bright Academy for their children's Islamic education. Start with a free trial today.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/trial" className="btn btn-md btn-sun">Book a Free Trial</Link><Link to="/courses" className="btn btn-md border border-white/25 text-white hover:bg-white/10">Browse Courses <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </>
  )
}
