import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Check, LifeBuoy, DollarSign, Server, Video, CreditCard, BellRing, Database, Bot, HardDrive, Globe, ShieldCheck } from 'lucide-react'
import { BRAND, HELP_ARTICLES, TEACHERS } from '../../lib/data.js'
import { FAQ } from '../../components/marketing/Sections.jsx'
import { Input, Textarea, Button, asset } from '../../components/ui/index.jsx'
import { useStore, toast } from '../../lib/store.js'

const Shell = ({ title, sub, children }) => (
  <section className="container-x py-14"><div className="mx-auto max-w-3xl"><h1 className="font-display text-4xl font-black text-ink">{title}</h1>{sub && <p className="mt-3 text-lg text-ink/70">{sub}</p>}<div className="prose-ba mt-8 space-y-5 leading-relaxed text-ink/80">{children}</div></div></section>
)
const H = ({ children, id }) => <h2 id={id} className="pt-4 text-xl font-bold text-ink">{children}</h2>

export function About() {
  return (
    <Shell title="About Bright Academy" sub="Structured, joyful Islamic education — online, live and outcome-driven.">
      <p>Bright Academy was founded by parents and teachers who believed Islamic education deserves the same structure, quality and accountability as the best schools. We offer live Quran, Arabic and Islamic Studies programs for ages 4–18 — nothing else, by design. Focus is our superpower.</p>
      <p>Every course has a clear outcome, a week-by-week curriculum and monthly progress tracking. Every teacher is Ijazah-certified or degree-qualified, background-checked, and trained to teach children online with patience and warmth.</p>
      <H>What makes us different</H>
      <ul className="list-none space-y-2 pl-0">{['Outcome-driven: we promise measurable results every term, not just "lessons"', 'Islamic subjects only: Quran, Arabic and Islamic Studies taught deeply', 'Small live classes: 1-on-1 or groups of 4–8, never lectures to a crowd', 'Full transparency: parents see attendance, homework, recitation accuracy and teacher notes'].map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{t}</li>)}</ul>
      <div className="flex flex-wrap gap-4 pt-4">{TEACHERS.slice(0, 5).map((t) => <img key={t.id} src={asset(t.photo)} alt={t.name} className="h-16 w-16 rounded-2xl object-cover" />)}</div>
    </Shell>
  )
}

export function Contact() {
  const addLead = useStore((s) => s.addLead)
  const [f, setF] = useState({ name: '', email: '', message: '' }); const [ok, setOk] = useState(false)
  return (
    <section className="container-x py-14">
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
        <div><h1 className="font-display text-4xl font-black text-ink">Contact Us</h1><p className="mt-3 text-ink/70">Questions about courses, teachers or billing? We reply within one working day, in sha Allah.</p>
          <div className="mt-6 space-y-3 text-sm"><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-600" /> {BRAND.email}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" /> {BRAND.phone}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" /> {BRAND.address}</p></div></div>
        {ok ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center"><Check className="mx-auto h-10 w-10 text-emerald-600" /><p className="mt-3 font-bold text-emerald-800">Message sent!</p><p className="text-sm text-emerald-700">We'll get back to you shortly.</p></div> :
          <form className="space-y-4 rounded-3xl border border-ink/8 bg-white p-6 shadow-card" onSubmit={(e) => { e.preventDefault(); addLead({ ...f, source: 'contact' }); setOk(true); toast({ title: 'Message sent', type: 'success' }) }}>
            <Input label="Your name" required value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} />
            <Input label="Email" type="email" required value={f.email} onChange={(e) => setF((x) => ({ ...x, email: e.target.value }))} />
            <Textarea label="Message" required rows={5} value={f.message} onChange={(e) => setF((x) => ({ ...x, message: e.target.value }))} />
            <Button type="submit" className="w-full">Send message</Button>
          </form>}
      </div>
    </section>
  )
}

