import React, { useEffect, useState } from 'react'
import { Video, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStore, useMe, toast } from '../../lib/store.js'
import { subjectById } from '../../lib/data.js'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Input } from '../../components/ui/index.jsx'
import { zoomConfigured } from '../../lib/video.js'
import { cn } from '../../lib/utils.js'

function VideoSettings() {
  const video = useStore((s) => s.settings?.video) || 'zoom'
  const setSetting = useStore((s) => s.setSetting)
  const [ready, setReady] = useState(null)
  useEffect(() => { zoomConfigured().then(setReady) }, [])
  const options = [
    ['zoom', 'Zoom', 'Zoom’s video network inside the classroom page — reliable on any network. Free up to 10,000 minutes a month, then about $0.0035 a minute (billed by Zoom).'],
    ['builtin', 'Built-in (free)', 'Direct browser-to-browser video. Free, but may not connect on strict school, office or mobile networks.'],
  ]
  return (
    <div className="app-card mt-6 space-y-4 p-6">
      <h2 className="flex items-center gap-2 font-semibold text-ink"><Video className="h-5 w-5 text-brand-600" /> Video classroom</h2>
      <div className="space-y-2">{options.map(([v, t, d]) => (
        <label key={v} className={cn('flex cursor-pointer gap-3 rounded-xl border p-3', video === v ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:bg-gray-50')}>
          <input type="radio" name="video" checked={video === v} onChange={() => { setSetting('video', v); toast({ title: `Classes now use ${t.replace(' (free)', '')} video`, type: 'success' }) }} className="mt-1 h-4 w-4 accent-brand-600" />
          <span><span className="font-medium text-ink">{t}</span><span className="block text-sm text-gray-500">{d}</span></span>
        </label>))}</div>
      {ready === false && <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> Zoom isn’t connected yet, so classes use the built-in room for now. It switches on automatically once the Zoom keys are added to the server.</p>}
      {ready === true && <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Zoom is connected.</p>}
      <p className="text-xs text-gray-500">Every classroom also has a backup link, so a class can switch to the built-in room if Zoom ever has a problem.</p>
    </div>
  )
}

export default function Settings() {
  const me = useMe()
  const { updateProfile, changePassword } = useStore()
  const [f, setF] = useState({ name: me.name || '', phone: me.phone || '' })
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const saveProfile = async (e) => { e.preventDefault(); try { await updateProfile({ name: f.name.trim(), firstName: f.name.trim().split(' ')[0], phone: f.phone }); toast({ title: 'Profile saved', type: 'success' }) } catch (ex) { toast({ title: ex.message, type: 'error' }) } }
  const savePw = async (e) => {
    e.preventDefault()
    if (pw.next !== pw.confirm) return toast({ title: 'Passwords do not match', type: 'error' })
    setBusy(true)
    try { await changePassword(pw.next); setPw({ next: '', confirm: '' }); toast({ title: 'Password changed', type: 'success' }) } catch (ex) { toast({ title: ex.message, type: 'error' }) } finally { setBusy(false) }
  }
  return (
    <div className="max-w-2xl">
      <PageTitle title="Settings" />
      <form onSubmit={saveProfile} className="app-card space-y-4 p-6">
        <h2 className="font-semibold text-ink">Profile</h2>
        <Input app label="Name" value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} />
        <Input app label="Email (ask the admin to change)" value={me.email} disabled />
        <Input app label="Phone" value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value }))} />
        {me.role === 'teacher' && <p className="text-sm text-gray-500">Subjects: {(me.subjects || []).map((s) => subjectById(s).name).join(', ') || 'none set — ask the admin'}</p>}
        <div className="flex justify-end"><Button app type="submit">Save profile</Button></div>
      </form>
      <form onSubmit={savePw} className="app-card mt-6 space-y-4 p-6">
        <h2 className="font-semibold text-ink">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input app label="New password" type="password" autoComplete="new-password" minLength={8} required value={pw.next} onChange={(e) => setPw((x) => ({ ...x, next: e.target.value }))} />
          <Input app label="Repeat new password" type="password" autoComplete="new-password" minLength={8} required value={pw.confirm} onChange={(e) => setPw((x) => ({ ...x, confirm: e.target.value }))} />
        </div>
        <div className="flex justify-end"><Button app type="submit" loading={busy}>Change password</Button></div>
      </form>
      {me.role === 'admin' && <VideoSettings />}
    </div>
  )
}
