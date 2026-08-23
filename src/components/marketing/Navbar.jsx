import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, ChevronDown, Menu, X, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react'
import { CATEGORIES } from '../../lib/data.js'
import { useStore, useUI, useCurrentUser } from '../../lib/store.js'
import { Avatar, Button, Dropdown, MenuItem, asset } from '../ui/index.jsx'
import { cn } from '../../lib/utils.js'

const EMPTY = []

export const dashboardPath = (user) => (user?.role === 'teacher' ? '/teacher/dashboard' : user?.role === 'student' ? '/student/dashboard' : user?.role === 'admin' ? '/admin/inbox' : '/parent/dashboard')

export default function Navbar() {
  const user = useCurrentUser()
  const cart = useStore((s) => (s.currentUserId ? s.carts[s.currentUserId] || EMPTY : EMPTY))
  const openAuth = useUI((s) => s.openAuth)
  const signOut = useStore((s) => s.signOut)
  const [mobile, setMobile] = useState(false)
  const nav = useNavigate()
  const links = [{ to: '/how-it-works', label: 'How It Works' }, { to: '/become-teacher', label: 'Become Teacher' }, { to: '/results', label: 'Success Stories' }]
  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobile(false)}>
          <img src={asset('logo-sm.png')} alt="Bright Academy" className="h-11 w-auto lg:h-12" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Dropdown align="left" trigger={<button type="button" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5 hover:text-ink">Programs <ChevronDown className="h-4 w-4" /></button>}>
            <div className="w-[360px] p-2">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">Islamic learning tracks</p>
              {CATEGORIES.map((c) => (
                <Link key={c.id} to={`/courses?category=${c.slug}`} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-ink/5">
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg', c.color)}>{c.emoji}</span>
                  <span><span className="block text-sm font-semibold text-ink">{c.name}</span><span className="block text-xs text-ink/60">{c.tagline}</span></span>
                </Link>
              ))}
              <Link to="/courses" className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"><Sparkles className="h-4 w-4" /> Browse all programs</Link>
            </div>
          </Dropdown>
          {links.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5', isActive ? 'text-brand-700' : 'text-ink/80 hover:text-ink')}>{l.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-sun-500 px-1 text-[10px] font-bold text-white">{cart.length}</span>}
          </Link>
          {user ? (
            <Dropdown trigger={<button type="button" className="flex items-center gap-2 rounded-full border border-ink/10 py-1 pl-1 pr-3 hover:bg-ink/5"><Avatar src={user.avatar} name={user.name} size="sm" /><span className="hidden text-sm font-medium sm:block">{user.firstName}</span><ChevronDown className="h-4 w-4 text-ink/50" /></button>}>
              <div className="px-3 py-2"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-ink/60">{user.email}</p></div>
              <MenuItem icon={LayoutDashboard} onClick={() => nav(dashboardPath(user))}>Go to dashboard</MenuItem>
              <MenuItem icon={Settings} onClick={() => nav('/settings')}>Settings</MenuItem>
              <MenuItem icon={LogOut} onClick={() => { signOut(); nav('/') }}>Sign out</MenuItem>
            </Dropdown>
          ) : (
            <>
              <button type="button" onClick={() => openAuth('signin')} className="hidden rounded-lg px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5 hover:text-ink sm:block">Sign In</button>
              <button type="button" onClick={() => openAuth('signup')} className="rounded-lg bg-gradient-to-r from-brand-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.03]">Sign Up</button>
            </>
          )}
          <button type="button" className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 lg:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">{mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {mobile && (
        <div className="border-t border-ink/5 bg-white lg:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            <Link to="/courses" onClick={() => setMobile(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5">All Programs</Link>
            {CATEGORIES.map((c) => <Link key={c.id} to={`/courses?category=${c.slug}`} onClick={() => setMobile(false)} className="rounded-lg px-3 py-2 pl-6 text-sm text-ink/70 hover:bg-ink/5">{c.emoji} {c.name}</Link>)}
            {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setMobile(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5">{l.label}</Link>)}
            <Link to="/instructors" onClick={() => setMobile(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5">Our Teachers</Link>
            {!user && <div className="flex gap-2 p-2"><Button variant="outline" size="sm" onClick={() => { setMobile(false); openAuth('signin') }}>Sign In</Button><Button size="sm" onClick={() => { setMobile(false); openAuth('signup') }}>Sign Up</Button></div>}
          </div>
        </div>
      )}
    </header>
  )
}