export function Support() {
  return (
    <section className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-center"><LifeBuoy className="mx-auto h-10 w-10 text-brand-600" /><h1 className="mt-3 font-display text-4xl font-black text-ink">Support & Help Center</h1><p className="mt-3 text-ink/70">Quick answers to the most common questions.</p></div>
        <FAQ items={HELP_ARTICLES.map((a) => ({ q: a.q, a: a.a }))} className="mt-8" />
        <p className="mt-6 text-center text-sm text-ink/60">Still stuck? Email <a className="font-semibold text-brand-700" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or use the <Link to="/contact-us" className="font-semibold text-brand-700">contact form</Link>.</p>
      </div>
    </section>
  )
}

export function Terms() {
  return (
    <Shell title="Terms of Service" sub="Demo terms for the Bright Academy demonstration platform.">
      <p className="rounded-xl bg-sun-400/15 p-3 text-sm">This is a demonstration website. Accounts, payments and enrollments are simulated in your browser and no real transactions occur.</p>
      <H>1. The service</H><p>Bright Academy provides live online Islamic education (Quran, Arabic, Islamic Studies) through subscriptions billed monthly per course plan. Lessons are delivered in our virtual classroom by independent qualified teachers.</p>
      <H>2. Subscriptions & billing</H><p>Plans renew monthly until cancelled. You may pause or cancel at any time from your dashboard; unused sessions roll over to the following month. Prices are shown before purchase and include all platform fees.</p>
      <H id="refunds">3. Refunds</H><p>First lesson satisfaction guarantee: if you are not happy after the first paid lesson of a course, we refund that month in full. Otherwise, fees for delivered sessions are non-refundable; undelivered sessions are refunded pro-rata on cancellation.</p>
      <H id="cancellation">4. Cancellation & rescheduling</H><p>Sessions can be rescheduled free of charge with at least 24 hours notice. Late cancellations may consume the session. Teachers who miss a session will always make it up at no cost.</p>
      <H>5. Child safety</H><p>All teachers pass identity and background checks. Classroom sessions may be recorded for safety and review. Messaging between teachers and students is monitored for safety. Parents control their children's accounts.</p>
      <H>6. Acceptable use</H><p>Be respectful. Accounts used to harass, record without consent, or share course materials publicly may be suspended.</p>
    </Shell>
  )
}

export function Privacy() {
  return (
    <Shell title="Privacy Policy" sub="How the Bright Academy demo handles your data.">
      <p className="rounded-xl bg-sun-400/15 p-3 text-sm"><b>Demo note:</b> everything you enter on this site (accounts, bookings, messages) is stored only in your own browser's localStorage. Nothing is sent to any server. Clearing your browser data removes it completely.</p>
      <H>What a production version would collect</H><p>Account details (name, email, timezone), children's first names and ages for scheduling, lesson attendance and progress records, payment records processed by a PCI-compliant provider (we would never store card numbers), and support communications.</p>
      <H>What we would never do</H><p>Sell personal data, show ads to children, or share student information with anyone except the child's own teacher and parents.</p>
      <H>Recordings</H><p>Lesson recordings are available only to the enrolled family, the teacher and academy supervisors, and are retained for 90 days by default.</p>
      <H>Contact</H><p>Privacy questions: {BRAND.email}</p>
    </Shell>
  )
}

