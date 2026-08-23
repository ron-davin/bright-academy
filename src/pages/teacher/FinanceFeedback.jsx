import React, { useMemo, useState } from 'react'
import { isSameMonth } from 'date-fns'
import { Wallet, TrendingUp, MessageSquare, BadgeCheck, Landmark, ArrowRight, FileDown, Receipt, Clock, CalendarCheck, Star, ChevronRight, Send, Wrench } from 'lucide-react'
import { useStore, useCurrentUser, effectiveStatus, sessionsForTeacher, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Dialog, EmptyState, Input, PageHeader, Select, StatCard, Stars, Tabs, Textarea } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, money, fmtDate, fmtDateTime, download, toCSV } from '../../lib/utils.js'

const RATE_1ON1 = 12, RATE_GROUP = 18

export function TeacherFinances() {
  const user = useCurrentUser()
  const state = useStore()
  const { setPayoutMethod, requestWithdrawal } = useStore()
  const [openPayout, setOpenPayout] = useState(false)
  const [method, setMethod] = useState({ type: 'Wise', account: '' })
  const now = new Date()
  const sessions = sessionsForTeacher(state, user.teacherId)
  const rate = (s) => (s.studentIds.length > 1 ? RATE_GROUP : RATE_1ON1)
  const completed = sessions.filter((s) => s.status === 'completed')
  const doneThisMonth = completed.filter((s) => isSameMonth(new Date(s.start), now))
  const pendingEarnings = doneThisMonth.reduce((n, s) => n + rate(s), 0)
  const availableBalance = completed.filter((s) => !isSameMonth(new Date(s.start), now)).reduce((n, s) => n + rate(s), 0) * 0.35 // most already paid out in demo
  const projected = sessions.filter((s) => isSameMonth(new Date(s.start), now) && ['scheduled', 'live', 'completed'].includes(s.status)).reduce((n, s) => n + rate(s), 0)
  const scheduledThisMonth = sessions.filter((s) => isSameMonth(new Date(s.start), now)).length
  const payout = state.payoutMethods[user.id]
  const withdrawals = state.withdrawals.filter((w) => w.userId === user.id)
  const savePayout = () => { setPayoutMethod(user.id, method); setOpenPayout(false); toast({ title: 'Payout method saved', type: 'success' }) }
  const exportCSV = () => download('bright-academy-earnings.csv', toCSV(completed.slice(0, 200).map((s) => ({ date: fmtDate(s.start), course: courseOf(s.courseId)?.title, students: s.studentIds.length, amount: rate(s) }))), 'text/csv')
  return (
    <div>
      <PageHeader icon={Wallet} title="Earnings & Wallet" subtitle="Track your income, withdraw funds, and manage your payment profile." tone="bg-emerald-50 text-emerald-600" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">Available balance</p>
          <p className="mt-1 font-display text-4xl font-black">{money(availableBalance, { cents: true })}</p>
          <p className="mt-0.5 text-xs text-white/70">Available to withdraw</p>
          {payout ? <Button app variant="sun" size="sm" className="mt-4" onClick={() => { requestWithdrawal(user.id, availableBalance); toast({ title: 'Withdrawal requested', desc: 'Demo — payouts require Stripe Connect/Wise integration.', type: 'success' }) }}>Withdraw <ArrowRight className="h-3.5 w-3.5" /></Button>
            : <Button app size="sm" className="mt-4 !bg-white !text-brand-700 hover:!bg-cream" onClick={() => setOpenPayout(true)}>Set Up Payout Method <ArrowRight className="h-3.5 w-3.5" /></Button>}
          {!payout && <p className="mt-2 text-[11px] text-white/60">ⓘ Add a bank or Wise account to withdraw.</p>}
        </div>
        <StatCard title="Pending Earnings" value={money(pendingEarnings)} desc="Awaiting payout" icon={Clock} tone="sun" />
        <StatCard title="Projected (This Month)" value={money(projected)} desc="From scheduled sessions" icon={TrendingUp} tone="green" />
        <StatCard title="Completed Sessions" value={doneThisMonth.length} desc={`Out of ${scheduledThisMonth} this month`} icon={CalendarCheck} tone="violet" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card app>
          <CardHeader title="Payout Method" action={<Button app variant="ghost" size="sm" onClick={() => setOpenPayout(true)}>Manage</Button>} />
          <CardBody>{payout ? <p className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 text-sm"><Landmark className="h-5 w-5 text-brand-600" /> <span><b>{payout.type}</b> — {payout.account || 'account connected'}</span><Badge status="active" className="ml-auto">Verified</Badge></p>
            : <p className="flex items-center gap-3 rounded-xl border border-dashed border-ink/15 p-4 text-sm text-ink/60"><Landmark className="h-5 w-5" /> No payout method — add one to get paid.</p>}
            {withdrawals.length > 0 && <div className="mt-3 space-y-2">{withdrawals.map((w) => <p key={w.id} className="flex justify-between rounded-lg bg-ink/4 px-3 py-2 text-sm"><span>Withdrawal · {fmtDate(w.at)}</span><span className="font-semibold">{money(w.amount, { cents: true })} <Badge status="processing" className="ml-2" /></span></p>)}</div>}
          </CardBody>
        </Card>
        <Card app>
          <CardHeader title="Quick Actions" />
          <CardBody className="space-y-2">
            {[[Landmark, 'Update Payout Method', 'Change your bank or payout details', () => setOpenPayout(true)], [Receipt, 'View Earnings Details', 'See your earnings breakdown', exportCSV], [FileDown, 'Download Statements', 'Download your earnings as CSV', exportCSV]].map(([I, t, d, fn]) => (
              <button key={t} type="button" onClick={fn} className="flex w-full items-center gap-3 rounded-xl border border-ink/8 p-3.5 text-left hover:bg-ink/3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><I className="h-4 w-4 text-brand-600" /></span>
                <span className="flex-1"><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-ink/55">{d}</span></span><ChevronRight className="h-4 w-4 text-ink/30" />
              </button>))}
          </CardBody>
        </Card>
      </div>
      <Card app className="mt-4">
        <CardHeader title="Recent earnings" subtitle={`$${RATE_1ON1} per 1-on-1 session · $${RATE_GROUP} per group session (demo rates)`} />
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
          <thead><tr className="border-b border-ink/8 text-left text-ink/60"><th className="px-5 py-2.5 font-medium">Date</th><th className="px-5 py-2.5 font-medium">Course</th><th className="px-5 py-2.5 font-medium">Type</th><th className="px-5 py-2.5 text-right font-medium">Amount</th></tr></thead>
          <tbody>{completed.sort((a, b) => new Date(b.start) - new Date(a.start)).slice(0, 12).map((s) => (
            <tr key={s.id} className="border-b border-ink/4 last:border-b-0"><td className="px-5 py-2.5 text-ink/70">{fmtDate(s.start)}</td><td className="max-w-[280px] truncate px-5 py-2.5">{courseOf(s.courseId)?.title}</td><td className="px-5 py-2.5">{s.studentIds.length > 1 ? <Badge tone="bg-sun-400/20 text-sun-600">Group</Badge> : <Badge tone="bg-sky-400/15 text-sky-500">1-on-1</Badge>}</td><td className="px-5 py-2.5 text-right font-semibold text-emerald-700">+{money(rate(s))}</td></tr>))}</tbody>
        </table></div>
      </Card>
      <Dialog open={openPayout} onClose={() => setOpenPayout(false)} title="Payout method" desc="Demo only — production payouts use Stripe Connect or Wise (see Services & Costs).">
        <div className="space-y-4">
          <Select app label="Provider" value={method.type} onChange={(e) => setMethod((x) => ({ ...x, type: e.target.value }))}>{['Wise', 'Bank transfer (SWIFT)', 'PayPal'].map((m) => <option key={m}>{m}</option>)}</Select>
          <Input app label="Account email / IBAN" placeholder="name@wise.com or IBAN" value={method.account} onChange={(e) => setMethod((x) => ({ ...x, account: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpenPayout(false)}>Cancel</Button><Button app onClick={savePayout} disabled={!method.account}>Save method</Button></div>
        </div>
      </Dialog>
    </div>
  )
}

export function TeacherPerformance() {
  const user = useCurrentUser()
  const state = useStore()
  const sessions = sessionsForTeacher(state, user.teacherId)
  const completed = sessions.filter((s) => s.status === 'completed').length
  const missed = sessions.filter((s) => ['missed', 'cancelled'].includes(effectiveStatus(s))).length
  const total = completed + missed
  const reviews = state.reviews.filter((r) => r.teacherId === user.teacherId)
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 5
  const fb = state.feedback.filter((f) => f.teacherId === user.teacherId).length
  const completionRate = total ? Math.round((completed / total) * 100) : 100
  const tier = completionRate >= 92 && avg >= 4.8 ? 'Gold' : completionRate >= 85 ? 'Silver' : 'Bronze'
  return (
    <div>
      <PageHeader icon={TrendingUp} title="Performance" subtitle="Your teaching metrics and bonus tier" tone="bg-sky-400/15 text-sky-500" />
      <div className="mb-5 rounded-xl border border-sun-400/40 bg-sun-400/10 p-4 text-sm"><b>Bonus tier: {tier}.</b> Keep your completion rate above 92% and rating above 4.8★ to stay in Gold (+10% payout bonus).</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Average rating" value={`${avg.toFixed(1)}★`} desc={`${reviews.length} parent reviews`} icon={Star} tone="sun" />
        <StatCard title="Sessions completed" value={completed} icon={CalendarCheck} tone="green" />
        <StatCard title="Completion rate" value={`${completionRate}%`} desc={`${missed} missed/cancelled`} icon={TrendingUp} tone="blue" />
        <StatCard title="Feedback submitted" value={fb} desc="Post-lesson reports" icon={MessageSquare} tone="violet" />
      </div>
      <Card app className="mt-4"><CardHeader title="Latest parent reviews" /><CardBody className="!py-2 divide-y divide-ink/5">
        {reviews.slice(0, 6).map((r) => <div key={r.id} className="py-3.5"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-semibold"><Avatar name={r.authorName} size="xs" /> {r.authorName} <span className="font-normal text-ink/40">· {courseOf(r.courseId)?.title.slice(0, 34)}</span></p><Stars value={r.rating} /></div>{r.text && <p className="mt-1.5 text-sm text-ink/70">{r.text}</p>}</div>)}
      </CardBody></Card>
    </div>
  )
}

export function TeacherFeedback() {
  const user = useCurrentUser()
  const state = useStore()
  const { submitFeedback } = useStore()
  const [tab, setTab] = useState('lesson')
  const [activeId, setActiveId] = useState(null)
  const [f, setF] = useState({ learned: '', weak: '', recommendations: '', engagement: 4 })
  const now = new Date()
  const needs = state.sessions.filter((s) => s.teacherId === user.teacherId && s.status === 'completed' && !state.feedback.some((fb) => fb.sessionId === s.id)).sort((a, b) => new Date(b.start) - new Date(a.start))
  const given = state.feedback.filter((fb) => fb.teacherId === user.teacherId)
  const reviews = state.reviews.filter((r) => r.teacherId === user.teacherId)
  const active = needs.find((s) => s.id === activeId)
  const stOf = (s) => state.users.find((u) => u.id === s.studentIds[0])
  const submit = () => { submitFeedback({ sessionId: active.id, teacherId: user.teacherId, courseId: active.courseId, studentId: active.studentIds[0], ...f }); setActiveId(null); setF({ learned: '', weak: '', recommendations: '', engagement: 4 }); toast({ title: 'Feedback sent to the family', type: 'success' }) }
  return (
    <div>
      <PageHeader icon={MessageSquare} title="Feedback" subtitle="Submit lesson feedback and review parent feedback about you and your programs." />
      <Tabs className="mb-5" tabs={[{ value: 'lesson', label: 'Lesson Feedback', icon: MessageSquare, count: needs.length }, { value: 'ratings', label: `About Me (${reviews.length})`, icon: Star }]} value={tab} onChange={setTab} />
      {tab === 'ratings' ? (
        <Card app><CardBody className="!py-2 divide-y divide-ink/5">{reviews.map((r) => <div key={r.id} className="py-3.5"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-semibold"><Avatar name={r.authorName} size="xs" /> {r.authorName}</p><Stars value={r.rating} /></div><p className="mt-1 text-xs text-ink/50">{courseOf(r.courseId)?.title} · {fmtDate(r.at)}</p>{r.text && <p className="mt-1.5 text-sm text-ink/70">{r.text}</p>}</div>)}</CardBody></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">Needs feedback ({needs.length})</p>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto thin-scroll pr-1">
              {needs.slice(0, 40).map((s) => (
                <button key={s.id} type="button" onClick={() => setActiveId(s.id)} className={cn('w-full rounded-xl border bg-white p-3.5 text-left shadow-sm', activeId === s.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink/8 hover:border-brand-300')}>
                  <p className="flex items-center gap-2 font-semibold"><Avatar name={stOf(s)?.name || '?'} size="xs" /> {stOf(s)?.name}</p>
                  <p className="mt-1 text-xs text-ink/60">📖 {courseOf(s.courseId)?.title.slice(0, 30)}… · {fmtDate(s.start)}</p>
                </button>))}
              {needs.length === 0 && <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/50">All caught up — no feedback due.</p>}
            </div>
            <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">Completed ({given.length})</p>
          </div>
          <div>
            {active ? (
              <Card app><CardBody className="!p-6">
                <p className="flex items-center gap-3 text-lg font-bold"><Avatar name={stOf(active)?.name || '?'} size="md" /> Post-Lesson Feedback</p>
                <p className="mt-1 text-sm text-ink/60">{courseOf(active.courseId)?.title} · {stOf(active)?.name} · {fmtDate(active.start)}</p>
                <div className="mt-5 space-y-4">
                  <Textarea app label="What the student learned" required placeholder="Describe what concepts the student grasped…" value={f.learned} onChange={(e) => setF((x) => ({ ...x, learned: e.target.value }))} />
                  <Textarea app label="Weak areas identified" required placeholder="Areas where the student struggled…" value={f.weak} onChange={(e) => setF((x) => ({ ...x, weak: e.target.value }))} />
                  <Textarea app label="Recommendations" placeholder="Suggested focus areas or practice…" value={f.recommendations} onChange={(e) => setF((x) => ({ ...x, recommendations: e.target.value }))} />
                  <div><span className="label">Student engagement</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setF((x) => ({ ...x, engagement: n }))}><Star className={cn('h-7 w-7', n <= f.engagement ? 'fill-sun-400 text-sun-400' : 'fill-ink/10 text-ink/10')} /></button>)}</div></div>
                  <div className="flex justify-end"><Button app disabled={!f.learned || !f.weak} onClick={submit}><Send className="h-4 w-4" /> Send feedback</Button></div>
                </div>
              </CardBody></Card>
            ) : <Card app className="border-dashed"><EmptyState className="py-24" icon={MessageSquare} title="Pick a session" desc="Choose a completed session on the left to write its feedback." /></Card>}
          </div>
        </div>
      )}
    </div>
  )
}

export function ApprovalRequests() {
  const user = useCurrentUser()
  const state = useStore()
  const { decideApproval } = useStore()
  const [tab, setTab] = useState('pending')
  const list = state.approvalRequests.filter((a) => a.teacherId === user.teacherId)
  const filtered = tab === 'all' ? list : list.filter((a) => a.status === (tab === 'remediation' ? 'remediation' : tab))
  const stOf = (a) => state.users.find((u) => u.id === a.studentId)
  return (
    <div>
      <PageHeader icon={BadgeCheck} title="Completion Approval Requests" subtitle="Review student completion requests and decide whether to issue a certificate." />
      <div className="mb-5 grid gap-3 rounded-xl border border-sun-400/40 bg-sun-400/8 p-5 md:grid-cols-3">
        {[['1. Student requests completion', 'When a student finishes a course they can submit a completion request from their dashboard.'], ['2. You review eligibility', "Open a request to see the student's attendance, lesson progress and homework scores against the course thresholds."], ['3. Approve, reject or remediate', 'Approve to issue a certificate, send back for remediation with notes, or reject the request.']].map(([t, d]) => <div key={t} className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sun-500" /><div><p className="text-sm font-bold">{t}</p><p className="mt-1 text-xs leading-relaxed text-ink/60">{d}</p></div></div>)}
      </div>
      <Card app>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 px-5 py-4"><p className="font-bold">Requests</p>
          <div className="tabs">{['all', 'pending', 'approved', 'rejected', 'remediation'].map((t) => <button key={t} type="button" className={cn('tab capitalize', tab === t && 'tab-active')} onClick={() => setTab(t)}>{t} <span className="ml-1 rounded-full bg-ink/10 px-1.5 text-[10px]">{t === 'all' ? list.length : list.filter((a) => a.status === t).length}</span></button>)}</div></div>
        <CardBody className="!py-2 divide-y divide-ink/5">
          {filtered.length === 0 && <EmptyState icon={BadgeCheck} title="No approval requests in this view" desc="Requests show up here automatically when a student finishes a course and asks you to confirm completion." />}
          {filtered.map((a) => (
            <div key={a.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 font-semibold"><Avatar name={stOf(a)?.name || '?'} size="sm" /> {stOf(a)?.name} <span className="font-normal text-ink/50">· {courseOf(a.courseId)?.title}</span></p>
                <Badge status={a.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">{a.eligibility && Object.entries({ Attendance: `${a.eligibility.attendance}%`, Lessons: a.eligibility.lessonsCompleted, 'Homework avg': `${a.eligibility.homeworkAvg}%` }).map(([k, v]) => <span key={k} className="rounded-lg bg-ink/5 px-2.5 py-1">{k}: <b>{v}</b></span>)}</div>
              {a.status === 'pending' && <div className="mt-3 flex flex-wrap gap-2">
                <Button app size="sm" variant="success" onClick={() => { decideApproval(a.id, 'approved', 'Congratulations!'); toast({ title: 'Approved — certificate issued', type: 'success' }) }}><BadgeCheck className="h-4 w-4" /> Approve & issue certificate</Button>
                <Button app size="sm" variant="outline" onClick={() => { decideApproval(a.id, 'remediation', 'Please complete the final revision test first.'); toast({ title: 'Sent back for remediation' }) }}><Wrench className="h-4 w-4" /> Remediate</Button>
                <Button app size="sm" variant="danger" onClick={() => { decideApproval(a.id, 'rejected', 'Requirements not met yet.'); toast({ title: 'Request rejected' }) }}>Reject</Button>
              </div>}
              {a.decisionNote && a.status !== 'pending' && <p className="mt-2 text-xs italic text-ink/50">Note: {a.decisionNote}</p>}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
