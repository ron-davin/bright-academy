import React from 'react'
import { Link, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutGrid, Users, Inbox, Settings, Sun, Clock, BookMarked, LogOut, GraduationCap, Shapes } from 'lucide-react'
import { useStore, useMe } from '../../lib/store.js'
import { Avatar, asset } from '../ui/index.jsx'
import { cn } from '../../lib/utils.js'

export const NAV = {
  admin: [
    { t: 'Schedule', to: '/admin/schedule', icon: CalendarDays },
    { t: 'Classes', to: '/admin/classes', icon: LayoutGrid },
    { t: 'Subjects', to: '/admin/subjects', icon: Shapes },
    { t: 'People', to: '/admin/people', icon: Users },
    { t: 'Requests', to: '/admin/requests', icon: Inbox, badge: 'requests' },
    { t: 'Settings', to: '/settings', icon: Settings },
  ],
  teacher: [
    { t: 'Today', to: '/teacher', icon: Sun, end: true },
    { t: 'Schedule', to: '/teacher/schedule', icon: CalendarDays },
    { t: 'Students', to: '/teacher/students', icon: GraduationCap },
    { t: 'Availability', to: '/teacher/availability', icon: Clock },
    { t: 'Settings', to: '/settings', icon: Settings },
  ],
  student: [
    { t: 'Today', to: '/student', icon: Sun, end: true },
    { t: 'Schedule', to: '/student/schedule', icon: CalendarDays },
    { t: 'My classes', to: '/student/classes', icon: BookMarked },
    { t: 'Settings', to: '/settings', icon: Settings },
  ],
}
export const homeFor = (role) => ({ admin: '/admin/schedule', teacher: '/teacher', student: '/student' }[role] || '/')

export function Loading({ text = 'Loading…' }) {
  return <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-white"><img src={asset('logo-mark-t.png')} alt="" className="h-12 w-12 animate-pulse object-contain" /><p className="text-sm text-gray-500">{text}</p></div>
}

export default function AppShell({ role }) {
  const me = useMe()
  const ready = useStore((s) => s.ready)
  const signOut = useStore((s) => s.signOut)
  const pendingRequests = useStore((s) => s.leads.filter((l) => !l.handled).length)
  const nav = useNavigate()
  const loc = useLocation()
  if (!ready) return <Loading />
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role && me.role !== role) return <Navigate to={homeFor(me.role)} replace />
  const items = NAV[me.role] || []
  const badge = (b) => (b === 'requests' ? pendingRequests : 0)
  const logout = async () => { await signOut(); nav('/') }
  return (
    <div className="min-h-svh bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <Link to={homeFor(me.role)} className="flex items-center gap-2.5 px-5 py-5">
          <img src={asset('logo-mark-t.png')} alt="" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-ink">Bright Academy</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}>
              <it.icon className="h-5 w-5" /><span className="flex-1">{it.t}</span>
              {badge(it.badge) > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">{badge(it.badge)}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar src={me.avatar} name={me.name} size="sm" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{me.name}</p><p className="truncate text-xs capitalize text-gray-500">{me.role}</p></div>
            <button type="button" onClick={logout} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink" aria-label="Log out" title="Log out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <Link to={homeFor(me.role)} className="flex items-center gap-2"><img src={asset('logo-mark-t.png')} alt="" className="h-8 w-8 object-contain" /><span className="font-bold text-ink">Bright Academy</span></Link>
        <button type="button" onClick={logout} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100"><LogOut className="h-4 w-4" /> Log out</button>
      </header>

      <main className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8"><Outlet /></div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-gray-200 bg-white lg:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => cn('relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', isActive ? 'text-brand-700' : 'text-gray-500')}>
            <it.icon className="h-5 w-5" />{it.t}
            {badge(it.badge) > 0 && <span className="absolute right-1/4 top-1.5 h-2 w-2 rounded-full bg-brand-600" />}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
