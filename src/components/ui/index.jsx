import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, Check, AlertTriangle, Info, Star, ChevronDown, Loader2 } from 'lucide-react'
import { cn, initials, avatarColor, statusTone, cap } from '../../lib/utils.js'
import { useUI } from '../../lib/store.js'

const BASE = import.meta.env.BASE_URL
export const asset = (p) => (p?.startsWith('data:') || p?.startsWith('http') ? p : `${BASE}images/${p}`)

// ---------------- Buttons ----------------
export function Button({ as, to, href, variant = 'primary', size = 'md', className, children, loading, app = false, ...props }) {
  const cls = app
    ? cn('app-btn', size === 'sm' ? 'app-btn-sm' : 'app-btn-md', { primary: 'app-btn-primary', outline: 'app-btn-outline', ghost: 'app-btn-ghost', danger: 'app-btn-danger', sun: 'app-btn-sun', success: 'bg-emerald-600 text-white hover:bg-emerald-700' }[variant], className)
    : cn('btn', size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md', { primary: 'btn-primary', ink: 'btn-ink', sun: 'btn-sun', outline: 'btn-outline', ghost: 'btn-ghost', light: 'btn-light' }[variant], className)
  const content = <>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}</>
  if (to) return <Link to={to} className={cls} {...props}>{content}</Link>
  if (href) return <a href={href} className={cls} {...props}>{content}</a>
  const Comp = as || 'button'
  return <Comp type={Comp === 'button' ? props.type || 'button' : undefined} className={cls} disabled={loading || props.disabled} {...props}>{content}</Comp>
}

// ---------------- Layout bits ----------------
export const Card = ({ className, children, app, ...p }) => <div className={cn(app ? 'app-card' : 'card', className)} {...p}>{children}</div>
export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 pb-3', className)}>
    <div><h3 className="text-base font-semibold text-ink">{title}</h3>{subtitle && <p className="mt-0.5 text-sm text-ink/60">{subtitle}</p>}</div>
    {action}
  </div>
)
export const CardBody = ({ className, children }) => <div className={cn('px-5 pb-5', className)}>{children}</div>

export function Badge({ children, tone, status, className }) {
  const t = status ? statusTone(status) : tone || 'bg-ink/5 text-ink/70'
  return <span className={cn('badge', t, className)}>{children ?? cap(status)}</span>
}

export function Avatar({ src, name = '', size = 'md', className, ring }) {
  const sz = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-24 w-24 text-2xl', '2xl': 'h-32 w-32 text-3xl' }[size]
  if (src) return <img src={asset(src)} alt={name} className={cn('shrink-0 rounded-full object-cover', sz, ring && 'ring-2 ring-white shadow', className)} />
  return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sz, avatarColor(name), className)}>{initials(name)}</span>
}

export const Stars = ({ value = 5, size = 'h-3.5 w-3.5', className }) => (
  <span className={cn('inline-flex items-center gap-0.5', className)}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn(size, i <= Math.round(value) ? 'fill-sun-400 text-sun-400' : 'fill-ink/10 text-ink/10')} />)}</span>
)

export const Progress = ({ value = 0, className, tone = 'bg-brand-600' }) => (
  <div className={cn('h-2 w-full overflow-hidden rounded-full bg-ink/8', className)}><div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
)

export function EmptyState({ icon: Icon, title, desc, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink/5"><Icon className="h-6 w-6 text-ink/50" /></div>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-ink/60">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StatCard({ title, value, desc, icon: Icon, tone = 'default', className }) {
  const tones = { default: 'bg-white', green: 'bg-emerald-50/60 border-emerald-100', blue: 'bg-brand-50/60 border-brand-100', sky: 'bg-sky-400/10 border-sky-400/20', red: 'bg-coral-500/8 border-coral-500/20', sun: 'bg-sun-400/10 border-sun-400/30', violet: 'bg-violet-50 border-violet-100' }
  const iconTones = { default: 'bg-ink/5 text-ink/70', green: 'bg-emerald-100 text-emerald-700', blue: 'bg-brand-100 text-brand-700', sky: 'bg-sky-400/20 text-sky-500', red: 'bg-coral-500/15 text-coral-600', sun: 'bg-sun-400/25 text-sun-600', violet: 'bg-violet-100 text-violet-600' }
  const valueTones = { default: 'text-ink', green: 'text-emerald-700', blue: 'text-brand-700', sky: 'text-sky-500', red: 'text-coral-600', sun: 'text-sun-600', violet: 'text-violet-700' }
  return (
    <div className={cn('rounded-xl border border-ink/8 p-5', tones[tone], className)}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">{title}</p>
        {Icon && <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconTones[tone])}><Icon className="h-4 w-4" /></span>}
      </div>
      <p className={cn('mt-1 text-3xl font-bold tracking-tight', valueTones[tone])}>{value}</p>
      {desc && <p className="mt-2 text-xs text-ink/60">{desc}</p>}
    </div>
  )
}

