import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Users, BookOpen } from 'lucide-react'
import { Dialog, Input, Select, Button } from '../ui/index.jsx'
import { useStore, useUI, toast } from '../../lib/store.js'
import { TIMEZONES, tzOffsetLabel, detectTimezone, cn } from '../../lib/utils.js'
import { dashboardPath } from './Navbar.jsx'
import { CLOUD_CONFIGURED } from '../../lib/cloud-config.js'
import { localModeForced } from '../../lib/cloud.js'

function PasswordInput({ value, onChange, show, onToggle, placeholder = '••••••••' }) {
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} required className="pr-10" />
      <button type="button" tabIndex={-1} onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink" aria-label="Show password">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
    </div>
  )
}

export default function AuthDialog() {
  const { authOpen, authMode, authRedirect, closeAuth, openAuth } = useUI()
  const signIn = useStore((s) => s.signIn); const signUp = useStore((s) => s.signUp); const signInDemo = useStore((s) => s.signInDemo)
  const nav = useNavigate()
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', role: 'parent', timezone: detectTimezone(), childName: '', childAge: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const done = (user) => { closeAuth(); setErr(''); toast({ title: `Welcome back, ${user.firstName}!`, type: 'success' }); nav(authRedirect || dashboardPath(user)) }
  const onSignIn = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { done(await signIn(f.email, f.password)) } catch (ex) { setErr(ex.message) } finally { setBusy(false) } }
  const onSignUp = async (e) => { e.preventDefault(); if (f.password !== f.confirm) return setErr('Passwords do not match.'); setBusy(true); setErr(''); try { const u = await signUp(f); closeAuth(); toast({ title: 'Account created!', desc: u.role === 'teacher' ? 'Your application is pending review.' : 'Let’s find the right course.', type: 'success' }); nav(authRedirect || dashboardPath(u)) } catch (ex) { setErr(ex.message) } finally { setBusy(false) } }
  const cloud = useStore((st) => st.cloud)
  const useLocalSandbox = useStore((st) => st.useLocalSandbox)
  const backToCloud = useStore((st) => st.backToCloud)
  const demo = async (role) => { setBusy(true); setErr(''); try { const u = await signInDemo(role); done(u) } catch (ex) { setErr(ex.message) } finally { setBusy(false) } }
  return (
    <Dialog open={authOpen} onClose={closeAuth} size="sm">
      {authMode === 'signin' ? (
        <form onSubmit={onSignIn} className="space-y-4">
          <div><h2 className="text-2xl font-bold text-ink">Sign in</h2><p className="mt-1 text-sm text-ink/60">{cloud ? 'Real account — works on any device' : 'Sign in to your account to continue'}</p></div>
          <label className="block"><span className="label">Email</span><Input type="email" placeholder="your@email.com" value={f.email} onChange={set('email')} required autoFocus /></label>
          <label className="block"><span className="label flex items-center justify-between">Password <button type="button" className="text-xs font-medium text-brand-600 hover:underline" onClick={() => toast({ title: 'Password reset', desc: 'In this demo, accounts live in your browser. Create a new account or use a demo login.', type: 'info' })}>Forgot password?</button></span><PasswordInput value={f.password} onChange={set('password')} show={show} onToggle={() => setShow((v) => !v)} /></label>
          {err && <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">{err}</p>}
          <Button type="submit" className="w-full" loading={busy}>Sign in</Button>
          <p className="text-center text-sm text-ink/60">Don't have an account? <button type="button" className="font-semibold text-brand-600 hover:underline" onClick={() => openAuth('signup', authRedirect)}>Sign up</button></p>
          <div className="relative py-1"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-ink/10" /></div><div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider text-ink/40"><span className="bg-white px-2">Or try a demo account</span></div></div>
          <div className="grid grid-cols-3 gap-2">
            {[['teacher', GraduationCap, 'Teacher'], ['parent', Users, 'Parent'], ['student', BookOpen, 'Student']].map(([r, I, l]) => <button key={r} type="button" onClick={() => demo(r)} className="flex flex-col items-center gap-1.5 rounded-xl border border-ink/10 px-2 py-3 text-xs font-semibold text-ink hover:border-brand-400 hover:bg-brand-50"><I className="h-5 w-5 text-brand-600" />{l}</button>)}
          </div>
          <p className="text-center text-[11px] text-ink/50">Demo logins: teacher@bright.academy · parent@bright.academy · student@bright.academy — password <span className="font-mono">demo1234</span></p>
          {CLOUD_CONFIGURED && !localModeForced() && <p className="text-center text-[11px] text-ink/50">☁️ Cloud accounts are on. Prefer a private sandbox? <button type="button" className="font-semibold text-brand-600 underline" onClick={useLocalSandbox}>Explore local demo</button></p>}
          {CLOUD_CONFIGURED && localModeForced() && <p className="text-center text-[11px] text-ink/50">🧪 Local sandbox mode (data stays in this browser). <button type="button" className="font-semibold text-brand-600 underline" onClick={backToCloud}>Back to cloud accounts</button></p>}
        </form>
      ) : (
        <form onSubmit={onSignUp} className="space-y-4">
          <div><h2 className="text-2xl font-bold text-ink">Create an account</h2><p className="mt-1 text-sm text-ink/60">Join Bright Academy and start learning</p></div>
          <div><span className="label">I am a</span><div className="grid grid-cols-3 gap-2">{[['parent', 'Parent'], ['student', 'Student (13+)'], ['teacher', 'Teacher']].map(([r, l]) => <button key={r} type="button" onClick={() => setF((x) => ({ ...x, role: r }))} className={cn('rounded-xl border px-2 py-2 text-xs font-semibold', f.role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink/10 text-ink/70 hover:bg-ink/5')}>{l}</button>)}</div></div>
          <label className="block"><span className="label">Full Name</span><Input placeholder="Full name" value={f.name} onChange={set('name')} required /></label>
          <label className="block"><span className="label">Email</span><Input type="email" placeholder="your@email.com" value={f.email} onChange={set('email')} required /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Password</span><PasswordInput value={f.password} onChange={set('password')} show={show} onToggle={() => setShow((v) => !v)} /></label><label className="block"><span className="label">Confirm password</span><PasswordInput value={f.confirm} onChange={set('confirm')} show={show} onToggle={() => setShow((v) => !v)} /></label></div>
          {f.role === 'parent' && <div className="grid grid-cols-[1fr_90px] gap-3"><label className="block"><span className="label">Child's name <span className="font-normal text-ink/50">(optional)</span></span><Input placeholder="e.g. Yusuf" value={f.childName} onChange={set('childName')} /></label><label className="block"><span className="label">Age</span><Input type="number" min="3" max="18" placeholder="9" value={f.childAge} onChange={set('childAge')} /></label></div>}
          <label className="block"><span className="label">Timezone</span><Select value={f.timezone} onChange={set('timezone')}>{[f.timezone, ...TIMEZONES.filter((t) => t !== f.timezone)].map((t) => <option key={t} value={t}>{tzOffsetLabel(t)} - {t}</option>)}</Select></label>
          {err && <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-600">{err}</p>}
          <Button type="submit" className="w-full" loading={busy}>Create account</Button>
          <p className="text-center text-xs text-ink/50">By creating an account, you agree to our <a href="/bright-academy/terms" className="underline">Terms of Service</a> and <a href="/bright-academy/privacy" className="underline">Privacy Policy</a>.</p>
          <p className="text-center text-sm text-ink/60">Already have an account? <button type="button" className="font-semibold text-brand-600 hover:underline" onClick={() => openAuth('signin', authRedirect)}>Sign in</button></p>
        </form>
      )}
    </Dialog>
  )
}