const COSTS = [
  { icon: Server, name: 'Hosting (this site)', now: 'GitHub Pages — FREE', notes: 'Static hosting, free for public repos. Custom domain ≈ $10–15/yr. A real backend (below) is the actual cost driver.' },
  { icon: Database, name: 'Backend, database & auth', now: 'None — demo stores data in your browser (localStorage)', notes: 'Real accounts/enrollments need a backend. Free tiers: Supabase (Postgres + auth) or Firebase — $0 to start, ≈ $25/mo (Supabase Pro) as you grow. Vercel/Render app hosting: free tier, then ≈ $7–20/mo.' },
  { icon: Video, name: 'Live video classroom', now: 'Jitsi Meet embed + built-in P2P room — FREE', notes: 'Darstop uses LiveKit. Managed video (LiveKit Cloud / Daily.co / 100ms) has free tiers (e.g. Daily ≈ 10k participant-minutes/mo), then usage pricing ≈ $0.004–0.007 per participant-minute (~$1.5–3 per 1-on-1 hour-class at scale). P2P (this demo) is free but needs a TURN server (≈ $0.10–0.40/GB or Metered.ca free 500MB/mo) for strict networks.' },
  { icon: HardDrive, name: 'Lesson recording & storage', now: 'Local recording to a file on the teacher’s device — FREE', notes: 'Cloud recording (LiveKit Egress, Daily recording ≈ $0.0135/min) plus storage (S3/Backblaze ≈ $0.005–0.023/GB/mo) and streaming bandwidth. Budget roughly $5–20/mo per active teacher at moderate volume.' },
  { icon: CreditCard, name: 'Payments & payouts', now: 'Simulated checkout — FREE', notes: 'Stripe ≈ 2.9% + $0.30 per charge (no monthly fee); subscriptions/invoicing included. Teacher payouts via Stripe Connect or Wise incur transfer fees ≈ 0.5–2%.' },
  { icon: BellRing, name: 'Email / SMS / push notifications', now: 'In-app notifications only — FREE', notes: 'Email: Resend/Brevo free tiers (≈ 3k emails/mo), then ≈ $10–20/mo. SMS via Twilio ≈ $0.008–0.05 per message. Web push is free but needs a backend.' },
  { icon: Bot, name: 'AI lesson-plan assistant', now: 'Template-based generator — FREE', notes: 'Darstop has an AI "Prep Assistant". Wiring a real LLM (e.g. Claude API) is usage-billed — typically fractions of a cent to a few cents per lesson plan, depending on model and length.' },
  { icon: Globe, name: 'Custom domain & SSL', now: 'ron-davin.github.io/bright-academy — FREE', notes: 'brightacademy.com-style domain ≈ $10–15/yr. SSL is free (GitHub Pages / Let’s Encrypt / Cloudflare).' },
  { icon: ShieldCheck, name: 'Background checks & compliance', now: 'Not applicable in demo', notes: 'Real teacher vetting (e.g. Checkr) ≈ $25–80 per teacher. COPPA/GDPR compliance mostly process cost, not software.' },
]

export function Costs() {
  return (
    <section className="container-x py-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-center"><DollarSign className="mx-auto h-10 w-10 text-brand-600" /><h1 className="mt-3 font-display text-4xl font-black text-ink">Services & Costs</h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">This demo runs 100% free: static hosting on GitHub Pages, data in your browser, and free video via Jitsi/WebRTC. Here is what each capability costs when you go to production. <span className="text-ink/50">(Prices are ballpark — verify current pricing before committing.)</span></p></div>
        <div className="mt-10 space-y-4">
          {COSTS.map((c) => (
            <div key={c.name} className="grid gap-3 rounded-2xl border border-ink/8 bg-white p-5 shadow-card sm:grid-cols-[auto_1fr]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><c.icon className="h-5 w-5 text-brand-600" /></span>
              <div><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-ink">{c.name}</p><span className="badge bg-emerald-100 text-emerald-700">{c.now}</span></div>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{c.notes}</p></div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-ink p-6 text-sm text-cream/85">
          <p className="font-bold text-white">Rule of thumb</p>
          <p className="mt-2">MVP with real users: <b>$0–30/month</b> (free tiers + Stripe fees only). Growing academy (≈50 students, recorded classes, emails): <b>~$50–150/month</b> plus payment fees. The single biggest decision is managed video vs. self-hosted Jitsi/LiveKit on a VPS (≈ $20–40/mo flat).</p>
        </div>
      </div>
    </section>
  )
}

export function NotFound() {
  return <section className="container-x py-24 text-center"><p className="font-display text-7xl font-black text-brand-200">404</p><h1 className="mt-2 text-2xl font-bold text-ink">Page not found</h1><p className="mt-2 text-ink/60">The page you're looking for doesn't exist.</p><Link to="/" className="btn btn-md btn-primary mt-6">Back to home</Link></section>
}
