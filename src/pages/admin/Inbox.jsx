import React, { useState } from 'react'
import { Inbox as InboxIcon, Mail, Phone, FileText, Layers, CheckCircle2, RotateCcw, ExternalLink, Sparkles, MessageSquare, GraduationCap } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { Badge, Button, Card, CardBody, EmptyState, PageHeader, StatCard } from '../../components/ui/index.jsx'
import { courseOf, teacherOf } from '../../components/app/Shared.jsx'
import { cn, fmtDateTime, fmtRelative } from '../../lib/utils.js'

const SUPABASE_SQL = 'https://supabase.com/dashboard/project/cbuncoxpcdcypaxqcsmf/sql'

function HandledButton({ item, collection }) {
  const markHandled = useStore((s) => s.markHandled)
  return item.handled ? (
    <Button app size="sm" variant="ghost" onClick={() => markHandled(collection, item.id, false)}><RotateCcw className="h-3.5 w-3.5" /> Reopen</Button>
  ) : (
    <Button app size="sm" variant="success" onClick={() => { markHandled(collection, item.id, true); toast({ title: 'Marked handled', type: 'success' }) }}><CheckCircle2 className="h-3.5 w-3.5" /> Mark handled</Button>
  )
}

const Row = ({ item, collection, title, sub, body, chips }) => (
  <div className={cn('py-4', item.handled && 'opacity-55')}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold">{title} {item.handled && <Badge status="approved" className="ml-1">Handled</Badge>}</p>
        {sub && <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2"><span className="text-xs text-ink/40">{fmtRelative(item.at || item.createdAt)}</span><HandledButton item={item} collection={collection} /></div>
    </div>
    {body && <p className="mt-2 rounded-xl bg-ink/4 p-3 text-sm leading-relaxed text-ink/80">{body}</p>}
    {chips && <div className="mt-2 flex flex-wrap gap-1.5">{chips.filter(Boolean).map((c) => <span key={c} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-800">{c}</span>)}</div>}
  </div>
)

export default function AdminInbox() {
  const state = useStore()
  const [tab, setTab] = useState('leads')
  const [showHandled, setShowHandled] = useState(false)
  const unh = (a) => (a || []).filter((x) => !x.handled)
  const tabs = [
    { value: 'leads', label: 'Consultations & contact', icon: MessageSquare, count: unh(state.leads).length },
    { value: 'applications', label: 'Teacher applications', icon: GraduationCap, count: unh(state.applications).length },
    { value: 'customPlanRequests', label: 'Custom plan requests', icon: Layers, count: unh(state.customPlanRequests).length },
    { value: 'trials', label: 'Trial bookings', icon: Sparkles },
  ]
  const list = { leads: state.leads, applications: state.applications, customPlanRequests: state.customPlanRequests }[tab] || []
  const visible = showHandled ? list : unh(list)
  const mailto = (email, subject) => `mailto:${email}?subject=${encodeURIComponent(subject)}`
  return (
    <div>
      <PageHeader icon={InboxIcon} title="Inbox" subtitle="Every form submitted on the website lands here — consultations, contact messages, teacher applications and custom plan requests."
        actions={<Button app variant="outline" size="sm" href={SUPABASE_SQL} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Raw data (Supabase)</Button>} />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="New consultations" value={unh(state.leads).length} desc={`${(state.leads || []).length} total received`} icon={MessageSquare} tone="sun" />
        <StatCard title="Teacher applications" value={unh(state.applications).length} desc="awaiting review" icon={GraduationCap} tone="blue" />
        <StatCard title="Custom plan requests" value={unh(state.customPlanRequests).length} icon={Layers} tone="violet" />
        <StatCard title="Trial bookings" value={(state.trials || []).length} desc="managed by teachers" icon={Sparkles} tone="green" />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="tabs flex-wrap">{tabs.map((t) => (
          <button key={t.value} type="button" onClick={() => setTab(t.value)} className={cn('tab inline-flex items-center gap-1.5', tab === t.value && 'tab-active')}>
            <t.icon className="h-4 w-4" />{t.label}{t.count != null && t.count > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[11px] text-white">{t.count}</span>}
          </button>))}
        </div>
        {tab !== 'trials' && <label className="flex items-center gap-2 text-sm text-ink/60"><input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} className="h-4 w-4 accent-brand-600" /> Show handled</label>}
      </div>
      <Card app><CardBody className="!py-2 divide-y divide-ink/5">
        {tab === 'leads' && (visible.length === 0 ? <EmptyState icon={MessageSquare} title={showHandled ? 'No consultations yet' : 'Inbox zero — nothing pending'} desc="Submissions from the home-page consultation form and the contact form appear here the moment a visitor sends them." /> :
          visible.map((l) => <Row key={l.id} item={l} collection="leads"
            title={l.first ? `${l.first} ${l.last || ''}` : l.name || 'Unknown'}
            sub={<><a className="flex items-center gap-1 text-brand-700 hover:underline" href={mailto(l.email, 'Your Bright Academy consultation')}><Mail className="h-3.5 w-3.5" /> {l.email}</a>{l.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {l.phone}</span>}<Badge tone="bg-ink/5 text-ink/60">{l.source === 'contact' ? 'Contact form' : 'Free consultation'}</Badge></>}
            body={l.message} />))}
        {tab === 'applications' && (visible.length === 0 ? <EmptyState icon={GraduationCap} title="No teacher applications yet" desc="Submissions from the “Become a Teacher” application wizard appear here." /> :
          visible.map((a) => <Row key={a.id} item={a} collection="applications"
            title={a.name}
            sub={<><a className="flex items-center gap-1 text-brand-700 hover:underline" href={mailto(a.email, 'Your Bright Academy teaching application')}><Mail className="h-3.5 w-3.5" /> {a.email}</a>{a.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {a.phone}</span>}<span>{a.years ? `${a.years} yrs experience` : ''}</span></>}
            body={a.about}
            chips={[...(a.subjects || []), ...(a.languages || []), a.ijazah, a.qualification, a.cv && `CV: ${a.cv}`, a.video && `Video: ${a.video}`]} />))}
        {tab === 'customPlanRequests' && (visible.length === 0 ? <EmptyState icon={Layers} title="No custom plan requests" desc="Families asking for 4+ lessons per week appear here." /> :
          visible.map((r) => { const u = state.users.find((x) => x.id === r.userId); return <Row key={r.id} item={r} collection="customPlanRequests"
            title={`${u?.name || r.email || 'Visitor'} → ${courseOf(r.courseId)?.title || r.courseId}`}
            sub={r.email && <a className="flex items-center gap-1 text-brand-700 hover:underline" href={mailto(r.email, 'Your custom plan request')}><Mail className="h-3.5 w-3.5" /> {r.email}</a>}
            body="Wants more than 3 sessions per week — reply with a custom intensive plan." /> }))}
        {tab === 'trials' && ((state.trials || []).length === 0 ? <EmptyState icon={Sparkles} title="No trial bookings yet" /> :
          [...state.trials].sort((a, b) => new Date(b.createdAt || b.start) - new Date(a.createdAt || a.start)).map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div><p className="font-semibold">{t.studentName} <span className="font-normal text-ink/50">{t.age ? `· ${t.age} yrs` : ''}</span></p>
                <p className="mt-0.5 text-sm text-ink/60">{courseOf(t.courseId)?.title} · {teacherOf(t.teacherId)?.name} · {fmtDateTime(t.start)}</p>
                <p className="text-xs text-ink/50">Parent: {t.parentName || '—'} · {t.parentEmail || '—'}</p></div>
              <Badge status={t.assessment ? 'approved' : t.status}>{t.assessment ? 'Report sent' : t.status}</Badge>
            </div>)))}
      </CardBody></Card>
      <p className="mt-3 text-xs text-ink/45"><FileText className="mr-1 inline h-3.5 w-3.5" /> Tip: “Mark handled” keeps your badge count clean — nothing is deleted, tick “Show handled” to see the full history. Trial bookings are actioned by teachers in their portal.</p>
    </div>
  )
}
