import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Inbox, LayoutDashboard, Mail, GraduationCap, FileText, Film, CalendarDays, ClipboardList, CalendarClock, CalendarCheck, CalendarX, BookOpen, NotebookPen, Users, UsersRound, BadgeCheck, TrendingUp, Wallet, MessageSquare, LifeBuoy, Settings, Bell, LogOut, PanelLeft, ChevronsUpDown, Heart, ShoppingCart, ListChecks, Award, CreditCard, BarChart3, School, X, Sparkles } from 'lucide-react'
import { useStore, useUI, useCurrentUser, unreadCount, unreadNotifications, EMPTY } from '../../lib/store.js'
import { Avatar, Badge, Dropdown, MenuItem, asset } from '../ui/index.jsx'
import { cn, fmtRelative } from '../../lib/utils.js'

const NAV = {
  admin: [
    { group: 'Main', items: [{ t: 'Inbox', to: '/admin/inbox', icon: Inbox, badge: 'inbox' }] },
    { group: 'Other', items: [{ t: 'Help Center', to: '/help-center', icon: LifeBuoy }, { t: 'Settings', to: '/settings', icon: Settings }] },
  ],
  teacher: [
    { group: 'Main', items: [{ t: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard }, { t: 'Messages', to: '/teacher/messages', icon: Mail, badge: 'messages' }] },
    { group: 'Courses', items: [{ t: 'My Courses', to: '/teacher/courses', icon: GraduationCap }, { t: 'Course Proposals', to: '/teacher/course-proposals', icon: FileText }, { t: 'Recordings', to: '/teacher/recordings', icon: Film }] },
    { group: 'Schedule', items: [{ t: 'Sessions', to: '/teacher/sessions', icon: CalendarDays }, { t: 'Trial Assessments', to: '/teacher/trial-assessments', icon: ClipboardList, badge: 'trials' }, { t: 'Schedule', to: '/teacher/schedule', icon: CalendarClock }, { t: 'Availability', to: '/teacher/availability', icon: CalendarCheck }, { t: 'Reschedule Requests', to: '/teacher/reschedule-requests', icon: CalendarX, badge: 'reschedule' }] },
    { group: 'Teaching', items: [{ t: 'Lessons', to: '/teacher/lessons', icon: BookOpen }, { t: 'Homework', to: '/teacher/homework', icon: NotebookPen, badge: 'homework' }, { t: 'Students', to: '/teacher/students', icon: Users }, { t: 'Groups', to: '/teacher/groups', icon: UsersRound }] },
    { group: 'Other', items: [{ t: 'Approval Requests', to: '/teacher/approval-requests', icon: BadgeCheck, badge: 'approvals' }, { t: 'Performance', to: '/teacher/performance', icon: TrendingUp }, { t: 'Earnings & Wallet', to: '/teacher/finances', icon: Wallet }, { t: 'Feedback', to: '/teacher/feedback', icon: MessageSquare }, { t: 'Help Center', to: '/help-center', icon: LifeBuoy }, { t: 'Settings', to: '/settings', icon: Settings }] },
  ],
  parent: [
    { group: 'Main', items: [{ t: 'Dashboard', to: '/parent/dashboard', icon: LayoutDashboard }, { t: 'Children', to: '/parent/children', icon: Users }, { t: 'Enrolled Courses', to: '/parent/enrolled-courses', icon: GraduationCap }, { t: 'Wishlist', to: '/parent/wishlist', icon: Heart }, { t: 'Cart', to: '/cart', icon: ShoppingCart }, { t: 'Schedule', to: '/parent/schedule', icon: CalendarClock }, { t: 'Free Trials', to: '/parent/trials', icon: Sparkles }] },
    { group: 'Activity', items: [{ t: 'Attendance', to: '/parent/attendance', icon: ListChecks }, { t: 'Progress', to: '/parent/progress', icon: BarChart3 }, { t: 'Recordings', to: '/parent/recordings', icon: Film }, { t: 'Homework', to: '/parent/homework', icon: NotebookPen }, { t: 'Certificates', to: '/parent/certificates', icon: Award }, { t: 'Feedback', to: '/parent/feedback', icon: MessageSquare }, { t: 'Payments', to: '/parent/payments', icon: CreditCard }, { t: 'Messages', to: '/parent/messages', icon: Mail, badge: 'messages' }] },
    { group: 'Other', items: [{ t: 'Help Center', to: '/help-center', icon: LifeBuoy }, { t: 'Settings', to: '/settings', icon: Settings }] },
  ],
  student: [
    { group: 'Main', items: [{ t: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard }, { t: 'Sessions', to: '/student/sessions', icon: CalendarDays }, { t: 'Recordings', to: '/student/recordings', icon: Film }, { t: 'Schedule', to: '/student/schedule', icon: CalendarClock }] },
    { group: 'Learning', items: [{ t: 'My Courses', to: '/student/my-courses', icon: GraduationCap }, { t: 'Attendance', to: '/student/attendance', icon: ListChecks }, { t: 'Homework', to: '/student/homework', icon: NotebookPen, badge: 'homework' }, { t: 'My Teachers', to: '/student/my-teachers', icon: School }, { t: 'Feedback', to: '/student/feedback', icon: MessageSquare }, { t: 'Progress', to: '/student/progress', icon: BarChart3 }, { t: 'Certificates', to: '/student/certificates', icon: Award }, { t: 'Messages', to: '/student/messages', icon: Mail, badge: 'messages' }] },
    { group: 'Account', items: [{ t: 'Help Center', to: '/help-center', icon: LifeBuoy }, { t: 'Settings', to: '/settings', icon: Settings }] },
  ],
}

