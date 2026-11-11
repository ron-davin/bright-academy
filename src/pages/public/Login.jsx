import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useStore, useMe } from '../../lib/store.js'
import { Button, Input, asset } from '../../components/ui/index.jsx'
import { homeFor, Loading } from '../../components/app/AppShell.jsx'

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} required autoComplete="current-password" value={value} onChange={onChange} className="pr-11" />
      <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
    </div>
  )
}

export default function Login() {
  const me = useMe()
  const ready = useStore((s) => s.ready)
  const signIn = useStore((s) => s.signIn)
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (!ready) return <Loading />
  if (me) return <Navigate to={loc.state?.from || homeFor(me.role)} replace />
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const u = await signIn(email, password); nav(loc.state?.from || homeFor(u?.role), { replace: true }) } catch (ex) { setErr(ex.message) } finally { setBusy(false) }
  }
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex flex-col items-center gap-3"><img src={asset('logo-mark-t.png')} alt="" className="h-14 w-14 object-contain" /><span className="text-xl font-bold text-ink">Bright Academy</span></Link>
        <form onSubmit={submit} className="card space-y-5 p-7">
          <div><h1 className="text-2xl font-bold text-ink">Log in</h1><p className="mt-1 text-sm text-gray-500">For students, teachers and staff.</p></div>
          <label className="block"><span className="label">Email</span><Input type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="label">Password</span><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}>Log in</Button>
          <p className="text-center text-sm text-gray-500">Accounts are created by the academy.<br />Forgot your password? Ask your academy admin.</p>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">New here? <Link to="/#trial" className="font-semibold text-brand-700 hover:underline">Book a free trial</Link></p>
      </div>
    </div>
  )
}
