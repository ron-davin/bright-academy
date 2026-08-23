import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, Star, ArrowRight, Heart } from 'lucide-react'
import { TEACHERS } from '../../lib/data.js'
import { Avatar, Stars, asset } from '../ui/index.jsx'
import { cn, money } from '../../lib/utils.js'
import { useStore } from '../../lib/store.js'

const EMPTY = []

export function CourseCard({ course, compact }) {
  const t = TEACHERS.find((x) => x.id === course.teacherId)
  const userId = useStore((s) => s.currentUserId); const wish = useStore((s) => (userId ? s.wishlists[userId] || EMPTY : EMPTY)); const toggleWishlist = useStore((s) => s.toggleWishlist)
  const slots = course.slots
  return (
    <Link to={`/courses/${course.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-float">
      <div className="relative border-b border-ink/5 bg-gradient-to-br from-brand-50 via-white to-sun-400/10 p-5">
        <div className="flex items-center justify-between">
          <span className={cn('badge', slots <= 5 ? 'bg-coral-500/10 text-coral-600' : 'bg-emerald-100 text-emerald-700')}>{slots <= 5 ? `Only ${slots} slots this week` : `${slots >= 30 ? '30+' : slots} slots this week`}</span>
          {userId && <button type="button" onClick={(e) => { e.preventDefault(); toggleWishlist(userId, course.id) }} className="rounded-full bg-white/80 p-1.5 text-ink/40 hover:text-coral-500" aria-label="Wishlist"><Heart className={cn('h-4 w-4', wish.includes(course.id) && 'fill-coral-500 text-coral-500')} /></button>}
        </div>
        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">{course.emoji}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink/60">{course.subject}</p>
            <div className="mt-1 flex flex-wrap gap-1.5"><span className="badge bg-brand-100 text-brand-700">{course.type === 'group' ? 'Group' : '1-on-1'}</span><span className="badge bg-ink/5 text-ink/70">{course.level}</span></div>
          </div>
        </div>
        <h3 className="mt-4 line-clamp-2 font-display text-xl font-bold leading-snug text-ink group-hover:text-brand-700">{course.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-ink/70"><Avatar src={t?.photo} name={t?.name} size="xs" /><span className="font-medium">{t?.short}</span><span className="text-ink/30">·</span><Star className="h-3.5 w-3.5 fill-sun-400 text-sun-400" /><span className="font-semibold">{course.rating.toFixed(1)}</span><span className="text-ink/50">({course.reviews})</span></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-ink/70">{course.summary}</p>
        {!compact && <>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink/50">Expected outcome</p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-ink">{course.outcome}</p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink/50">Skills covered</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{course.skills.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/70">{s}</span>)}</div>
        </>}
        <div className="mt-auto pt-5">
          <div className="flex items-center gap-4 text-xs text-ink/60"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.weeks} weeks</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Ages {course.ages[0]}-{course.ages[1]}</span></div>
          <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-3"><p className="text-sm text-ink/60">From <span className="text-lg font-bold text-ink">{money(course.price, { cents: true })}</span>/month</p><span className="flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">View <ArrowRight className="h-4 w-4" /></span></div>
        </div>
      </div>
    </Link>
  )
}

export function TeacherCard({ teacher, compact }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
      <div className="flex items-center gap-4">
        <img src={asset(teacher.photo)} alt={teacher.name} className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold text-ink">{teacher.short}</h3>
          <p className="mt-0.5 text-sm text-ink/60">{teacher.subjects.join(' & ')}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm"><Stars value={teacher.rating} /><span className="font-semibold">{teacher.rating.toFixed(1)}</span><span className="text-ink/50">({teacher.reviews})</span></div>
        </div>
      </div>
      <p className={cn('mt-4 text-sm leading-relaxed text-ink/70', compact ? 'line-clamp-4' : 'line-clamp-6')}>{teacher.bio}</p>
      <div className="mt-auto pt-5"><Link to={`/instructors/${teacher.slug}`} className="btn btn-sm btn-outline w-full">View Profile</Link></div>
    </div>
  )
}

export function Testimonial({ t }) {
  return (
    <div className="w-[320px] shrink-0 rounded-2xl border border-ink/8 bg-white p-6 shadow-card sm:w-[380px]">
      <Stars value={5} />
      <p className="mt-3 text-[15px] leading-relaxed text-ink">“{t.text}”</p>
      <div className="mt-5 flex items-center gap-3"><Avatar name={t.name} size="sm" /><div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-ink/60">{t.role}</p></div></div>
    </div>
  )
}
