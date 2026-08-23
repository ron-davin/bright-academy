import { clsx } from 'clsx'
import { format, formatDistanceToNow, isSameDay, isToday, isTomorrow, parseISO, addDays, addMinutes, startOfWeek, differenceInMinutes } from 'date-fns'

export const cn = (...args) => clsx(...args)

export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`

export const slugify = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const money = (n, opts = {}) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: opts.cents ? 2 : 0, minimumFractionDigits: opts.cents ? 2 : 0 }).format(n)

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

export const shortName = (name = '') => { const p = name.trim().split(' '); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : name }

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const toDate = (d) => (d instanceof Date ? d : typeof d === 'string' ? parseISO(d) : new Date(d))

export const fmtTime = (d, tz) => {
  const date = toDate(d)
  try { return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz || undefined }) } catch { return format(date, 'h:mm a') }
}
export const fmtDate = (d, pattern = 'MMM d, yyyy') => format(toDate(d), pattern)
export const fmtDateTime = (d, tz) => `${format(toDate(d), 'EEE, MMM d')} · ${fmtTime(d, tz)}`
export const fmtDayLabel = (d) => { const date = toDate(d); if (isToday(date)) return 'Today'; if (isTomorrow(date)) return 'Tomorrow'; return format(date, 'EEE, MMM d') }
export const fmtRelative = (d) => formatDistanceToNow(toDate(d), { addSuffix: true })
export const minutesBetween = (a, b) => differenceInMinutes(toDate(b), toDate(a))
export { isSameDay, isToday, addDays, addMinutes, startOfWeek }

export const greeting = () => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening' }

// "HH:MM" 24h -> label "h:mm AM"
export const timeLabel = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, '0')} ${ampm}` }
export const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => { const h = Math.floor(i / 4); const m = (i % 4) * 15; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` })
export const addMinutesToHHMM = (hhmm, mins) => { const [h, m] = hhmm.split(':').map(Number); const t = h * 60 + m + mins; const hh = Math.floor(t / 60) % 24; return `${String(hh).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` }

export const TIMEZONES = [
  'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Toronto', 'America/Sao_Paulo',
  'Atlantic/Reykjavik', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Istanbul', 'Europe/Moscow', 'Africa/Cairo', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg',
  'Asia/Riyadh', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Tashkent', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Manila', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
]
export const tzOffsetLabel = (tz) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date())
    const off = parts.find((p) => p.type === 'timeZoneName')?.value || ''
    return off.replace('GMT', 'UTC')
  } catch { return '' }
}
export const detectTimezone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' } }

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export const statusTone = (status) => ({
  scheduled: 'bg-ink/5 text-ink/70', live: 'bg-emerald-100 text-emerald-700', completed: 'bg-ink/5 text-ink/70', cancelled: 'bg-coral-500/10 text-coral-600', missed: 'bg-coral-500/10 text-coral-600',
  pending: 'bg-sun-400/20 text-sun-600', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-coral-500/10 text-coral-600', 'auto-approved': 'bg-sun-400/25 text-sun-600',
  assigned: 'bg-sun-400/20 text-sun-600', submitted: 'bg-brand-100 text-brand-700', revision: 'bg-coral-500/10 text-coral-600', graded: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700', paused: 'bg-ink/5 text-ink/60', full: 'bg-sun-400/20 text-sun-600', open: 'bg-emerald-100 text-emerald-700', ready: 'bg-emerald-100 text-emerald-700', processing: 'bg-sun-400/20 text-sun-600',
}[status] || 'bg-ink/5 text-ink/70')

export const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

export async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch { return btoa(text) }
}

export const byDate = (key = 'start', dir = 1) => (a, b) => (toDate(a[key]) - toDate(b[key])) * dir

export const groupBy = (arr, fn) => arr.reduce((acc, x) => { const k = fn(x); (acc[k] ||= []).push(x); return acc }, {})

export const avatarColor = (seed = '') => { const colors = ['bg-brand-500', 'bg-sun-500', 'bg-coral-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500']; let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; return colors[h % colors.length] }

export const download = (filename, content, type = 'text/plain') => { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }

export const toCSV = (rows) => { if (!rows.length) return ''; const keys = Object.keys(rows[0]); return [keys.join(','), ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n') }