export function PageHeader({ icon: Icon, title, subtitle, actions, tone = 'bg-brand-50 text-brand-600', className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-4">
        {Icon && <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', tone)}><Icon className="h-6 w-6" /></span>}
        <div><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>{subtitle && <p className="mt-0.5 text-sm text-ink/60">{subtitle}</p>}</div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ---------------- Forms ----------------
export const Input = React.forwardRef(function Input({ className, app, label, hint, error, ...p }, ref) {
  const el = <input ref={ref} className={cn(app ? 'app-input' : 'input', error && 'border-coral-500', className)} {...p} />
  if (!label && !hint && !error) return el
  return <label className="block">{label && <span className="label">{label}{p.required && <span className="text-coral-500"> *</span>}</span>}{el}{error ? <span className="mt-1 block text-xs text-coral-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-ink/50">{hint}</span> : null}</label>
})
export const Textarea = ({ className, app, label, rows = 3, ...p }) => { const el = <textarea rows={rows} className={cn(app ? 'app-input' : 'input', 'min-h-[80px]', className)} {...p} />; return label ? <label className="block"><span className="label">{label}{p.required && <span className="text-coral-500"> *</span>}</span>{el}</label> : el }
export const Select = ({ className, app, label, children, ...p }) => { const el = <span className="relative block"><select className={cn(app ? 'app-input' : 'input', 'appearance-none pr-9', className)} {...p}>{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" /></span>; return label ? <label className="block"><span className="label">{label}{p.required && <span className="text-coral-500"> *</span>}</span>{el}</label> : el }
export const Switch = ({ checked, onChange, label, desc }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
    <span>{label && <span className="block text-sm font-medium text-ink">{label}</span>}{desc && <span className="block text-xs text-ink/60">{desc}</span>}</span>
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-ink/20')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'left-0.5 translate-x-5' : 'left-0.5')} /></button>
  </label>
)

// ---------------- Tabs ----------------
export function Tabs({ tabs, value, onChange, className, pill }) {
  return (
    <div className={cn(pill ? 'flex flex-wrap gap-2' : 'tabs flex-wrap', className)}>
      {tabs.map((t) => (
        <button key={t.value} type="button" onClick={() => onChange(t.value)} className={pill ? cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors', value === t.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 bg-white text-ink hover:bg-ink/5') : cn('tab inline-flex items-center gap-2', value === t.value && 'tab-active')}>
          {t.icon && <t.icon className="h-4 w-4" />}{t.label}{t.count != null && <span className={cn('ml-1 rounded-full px-1.5 text-[11px]', value === t.value && !pill ? 'bg-brand-600 text-white' : 'bg-ink/10 text-ink/70')}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ---------------- Dialog ----------------
export function Dialog({ open, onClose, title, desc, children, size = 'md', footer, hideClose }) {
  useEffect(() => { if (!open) return; const onKey = (e) => e.key === 'Escape' && onClose?.(); document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' } }, [open, onClose])
  if (!open) return null
  const w = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-[fadeIn_.2s]" onClick={onClose} />
      <div className={cn('relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-float sm:rounded-2xl animate-fade-up', w)}>
        {!hideClose && <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Close"><X className="h-5 w-5" /></button>}
        {title && <h2 className="pr-8 text-xl font-bold text-ink">{title}</h2>}
        {desc && <p className="mt-1 text-sm text-ink/60">{desc}</p>}
        <div className={cn(title && 'mt-5')}>{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>, document.body)
}

export function Confirm({ open, onClose, onConfirm, title = 'Are you sure?', desc, confirmText = 'Confirm', danger }) {
  return <Dialog open={open} onClose={onClose} title={title} desc={desc} size="sm" footer={<><Button app variant="outline" onClick={onClose}>Cancel</Button><Button app variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>{confirmText}</Button></>} />
}

// ---------------- Toaster ----------------
export function Toaster() {
  const toasts = useUI((s) => s.toasts); const dismiss = useUI((s) => s.dismissToast)
  const icons = { success: Check, error: AlertTriangle, warning: AlertTriangle, info: Info }
  const tones = { success: 'bg-emerald-600', error: 'bg-coral-600', warning: 'bg-sun-600', info: 'bg-ink' }
  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => { const I = icons[t.type] || Info; return (
        <div key={t.id} className={cn('pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-white shadow-float animate-fade-up', tones[t.type] || tones.info)}>
          <I className="mt-0.5 h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{t.title}</p>{t.desc && <p className="text-xs text-white/80">{t.desc}</p>}</div>
          <button type="button" onClick={() => dismiss(t.id)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
        </div>) })}
    </div>, document.body)
}

// ---------------- Misc ----------------
export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-md bg-ink/8', className)} />
export const Divider = ({ className }) => <hr className={cn('border-ink/8', className)} />
export function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false); const ref = useRef(null)
  useEffect(() => { if (!open) return; const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc) }, [open])
  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && <div className={cn('absolute z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-ink/10 bg-white p-1.5 shadow-float animate-fade-up', align === 'right' ? 'right-0' : 'left-0')} onClick={() => setOpen(false)}>{children}</div>}
    </div>
  )
}
export const MenuItem = ({ icon: Icon, children, className, ...p }) => <button type="button" className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-ink/5', className)} {...p}>{Icon && <Icon className="h-4 w-4 text-ink/60" />}{children}</button>
export const Kbd = ({ children }) => <kbd className="rounded border border-ink/15 bg-ink/5 px-1.5 py-0.5 text-[10px] font-medium text-ink/70">{children}</kbd>
export function SectionHeading({ eyebrow, title, desc, action, align = 'left', className, light }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className={cn('eyebrow mb-3', light && 'text-sun-400')}>{eyebrow}</p>}
        <h2 className={cn('section-title', light && 'text-white')}>{title}</h2>
        {desc && <p className={cn('mt-4 text-base text-ink/70 sm:text-lg', light && 'text-white/75')}>{desc}</p>}
      </div>
      {action}
    </div>
  )
}
