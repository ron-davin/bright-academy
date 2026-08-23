import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, money } from '../../lib/utils.js'
import { FAQS, PRICING } from '../../lib/data.js'

export function useCountUp(target, { duration = 1600, decimals = 0, start = true } = {}) {
  const [v, setV] = useState(0)
  useEffect(() => { if (!start) return; let raf; const t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / duration); const eased = 1 - Math.pow(1 - p, 3); setV(+(target * eased).toFixed(decimals)); if (p < 1) raf = requestAnimationFrame(tick) }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf) }, [target, duration, decimals, start])
  return v
}
export function useInView(opts = { threshold: 0.3 }) {
  const ref = useRef(null); const [inView, setInView] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, opts); io.observe(el); return () => io.disconnect() }, [])
  return [ref, inView]
}

export function Carousel({ children, className, itemClass = 'w-[300px] sm:w-[360px]' }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' })
  return (
    <div className={cn('relative', className)}>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:px-1">
        {React.Children.map(children, (c) => <div className={cn('shrink-0 snap-start', itemClass)}>{c}</div>)}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} className="rounded-full border border-ink/15 bg-white p-2 text-ink hover:bg-ink/5" aria-label="Previous slide"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={() => scroll(1)} className="rounded-full border border-ink/15 bg-white p-2 text-ink hover:bg-ink/5" aria-label="Next slide"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  )
}

export function FAQ({ items = FAQS, className }) {
  const [open, setOpen] = useState(0)
  return (
    <div className={cn('divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white', className)}>
      {items.map((f, i) => (
        <div key={f.q}>
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"><span className="font-semibold text-ink">{f.q}</span><ChevronDown className={cn('h-5 w-5 shrink-0 text-ink/50 transition-transform', open === i && 'rotate-180')} /></button>
          {open === i && <div className="px-5 pb-5 text-sm leading-relaxed text-ink/70">{f.a}</div>}
        </div>
      ))}
    </div>
  )
}

export function PricingCards({ compact }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {PRICING.map((p) => (
        <div key={p.id} className={cn('relative rounded-3xl border p-7', p.popular ? 'border-brand-600 bg-white shadow-float' : 'border-ink/10 bg-white shadow-card')}>
          {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most popular</span>}
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60">{p.name}</p>
          <div className="mt-3 flex items-end gap-2"><span className="text-sm text-ink/60">from</span><span className="font-display text-5xl font-black text-ink">${p.from}</span><span className="pb-1.5 text-sm text-ink/60">per session</span></div>
          <p className="mt-1 text-sm font-medium text-brand-600">~${p.mo}/mo</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{p.desc}</p>
          <ul className="mt-5 space-y-2.5">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink"><span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3 w-3 text-emerald-700" /></span>{f}</li>)}</ul>
          {!compact && <Link to={p.href} className={cn('btn btn-md mt-7 w-full', p.popular ? 'btn-primary' : 'btn-outline')}>{p.cta}</Link>}
        </div>
      ))}
    </div>
  )
}

export function Promise() {
  return (
    <div className="mt-8 rounded-3xl border border-sun-400/40 bg-sun-400/10 p-7">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sun-600"><Sparkles className="h-4 w-4" /> Our promise to you</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {['First lesson satisfaction guarantee — full refund if not happy', 'No long-term contracts — pause or cancel anytime', "Free replacement teacher if the match isn't right"].map((t) => <li key={t} className="flex items-start gap-2 text-sm font-medium text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sun-600" />{t}</li>)}
      </ul>
    </div>
  )
}
