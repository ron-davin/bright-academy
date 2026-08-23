import React, { useRef, useState } from 'react'
import { User, Briefcase, GraduationCap, Video, Bell, Camera, LifeBuoy, RefreshCw, KeyRound, Trash2 } from 'lucide-react'
import { useStore, useCurrentUser, toast } from '../../lib/store.js'
import { Avatar, Button, Card, CardBody, CardHeader, Input, PageHeader, Select, Switch, Textarea, Confirm } from '../../components/ui/index.jsx'
import { FAQ } from '../../components/marketing/Sections.jsx'
import { HELP_ARTICLES, TEACHERS } from '../../lib/data.js'
import { cn, TIMEZONES, tzOffsetLabel } from '../../lib/utils.js'

export function SettingsPage() {
  const user = useCurrentUser()
  const { updateUser, changePassword, resetDemo } = useStore()
  const [tab, setTab] = useState('profile')
  const [f, setF] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', timezone: user.timezone, bio: user.bio || '' })
  const [pw, setPw] = useState({ current: '', next: '' })
  const [notif, setNotif] = useState(user.notifPrefs || { reminders: true, homework: true, progress: true, joins: true })
  const [resetOpen, setResetOpen] = useState(false)
  const fileRef = useRef(null)
  const isTeacher = user.role === 'teacher'
  const tabs = [['profile', 'Profile', User], ...(isTeacher ? [['experience', 'Experience', Briefcase], ['education', 'Education', GraduationCap], ['videos', 'Sample videos', Video]] : []), ['notifications', 'Notifications', Bell], ['account', 'Account', KeyRound]]
  const tProfile = isTeacher ? TEACHERS.find((t) => t.id === user.teacherId) : null
  const saveProfile = () => { updateUser(user.id, { ...f }); toast({ title: 'Profile updated!', type: 'success' }) }
  const onAvatar = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast({ title: 'Max 5MB', type: 'warning' })
    const img = new Image(); const url = URL.createObjectURL(file)
    img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(img.width, img.height, 300); c.width = c.height = s; const ctx = c.getContext('2d'); const m = Math.min(img.width, img.height); ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); updateUser(user.id, { avatar: c.toDataURL('image/jpeg', 0.8) }); URL.revokeObjectURL(url); toast({ title: 'Photo updated', type: 'success' }) }
    img.src = url
  }
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account settings and preferences." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">{tabs.map(([v, l, I]) => <button key={v} type="button" onClick={() => setTab(v)} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium', tab === v ? 'bg-ink/6 text-ink' : 'text-ink/60 hover:bg-ink/4')}><I className="h-4 w-4" /> {l}</button>)}</div>
        <div className="space-y-4">
          {tab === 'profile' && (
            <Card app><CardHeader title="Profile" subtitle="This is how others will see you on the platform." /><CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative"><Avatar src={user.avatar} name={user.name} size="xl" /><button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-2 text-white shadow hover:bg-brand-700" aria-label="Change photo"><Camera className="h-3.5 w-3.5" /></button><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatar} /></div>
                <div><p className="font-bold">{user.name}</p><p className="flex gap-1.5 pt-1"><span className="badge bg-brand-600 text-white capitalize">{user.role}</span><span className="badge bg-emerald-100 text-emerald-700">Active</span></p><p className="mt-1 text-xs text-ink/50">Avatar: JPG, PNG, WEBP up to 5MB</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2"><Input app label="First Name" value={f.firstName} onChange={(e) => setF((x) => ({ ...x, firstName: e.target.value }))} /><Input app label="Last Name" value={f.lastName} onChange={(e) => setF((x) => ({ ...x, lastName: e.target.value }))} /></div>
              <Input app label="Email" value={user.email} disabled hint="Your account email address." />
              <div className="grid gap-4 sm:grid-cols-2"><Input app label="Phone" value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value }))} />
                <Select app label="Timezone" value={f.timezone} onChange={(e) => setF((x) => ({ ...x, timezone: e.target.value }))}>{[f.timezone, ...TIMEZONES.filter((t) => t !== f.timezone)].map((t) => <option key={t} value={t}>{tzOffsetLabel(t)} - {t}</option>)}</Select></div>
              {isTeacher && <Textarea app label="Bio (shown on your public profile)" rows={4} value={f.bio} onChange={(e) => setF((x) => ({ ...x, bio: e.target.value }))} placeholder={tProfile?.bio?.slice(0, 120)} />}
              <div className="flex justify-end"><Button app onClick={saveProfile}>Save changes</Button></div>
            </CardBody></Card>
          )}
          {tab === 'experience' && tProfile && (
            <Card app><CardHeader title="Experience" subtitle="Shown to parents on your public profile." /><CardBody className="space-y-3">
              <p className="rounded-xl bg-ink/4 p-4 text-sm leading-relaxed">{tProfile.experience}</p>
              <p className="text-xs text-ink/50">Editing teacher credentials requires admin review in production — this demo shows your seeded profile.</p>
            </CardBody></Card>
          )}
          {tab === 'education' && tProfile && (
            <Card app><CardHeader title="Education & Certifications" /><CardBody className="space-y-3">
              {[...tProfile.education.map((e) => ({ ...e, name: e.degree, org: e.school })), ...tProfile.certifications].map((e) => <p key={e.name} className="rounded-xl border border-ink/8 p-3.5 text-sm"><b>{e.name}</b><span className="block text-ink/60">{e.org} · {e.year}</span></p>)}
            </CardBody></Card>
          )}
          {tab === 'videos' && tProfile && (
            <Card app><CardHeader title="Sample lessons" subtitle="Short videos parents can watch before booking." /><CardBody className="grid gap-3 sm:grid-cols-2">
              {tProfile.sampleLessons.map((s) => <div key={s} className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-ink/15 p-4 text-center text-sm text-ink/60"><Video className="mb-2 h-6 w-6 text-ink/40" />{s}</div>)}
            </CardBody></Card>
          )}
          {tab === 'notifications' && (
            <Card app><CardHeader title="Notifications" subtitle="Choose what you want to hear about." /><CardBody className="divide-y divide-ink/5">
              <Switch label="Session readiness alerts" desc="Stay prepared with a reminder before every class." checked={notif.reminders} onChange={(v) => setNotif((x) => ({ ...x, reminders: v }))} />
              <Switch label="Homework alerts" desc="See new submissions and grading updates as they arrive." checked={notif.homework} onChange={(v) => setNotif((x) => ({ ...x, homework: v }))} />
              <Switch label="Progress milestones" desc="Hear about wins in real time." checked={notif.progress} onChange={(v) => setNotif((x) => ({ ...x, progress: v }))} />
              <Switch label="Student join notifications" desc="Know the moment your students enter the classroom." checked={notif.joins} onChange={(v) => setNotif((x) => ({ ...x, joins: v }))} />
              <div className="flex justify-end pt-4"><Button app onClick={() => { updateUser(user.id, { notifPrefs: notif }); toast({ title: 'Preferences saved', type: 'success' }) }}>Save preferences</Button></div>
              <p className="pt-3 text-xs text-ink/50">Browser/email push requires a backend — flagged in Services & Costs.</p>
            </CardBody></Card>
          )}
          {tab === 'account' && (
            <>
              <Card app><CardHeader title="Change password" /><CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2"><Input app type="password" label="Current password" value={pw.current} onChange={(e) => setPw((x) => ({ ...x, current: e.target.value }))} /><Input app type="password" label="New password" value={pw.next} onChange={(e) => setPw((x) => ({ ...x, next: e.target.value }))} /></div>
                <div className="flex justify-end"><Button app variant="outline" onClick={async () => { try { await changePassword(user.id, pw.current, pw.next); setPw({ current: '', next: '' }); toast({ title: 'Password changed', type: 'success' }) } catch (e) { toast({ title: e.message, type: 'error' }) } }}>Update password</Button></div>
              </CardBody></Card>
              <Card app className="border-coral-500/30"><CardHeader title="Demo data" subtitle="Everything lives in this browser's localStorage." /><CardBody>
                <Button app variant="danger" onClick={() => setResetOpen(true)}><RefreshCw className="h-4 w-4" /> Reset demo data</Button>
                <p className="mt-2 text-xs text-ink/50">Restores the original demo accounts, sessions and content. Your own accounts and changes are erased.</p>
              </CardBody></Card>
            </>
          )}
        </div>
      </div>
      <Confirm open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { resetDemo(); window.location.href = import.meta.env.BASE_URL }} title="Reset all demo data?" desc="This clears every change you made in this browser and re-seeds the demo." confirmText="Reset everything" danger />
    </div>
  )
}

export function HelpCenter() {
  return (
    <div>
      <PageHeader icon={LifeBuoy} title="Help Center" subtitle="Answers to common questions about classes, homework and billing." />
      <FAQ items={HELP_ARTICLES.map((a) => ({ q: a.q, a: a.a }))} />
      <p className="mt-4 text-sm text-ink/60">Need more help? <a className="font-semibold text-brand-700" href="mailto:hello@brightacademy.example">Email support</a> — we reply within one working day.</p>
    </div>
  )
}
