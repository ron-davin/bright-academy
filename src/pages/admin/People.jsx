import React, { useState } from 'react'
import { UserPlus, Search, Pencil, KeyRound, UserX, UserCheck, Clock, Copy, Users } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { SUBJECTS, subjectById } from '../../lib/data.js'
import { usePeople, AvailabilityEditor } from '../../components/app/common.jsx'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Avatar, Badge, Button, Dialog, EmptyState, Input, Textarea } from '../../components/ui/index.jsx'
import { cn } from '../../lib/utils.js'

export const genPassword = () => { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => c[n % c.length]).join('') }

function Credentials({ creds, onClose }) {
  const text = `Bright Academy login\nWebsite: ${window.location.origin}/login\nEmail: ${creds.email}\nPassword: ${creds.password}`
  return (
    <Dialog open onClose={onClose} title="Account ready" desc="Share these login details with the person. The password is shown only now." size="sm">
      <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-ink">{text}</pre>
      <div className="mt-4 flex justify-end gap-2"><Button app variant="outline" onClick={() => { navigator.clipboard?.writeText(text); toast({ title: 'Copied', type: 'success' }) }}><Copy className="h-4 w-4" /> Copy</Button><Button app onClick={onClose}>Done</Button></div>
    </Dialog>
  )
}

