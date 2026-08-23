import React, { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Upload, PartyPopper } from 'lucide-react'
import { SUBJECTS } from '../../lib/data.js'
import { Input, Select, Textarea, Button } from '../../components/ui/index.jsx'
import { useStore } from '../../lib/store.js'
import { cn, DAYS } from '../../lib/utils.js'

const STEPS = ['Personal Info', 'Experience', 'Availability', 'About You', 'Documents']
const LANGS = ['English', 'Arabic', 'Urdu', 'Malay', 'Indonesian', 'Turkish', 'French', 'Other']

export default function BecomeTeacher() {
  const addApplication = useStore((s) => s.addApplication)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [f, setF] = useState({ name: '', email: '', phone: '', languages: [], subjects: [], years: '', qualification: '', ijazah: '', days: [], hours: '', about: '', why: '', cv: '', video: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const toggle = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }))
  const valid = [f.name && f.email && f.phone && f.languages.length, f.subjects.length && f.years, f.days.length && f.hours, f.about.length > 30, true][step]
  const submit = () => { addApplication(f); setDone(true) }
  if (done) return (
    <section className="container-x flex min-h-[60vh] items-center justify-center py-20">
      <div className="max-w-lg rounded-3xl border border-ink/8 bg-white p-10 text-center shadow-card">
        <PartyPopper className="mx-auto h-12 w-12 text-sun-500" />
        <h1 className="mt-4 font-display text-3xl font-black text-ink">Application received!</h1>
        <p className="mt-3 text-ink/70">JazakAllah khair, {f.name.split(' ')[0]}. Our team reviews every application carefully — expect a reply within 3 working days. Strong applicants are invited to a live recitation & teaching demo.</p>
        <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Tip: you can also create a teacher account from “Sign Up” to track your application status in the dashboard.</p>
      </div>
    </section>
  )
  return (
    <section className="bg-paper py-14">
      <div className="container-x max-w-3xl">
        <div className="text-center"><h1 className="font-display text-4xl font-black text-ink">Apply to Teach at Bright Academy</h1><p className="mt-3 text-lg text-ink/70">Share your knowledge of the Quran, Arabic and Islamic sciences with students worldwide</p></div>
        <div className="mt-10 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-ink/10 text-ink/50')}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
                <span className={cn('hidden text-xs font-medium sm:block', i === step ? 'text-ink' : 'text-ink/50')}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <span className={cn('mx-2 h-0.5 flex-1', i < step ? 'bg-emerald-500' : 'bg-ink/10')} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-ink/8 bg-white p-7 shadow-card sm:p-9">
          <p className="text-sm font-semibold text-brand-600">{step + 1} / {STEPS.length} · {STEPS[step]}</p>
          {step === 0 && <div className="mt-5 space-y-4">
            <Input label="Full Name" required value={f.name} onChange={set('name')} />
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Email" type="email" required value={f.email} onChange={set('email')} /><Input label="Phone Number" type="tel" required value={f.phone} onChange={set('phone')} /></div>
            <div><span className="label">Languages *</span><div className="flex flex-wrap gap-2">{LANGS.map((l) => <button key={l} type="button" onClick={() => toggle('languages', l)} className={cn('rounded-full border px-4 py-1.5 text-sm font-medium', f.languages.includes(l) ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 text-ink hover:bg-ink/5')}>{l}</button>)}</div></div>
          </div>}
          {step === 1 && <div className="mt-5 space-y-4">
            <div><span className="label">Subjects you can teach *</span><div className="flex flex-wrap gap-2">{SUBJECTS.map((s) => <button key={s} type="button" onClick={() => toggle('subjects', s)} className={cn('rounded-full border px-4 py-1.5 text-sm font-medium', f.subjects.includes(s) ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 text-ink hover:bg-ink/5')}>{s}</button>)}</div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Years of teaching experience" required value={f.years} onChange={set('years')}><option value="">Select…</option>{['<1', '1–2', '3–5', '6–10', '10+'].map((y) => <option key={y}>{y}</option>)}</Select>
              <Select label="Do you hold an Ijazah?" value={f.ijazah} onChange={set('ijazah')}><option value="">Select…</option><option>Yes — in recitation (riwayah)</option><option>Yes — in Hifz</option><option>No, but degree-qualified</option><option>In progress</option></Select>
            </div>
            <Input label="Highest qualification" placeholder="e.g. B.A. Quranic Sciences, Islamic University of Madinah" value={f.qualification} onChange={set('qualification')} />
          </div>}
          {step === 2 && <div className="mt-5 space-y-4">
            <div><span className="label">Days you can teach *</span><div className="flex flex-wrap gap-2">{DAYS.map((d) => <button key={d} type="button" onClick={() => toggle('days', d)} className={cn('rounded-full border px-4 py-1.5 text-sm font-medium', f.days.includes(d) ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink/15 text-ink hover:bg-ink/5')}>{d.slice(0, 3)}</button>)}</div></div>
            <Select label="Hours per week you can commit" required value={f.hours} onChange={set('hours')}><option value="">Select…</option>{['5–10', '10–20', '20–30', '30+'].map((h) => <option key={h}>{h} hours</option>)}</Select>
          </div>}
          {step === 3 && <div className="mt-5 space-y-4">
            <Textarea label="About you & your teaching approach" required rows={5} placeholder="Tell us about your background, how you teach children online, and what makes your classes special… (min. 30 characters)" value={f.about} onChange={set('about')} />
            <Textarea label="Why do you want to teach at Bright Academy?" rows={3} value={f.why} onChange={set('why')} />
          </div>}
          {step === 4 && <div className="mt-5 space-y-4">
            <Input label="CV / Resume link" placeholder="Google Drive / Dropbox link" value={f.cv} onChange={set('cv')} />
            <Input label="Sample teaching or recitation video link" placeholder="YouTube / Drive link (2–5 minutes)" value={f.video} onChange={set('video')} />
            <p className="flex items-start gap-2 rounded-xl bg-ink/4 p-3 text-xs text-ink/60"><Upload className="mt-0.5 h-4 w-4 shrink-0" /> In this demo, files are shared as links. On the production platform you would upload documents securely and we run identity & background checks before approval.</p>
          </div>}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => s + 1)} disabled={!valid}>Next <ChevronRight className="h-4 w-4" /></Button> : <Button variant="sun" onClick={submit}>Submit application</Button>}
          </div>
        </div>
      </div>
    </section>
  )
}
