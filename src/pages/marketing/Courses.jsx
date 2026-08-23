import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Percent, Sparkles } from 'lucide-react'
import { COURSES, CATEGORIES, SUBJECTS } from '../../lib/data.js'
import { CourseCard } from '../../components/marketing/Cards.jsx'
import { Select, Input } from '../../components/ui/index.jsx'
import { cn } from '../../lib/utils.js'

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const type = params.get('type') || 'all'
  const category = params.get('category') || 'all'
  const subject = params.get('subject') || 'all'
  const age = params.get('age') || 'all'
  const setP = (k, v) => { const p = new URLSearchParams(params); if (v === 'all') p.delete(k); else p.set(k, v); setParams(p, { replace: true }) }
  const list = useMemo(() => COURSES.filter((c) =>
    (type === 'all' || c.type === type) && (category === 'all' || c.category === category) && (subject === 'all' || c.subject === subject) &&
    (age === 'all' || (c.ages[0] <= +age && +age <= c.ages[1])) && (!q || (c.title + c.summary + c.subject).toLowerCase().includes(q.toLowerCase()))
  ), [type, category, subject, age, q])
  return (
    <>
      <section className="border-b border-ink/5 bg-paper">
        <div className="container-x py-12 lg:py-16">
          <h1 className="font-display text-4xl font-black text-ink sm:text-5xl">All Programs</h1>
          <p className="mt-3 text-lg text-ink/70">Structured Quran, Arabic & Islamic Studies courses designed for measurable outcomes</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-sun-400/40 bg-sun-400/10 p-6">
              <p className="flex items-center gap-2 font-bold text-ink"><Percent className="h-4 w-4 text-sun-600" /> Save more when you learn more!</p>
              <p className="mt-1 text-sm text-ink/60">Automatic discounts applied at checkout</p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/80"><li>• <b>10%</b> when one child takes 2 courses</li><li>• <b>15%</b> when one child takes 3+ courses</li><li>• <b>+10%</b> extra sibling discount for 2+ children</li></ul>
              <p className="mt-3 text-xs text-ink/50">* Discounts apply to courses scheduled 2×/week or more.</p>
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
              <div><p className="flex items-center gap-2 font-bold text-ink"><Sparkles className="h-4 w-4 text-brand-600" /> Not sure where to start?</p>
              <p className="mt-1 text-sm text-ink/60">Answer a few questions and get a personalised learning plan for your child.</p></div>
              <div className="mt-4 flex flex-wrap gap-3"><Link to="/find-course" className="btn btn-sm btn-primary">Find my child's learning path</Link><Link to="/how-it-works" className="btn btn-sm btn-outline">See how it works</Link></div>
            </div>
          </div>
        </div>
      </section>
      <section className="container-x py-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="tabs">{[['all', 'All'], ['individual', '1-on-1'], ['group', 'Group']].map(([v, l]) => <button key={v} type="button" className={cn('tab', type === v && 'tab-active')} onClick={() => setP('type', v)}>{l}</button>)}</div>
          <Select value={category} onChange={(e) => setP('category', e.target.value)} className="w-44 !py-2"><option value="all">All Categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</Select>
          <Select value={subject} onChange={(e) => setP('subject', e.target.value)} className="w-44 !py-2"><option value="all">All Subjects</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
          <Select value={age} onChange={(e) => setP('age', e.target.value)} className="w-28 !py-2"><option value="all">Age</option>{[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((a) => <option key={a} value={a}>{a} yrs</option>)}</Select>
          <div className="relative ml-auto w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><Input placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 !py-2" /></div>
        </div>
        <p className="mt-6 text-sm text-ink/60">{list.length} course{list.length === 1 ? '' : 's'}</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CourseCard key={c.id} course={c} />)}</div>
        {list.length === 0 && <p className="py-20 text-center text-ink/60">No courses match those filters yet. Try clearing a filter.</p>}
      </section>
    </>
  )
}