export function PersonForm({ role, person, prefill, onClose, onCreated }) {
  const adminUsers = useStore((s) => s.adminUsers)
  const editing = !!person
  const [f, setF] = useState({ name: person?.name || prefill?.name || '', email: person?.email || prefill?.email || '', password: editing ? '' : genPassword(), phone: person?.phone || prefill?.phone || '', subjects: person?.subjects || [], age: person?.age || prefill?.age || '', grade: person?.grade || '', notes: person?.notes || prefill?.notes || '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const data = role === 'teacher' ? { phone: f.phone, subjects: f.subjects } : role === 'student' ? { phone: f.phone, age: f.age ? +f.age : null, grade: f.grade, notes: f.notes } : { phone: f.phone }
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      if (editing) { await adminUsers('update', { id: person.id, name: f.name.trim(), email: f.email !== person.email ? f.email : undefined, data }); toast({ title: 'Saved', type: 'success' }); onClose() }
      else { const r = await adminUsers('create', { name: f.name.trim(), email: f.email, password: f.password, role, data }); onCreated?.({ id: r.id, email: f.email.trim().toLowerCase(), password: f.password }) }
    } catch (ex) { setErr(ex.message) } finally { setBusy(false) }
  }
  return (
    <Dialog open onClose={onClose} title={editing ? `Edit ${person.name}` : `Add ${role}`} size="md">
      <form onSubmit={submit} className="space-y-4">
        <Input app label="Full name" required value={f.name} onChange={set('name')} />
        <div className="grid gap-4 sm:grid-cols-2"><Input app label="Email (used to log in)" type="email" required value={f.email} onChange={set('email')} /><Input app label="Phone (optional)" value={f.phone} onChange={set('phone')} /></div>
        {!editing && <div><span className="label">Password</span><div className="flex gap-2"><Input app value={f.password} onChange={set('password')} required minLength={8} /><Button app variant="outline" onClick={() => setF((x) => ({ ...x, password: genPassword() }))}>New</Button></div></div>}
        {role === 'teacher' && <div><span className="label">Subjects they teach</span><div className="flex flex-wrap gap-2">{SUBJECTS.map((s) => <button key={s.id} type="button" onClick={() => setF((x) => ({ ...x, subjects: x.subjects.includes(s.id) ? x.subjects.filter((y) => y !== s.id) : [...x.subjects, s.id] }))} className={cn('rounded-xl border px-3 py-1.5 text-sm', f.subjects.includes(s.id) ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-gray-200 hover:bg-gray-50')}>{s.name}</button>)}</div></div>}
        {role === 'student' && <><div className="grid gap-4 sm:grid-cols-2"><Input app label="Age" type="number" value={f.age} onChange={set('age')} /><Input app label="Grade / level" value={f.grade} onChange={set('grade')} /></div><Textarea app label="Notes (parent contact, goals…)" rows={2} value={f.notes} onChange={set('notes')} /></>}
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><Button app variant="outline" onClick={onClose}>Cancel</Button><Button app type="submit" loading={busy}>{editing ? 'Save' : `Create ${role}`}</Button></div>
      </form>
    </Dialog>
  )
}

function ResetPassword({ person, onClose }) {
  const adminUsers = useStore((s) => s.adminUsers)
  const [pw, setPw] = useState(genPassword())
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  if (done) return <Credentials creds={{ email: person.email, password: pw }} onClose={onClose} />
  return (
    <Dialog open onClose={onClose} title={`New password for ${person.name}`} size="sm">
      <div className="flex gap-2"><Input app value={pw} onChange={(e) => setPw(e.target.value)} /><Button app variant="outline" onClick={() => setPw(genPassword())}>New</Button></div>
      <div className="mt-4 flex justify-end gap-2"><Button app variant="outline" onClick={onClose}>Cancel</Button><Button app loading={busy} onClick={async () => { setBusy(true); try { await adminUsers('reset-password', { id: person.id, password: pw }); setDone(true) } catch (e) { toast({ title: e.message, type: 'error' }) } finally { setBusy(false) } }}>Set password</Button></div>
    </Dialog>
  )
}

function AvailabilityDialog({ person, onClose }) {
  const current = useStore((s) => s.availability[person.id]) || []
  const setAvailability = useStore((s) => s.setAvailability)
  const [w, setW] = useState(current)
  return (
    <Dialog open onClose={onClose} title={`${person.name}'s availability`} desc="Weekly hours this teacher can take classes." size="lg">
      <AvailabilityEditor windows={w} onChange={setW} />
      <div className="mt-4 flex justify-end gap-2"><Button app variant="outline" onClick={onClose}>Cancel</Button><Button app onClick={() => { setAvailability(person.id, w); toast({ title: 'Availability saved', type: 'success' }); onClose() }}>Save</Button></div>
    </Dialog>
  )
}

export default function People() {
  const { students, teachers, admins } = usePeople()
  const classes = useStore((s) => s.classes)
  const adminUsers = useStore((s) => s.adminUsers)
  const meId = useStore((s) => s.currentUserId)
  const [tab, setTab] = useState('student')
  const [q, setQ] = useState('')
  const [dlg, setDlg] = useState(null)
  const list = { student: students, teacher: teachers, admin: admins }[tab].filter((p) => !q || `${p.name} ${p.email}`.toLowerCase().includes(q.toLowerCase()))
  const classCount = (p) => classes.filter((c) => c.status === 'active' && (c.teacherId === p.id || c.studentIds.includes(p.id))).length
  const toggleActive = async (p) => { try { await adminUsers('set-active', { id: p.id, active: p.active === false }); toast({ title: p.active === false ? `${p.name} can log in again` : `${p.name} is deactivated`, type: 'success' }) } catch (e) { toast({ title: e.message, type: 'error' }) } }
  return (
    <div>
      <PageTitle title="People" subtitle="Create accounts and share the login details. Only you can add people." actions={<Button app onClick={() => setDlg({ type: 'add' })}><UserPlus className="h-4 w-4" /> Add {tab}</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="tabs">{[['student', `Students (${students.length})`], ['teacher', `Teachers (${teachers.length})`], ['admin', `Admins (${admins.length})`]].map(([v, l]) => <button key={v} type="button" onClick={() => setTab(v)} className={cn('tab', tab === v && 'tab-active')}>{l}</button>)}</div>
        <div className="relative w-full sm:ml-auto sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input app placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
      </div>
      {list.length === 0 ? <div className="app-card"><EmptyState icon={Users} title={`No ${tab}s yet`} action={<Button app onClick={() => setDlg({ type: 'add' })}><UserPlus className="h-4 w-4" /> Add {tab}</Button>} /></div> : (
        <div className="app-card divide-y divide-gray-100">
          {list.map((p) => (
            <div key={p.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', p.active === false && 'opacity-55')}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar src={p.avatar} name={p.name} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">{p.name}{p.active === false && <Badge tone="bg-gray-100 text-gray-600">Deactivated</Badge>}</p>
                  <p className="truncate text-sm text-gray-500">{p.email}{tab !== 'admin' && ` · ${classCount(p)} active class${classCount(p) === 1 ? '' : 'es'}`}</p>
                  {tab === 'teacher' && <p className="text-xs text-gray-500">{(p.subjects || []).map((s) => subjectById(s).name).join(', ') || 'No subjects set'}</p>}
                  {tab === 'student' && (p.age || p.grade) && <p className="text-xs text-gray-500">{[p.age && `Age ${p.age}`, p.grade].filter(Boolean).join(' · ')}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button app size="sm" variant="outline" onClick={() => setDlg({ type: 'edit', person: p })}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                {tab === 'teacher' && <Button app size="sm" variant="outline" onClick={() => setDlg({ type: 'avail', person: p })}><Clock className="h-3.5 w-3.5" /> Availability</Button>}
                <Button app size="sm" variant="outline" onClick={() => setDlg({ type: 'pw', person: p })}><KeyRound className="h-3.5 w-3.5" /> Password</Button>
                {p.id !== meId && <Button app size="sm" variant="ghost" onClick={() => toggleActive(p)}>{p.active === false ? <><UserCheck className="h-3.5 w-3.5" /> Activate</> : <><UserX className="h-3.5 w-3.5" /> Deactivate</>}</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {dlg?.type === 'add' && <PersonForm role={tab} onClose={() => setDlg(null)} onCreated={(creds) => setDlg({ type: 'creds', creds })} />}
      {dlg?.type === 'edit' && <PersonForm role={dlg.person.role} person={dlg.person} onClose={() => setDlg(null)} />}
      {dlg?.type === 'pw' && <ResetPassword person={dlg.person} onClose={() => setDlg(null)} />}
      {dlg?.type === 'avail' && <AvailabilityDialog person={dlg.person} onClose={() => setDlg(null)} />}
      {dlg?.type === 'creds' && <Credentials creds={dlg.creds} onClose={() => setDlg(null)} />}
    </div>
  )
}
