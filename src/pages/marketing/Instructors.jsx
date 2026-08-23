import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, GraduationCap, Award, Languages, BookOpen, Star, Play } from 'lucide-react'
import { TEACHERS, COURSES } from '../../lib/data.js'
import { TeacherCard } from '../../components/marketing/Cards.jsx'
import { Avatar, Badge, Stars, asset } from '../../components/ui/index.jsx'
import { useStore } from '../../lib/store.js'
import { fmtDate } from '../../lib/utils.js'

export function InstructorsList() {
  return (
    <section className="container-x py-14">
      <div className="max-w-2xl"><h1 className="font-display text-4xl font-black text-ink sm:text-5xl">Our Teachers</h1>
      <p className="mt-3 text-lg text-ink/70">Every Bright Academy teacher is Ijazah-certified or degree-qualified, background-checked, and trained in teaching children online.</p></div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{TEACHERS.map((t) => <TeacherCard key={t.id} teacher={t} compact />)}</div>
    </section>
  )
}

export default function InstructorDetail() {
  const { slug } = useParams()
  const t = TEACHERS.find((x) => x.slug === slug)
  const reviews = useStore((s) => s.reviews)
  if (!t) return <div className="container-x py-24 text-center"><h1 className="text-2xl font-bold">Teacher not found</h1></div>
  const tReviews = reviews.filter((r) => r.teacherId === t.id)
  const tCourses = COURSES.filter((c) => c.teacherId === t.id)
  return (
    <section className="container-x py-10 lg:py-14">
      <Link to="/instructors" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.8fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card">
            <img src={asset(t.portrait)} alt={t.name} className="aspect-[4/5] w-full object-cover" />
            <div className="p-6">
              <Badge tone="bg-sun-400/20 text-sun-600">⭐ Top rated</Badge>
              <h1 className="mt-3 font-display text-3xl font-black text-ink">{t.name}</h1>
              <p className="mt-1 text-ink/60">{t.headline}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[[`${t.years}+`, 'yrs experience'], [t.rating.toFixed(1), 'rating'], [tCourses.length, 'courses']].map(([v, l]) => <div key={l} className="rounded-xl bg-ink/4 p-3"><p className="text-xl font-bold text-ink">{v}</p><p className="text-[11px] text-ink/60">{l}</p></div>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">{t.subjects.map((s) => <Badge key={s} tone="bg-brand-100 text-brand-700">{s}</Badge>)}</div>
              <Link to={`/trial?teacher=${t.id}`} className="btn btn-md btn-sun mt-6 w-full">Book a free trial</Link>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><BadgeCheck className="h-5 w-5 text-brand-600" /> About</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-ink/75">{t.bio}</p></div>
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><BookOpen className="h-5 w-5 text-brand-600" /> Experience</h2><p className="mt-3 leading-relaxed text-ink/75">{t.experience}</p></div>
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><Languages className="h-5 w-5 text-brand-600" /> Languages</h2><div className="mt-3 flex flex-wrap gap-2">{t.languages.map((l) => <Badge key={l} tone="bg-ink/5 text-ink/80">{l}</Badge>)}</div></div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><GraduationCap className="h-5 w-5 text-brand-600" /> Education</h2>{t.education.map((e) => <div key={e.degree} className="mt-3 rounded-xl border border-ink/8 bg-white p-4"><p className="font-semibold text-ink">{e.degree}</p><p className="text-sm text-ink/60">{e.school} · {e.year}</p></div>)}</div>
            <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><Award className="h-5 w-5 text-brand-600" /> Certifications & awards</h2>{[...t.certifications, ...t.awards].map((e) => <div key={e.name} className="mt-3 rounded-xl border border-ink/8 bg-white p-4"><p className="font-semibold text-ink">{e.name}</p><p className="text-sm text-ink/60">{e.org} · {e.year}</p></div>)}</div>
          </div>
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-ink"><Play className="h-5 w-5 text-brand-600" /> Sample lessons</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{t.sampleLessons.map((s) => <div key={s} className="flex items-center gap-3 rounded-xl border border-ink/8 bg-white p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50"><Play className="h-4 w-4 text-brand-600" /></span><p className="text-sm font-medium text-ink">{s}</p></div>)}</div></div>
          <div>
            <h2 className="text-lg font-bold text-ink">Courses taught</h2>
            <div className="mt-3 grid gap-3">{tCourses.map((cx) => <Link key={cx.id} to={`/courses/${cx.slug}`} className="flex items-center justify-between gap-4 rounded-xl border border-ink/8 bg-white p-4 hover:shadow-card"><div className="flex items-center gap-3"><span className="text-xl">{cx.emoji}</span><div><p className="font-semibold text-ink">{cx.title}</p><p className="text-xs text-ink/60">{cx.subject} · {cx.level}</p></div></div><Star className="h-4 w-4 fill-sun-400 text-sun-400" /></Link>)}</div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Reviews</h2>
            <div className="mt-3 space-y-3">{tReviews.map((r) => <div key={r.id} className="rounded-xl border border-ink/8 bg-white p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Avatar name={r.authorName} size="sm" /><div><p className="text-sm font-semibold">{r.authorName}</p><p className="text-xs text-ink/50">{fmtDate(r.at)}</p></div></div><Stars value={r.rating} /></div>{r.text && <p className="mt-2.5 text-sm leading-relaxed text-ink/75">{r.text}</p>}</div>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