function useBadges(user) {
  return useStore((s) => {
    if (!user) return EMPTY
    const msgs = unreadCount(s, user.id)
    if (user.role === 'teacher') {
      const trials = s.trials.filter((t) => t.teacherId === user.teacherId && t.status === 'completed' && !t.assessment).length
      const hw = s.homework.filter((h) => h.teacherId === user.teacherId && h.status === 'submitted').length
      const rr = s.rescheduleRequests.filter((r) => r.teacherId === user.teacherId && r.status === 'pending').length
      const ap = s.approvalRequests.filter((a) => a.teacherId === user.teacherId && a.status === 'pending').length
      return JSON.stringify({ messages: msgs, trials, homework: hw, reschedule: rr, approvals: ap })
    }
    if (user.role === 'student') return JSON.stringify({ messages: msgs, homework: s.homework.filter((h) => h.studentId === user.id && (h.status === 'assigned' || h.status === 'revision')).length })
    if (user.role === 'admin') { const unh = (arr) => (arr || []).filter((x) => !x.handled).length; return JSON.stringify({ messages: msgs, inbox: unh(s.leads) + unh(s.applications) + unh(s.customPlanRequests) }) }
    return JSON.stringify({ messages: msgs })
  })
}

function NotificationsBell({ user }) {
  const count = useStore((s) => unreadNotifications(s, user.id))
  const notifications = useStore((s) => s.notifications)
  const markAll = useStore((s) => s.markNotificationsRead)
  const mine = notifications.filter((n) => n.userId === user.id).slice(0, 12)
  return (
    <Dropdown trigger={<button type="button" className="relative rounded-lg p-2 text-ink/60 hover:bg-ink/5 hover:text-ink" aria-label="Notifications"><Bell className="h-5 w-5" />{count > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>}</button>}>
      <div className="w-[340px]">
        <div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-bold">Notifications</p><button type="button" className="text-xs font-medium text-brand-600 hover:underline" onClick={(e) => { e.stopPropagation(); markAll(user.id) }}>Mark all read</button></div>
        <div className="max-h-[360px] overflow-y-auto thin-scroll">
          {mine.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink/50">No notifications yet</p>}
          {mine.map((n) => <div key={n.id} className={cn('border-t border-ink/5 px-3 py-2.5', !n.read && 'bg-brand-50/50')}><p className="text-sm font-semibold text-ink">{n.title}</p><p className="text-xs text-ink/60">{n.body}</p><p className="mt-0.5 text-[11px] text-ink/40">{fmtRelative(n.at)}</p></div>)}
        </div>
      </div>
    </Dropdown>
  )
}

export default function AppShell({ role }) {
  const user = useCurrentUser()
  const signOut = useStore((s) => s.signOut)
  const openAuth = useUI((s) => s.openAuth)
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const badgesJson = useBadges(user)
  const cloud = useStore((s) => s.cloud)
  const cloudReady = useStore((s) => s.cloudReady)
  if (cloud && !cloudReady) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-paper">
      <img src={asset('logo-mark-t.png')} alt="" className="h-14 w-14 animate-pulse object-contain" />
      <p className="text-sm text-ink/60">Connecting to Bright Academy cloud…</p>
    </div>
  )
  if (!user) return <Navigate to="/" replace state={{ authFor: loc.pathname }} />
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  const badges = badgesJson === EMPTY ? {} : JSON.parse(badgesJson)
  const nav_ = NAV[user.role] || NAV.parent
  const Side = (
    <aside className="flex h-full w-64 flex-col rounded-2xl border border-ink/8 bg-white shadow-card">
      <Link to="/" className="flex items-center gap-2.5 border-b border-ink/5 px-4 py-3.5">
        <img src={asset('logo-mark-t.png')} alt="" className="h-9 w-9 object-contain" />
        <span><span className="block font-display text-lg font-black leading-tight text-brand-700">Bright Academy</span><span className="block text-[11px] font-medium capitalize text-ink/50">{user.role} portal</span></span>
      </Link>
      <nav className="flex-1 space-y-4 overflow-y-auto thin-scroll p-3">
        {nav_.map((g) => (
          <div key={g.group}>
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/40">{g.group}</p>
            <div className="space-y-0.5">{g.items.map((it) => (
              <NavLink key={it.to} to={it.to} onClick={() => setOpen(false)} className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}>
                <it.icon className="h-4 w-4 shrink-0" /><span className="flex-1">{it.t}</span>
                {it.badge && badges[it.badge] > 0 && <span className="flex min-w-[20px] items-center justify-center rounded-full bg-brand-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white [.nav-item-active_&]:bg-white [.nav-item-active_&]:text-brand-700">{badges[it.badge]}</span>}
              </NavLink>
            ))}</div>
          </div>
        ))}
      </nav>
      <div className="border-t border-ink/5 p-3">
        <Dropdown align="left" trigger={<button type="button" className="flex w-full items-center gap-2.5 rounded-xl p-2 hover:bg-ink/5"><Avatar src={user.avatar} name={user.name} size="sm" /><span className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-semibold text-ink">{user.name}</span><span className="block truncate text-[11px] text-ink/50">{user.email}</span></span><ChevronsUpDown className="h-4 w-4 text-ink/40" /></button>}>
          <MenuItem icon={Settings} onClick={() => nav('/settings')}>Settings</MenuItem>
          <MenuItem icon={LogOut} onClick={() => { signOut(); nav('/') }}>Sign out</MenuItem>
        </Dropdown>
      </div>
    </aside>
  )
  return (
    <div className="min-h-svh bg-paper">
      <div className="mx-auto flex max-w-[1500px] gap-4 p-3 sm:p-4">
        <div className="sticky top-4 hidden h-[calc(100svh-2rem)] lg:block">{Side}</div>
        {open && <div className="fixed inset-0 z-50 flex lg:hidden"><div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} /><div className="relative z-10 h-full p-3">{Side}</div></div>}
        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white px-3 py-2 shadow-card">
            <div className="flex items-center gap-1">
              <button type="button" className="rounded-lg p-2 text-ink/60 hover:bg-ink/5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar"><PanelLeft className="h-5 w-5" /></button>
              <p className="hidden px-2 text-sm text-ink/50 sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationsBell user={user} />
              <Link to="/settings"><Avatar src={user.avatar} name={user.name} size="sm" /></Link>
            </div>
          </header>
          <main className="pb-10"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}
