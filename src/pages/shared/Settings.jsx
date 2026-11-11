import React, { useState } from 'react'
import { useStore, useMe, toast } from '../../lib/store.js'
import { subjectById } from '../../lib/data.js'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, Input } from '../../components/ui/index.jsx'

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
    </div>
  )
}
