import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, RefreshCw } from 'lucide-react'
import { COURSES } from '../../lib/data.js'
import { CourseCard } from '../../components/marketing/Cards.jsx'
import { Button } from '../../components/ui/index.jsx'
import { cn } from '../../lib/utils.js'

const QUESTIONS = [
  { key: 'age', q: 'How old is your child?', opts: [['4-6', '4–6 years'], ['7-9', '7–9 years'], ['10-12', '10–12 years'], ['13-18', '13–18 years']] },
  { key: 'goal', q: 'What is the main goal right now?', opts: [['read', 'Learn to read the Quran'], ['recite', 'Recite beautifully with Tajweed'], ['hifz', 'Memorise the Quran'], ['arabic', 'Learn Arabic'], ['deen', 'Understand the deen (Fiqh, Seerah…)']] },
  { key: 'level', q: 'Where are they today?', opts: [['zero', 'Complete beginner'], ['letters', 'Knows the letters'], ['reads', 'Reads, but slowly'], ['fluent', 'Reads fluently']] },
  { key: 'format', q: 'Which format suits them best?', opts: [['individual', '1-on-1 — personal pace'], ['group', 'Small group — loves friends'], ['any', 'No preference']] },
]

function recommend(a) {
  const age = a.age === '4-6' ? 5 : a.age === '7-9' ? 8 : a.age === '10-12' ? 11 : 15
  let picks = []
  if (a.goal === 'read') picks = age <= 6 ? ['c1', 'c10'] : ['c1', 'c12']
  else if (a.goal === 'recite') picks = a.level === 'fluent' && age >= 12 ? ['c9', 'c2'] : ['c2', 'c12']
  else if (a.goal === 'hifz') picks = ['c3', 'c2']
  else if (a.goal === 'arabic') picks = age <= 12 ? ['c4', 'c5'] : ['c5', 'c11']
  else picks = age <= 9 ? ['c6', 'c7'] : ['c7', 'c8', 'c6']
  if (a.level === 'zero' && !picks.includes('c1') && a.goal !== 'arabic' && a.goal !== 'deen') picks.unshift('c1')
  let list = picks.map((id) => COURSES.find((c) => c.id === id)).filter(Boolean)
  if (a.format !== 'any') { const pref = list.filter((c) => c.type === a.format); if (pref.length) list = [...pref, ...list.filter((c) => c.type !== a.format)] }
  return list.filter((c) => age >= c.ages[0] - 1 && age <= c.ages[1] + 2).slice(0, 3)
}

export default function FindCourse() {
  const [i, setI] = useState(0)
  const [a, setA] = useState({})
  const doneAll = i >= QUESTIONS.length
  const recs = doneAll ? recommend(a) : []
  return (
    <section className="bg-paper py-16">
      <div className="container-x max-w-3xl">
        <div className="text-center"><p className="eyebrow">Course finder</p><h1 className="mt-3 font-display text-4xl font-black text-ink">Find your child's learning path</h1><p className="mt-3 text-lg text-ink/70">Four quick questions — get a personalised recommendation in under a minute.</p></div>
        {!doneAll ? (
          <div className="mt-10 rounded-3xl border border-ink/8 bg-white p-8 shadow-card">
            <div className="flex items-center justify-between text-xs font-semibold text-ink/50"><span>Question {i + 1} of {QUESTIONS.length}</span><span>{Math.round((i / QUESTIONS.length) * 100)}%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(i / QUESTIONS.length) * 100}%` }} /></div>
            <h2 className="mt-6 text-2xl font-bold text-ink">{QUESTIONS[i].q}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {QUESTIONS[i].opts.map(([v, l]) => <button key={v} type="button" onClick={() => { setA((x) => ({ ...x, [QUESTIONS[i].key]: v })); setI((x) => x + 1) }} className="rounded-2xl border border-ink/12 px-5 py-4 text-left font-medium text-ink transition-all hover:border-brand-500 hover:bg-brand-50 hover:shadow-card">{l}</button>)}
            </div>
            {i > 0 && <button type="button" className="mt-6 text-sm font-medium text-ink/50 hover:text-ink" onClick={() => setI((x) => x - 1)}>← Back</button>}
          </div>
        ) : (
          <div className="mt-10">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center"><p className="flex items-center justify-center gap-2 font-bold text-emerald-800"><Sparkles className="h-5 w-5" /> Our recommendation for your child</p><p className="mt-1 text-sm text-emerald-700">Based on age, goal and current level. Book a free trial — the teacher will confirm the exact starting point.</p></div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{recs.map((c) => <CourseCard key={c.id} course={c} compact />)}</div>
            <div className="mt-8 flex justify-center gap-3"><Link to="/trial" className="btn btn-md btn-sun">Book a free trial</Link><Button variant="outline" onClick={() => { setI(0); setA({}) }}><RefreshCw className="h-4 w-4" /> Start over</Button></div>
          </div>
        )}
      </div>
    </section>
  )
}
