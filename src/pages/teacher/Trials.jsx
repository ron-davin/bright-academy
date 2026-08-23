import React, { useState } from 'react'
import { ClipboardList, ClipboardCheck, Send } from 'lucide-react'
import { useStore, useCurrentUser, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Card, CardBody, Dialog, EmptyState, Input, PageHeader, Select, Textarea } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, fmtDateTime, fmtDate } from '../../lib/utils.js'

export default function TrialAssessments() {
  const user = useCurrentUser()
  const trials = useStore((s) => s.trials).filter((t) => t.teacherId === user.teacherId)
  const { submitTrialAssessment } = useStore()
  const [tab, setTab] = useState('pending')
  const [openFor, setOpenFor] = useState(null)
  const [f, setF] = useState({ level: '', strengths: '', weaknesses: '', recommendation: '', notes: '' })
  const pending = trials.filter((t) => !t.assessment)
  const completed = trials.filter((t) => t.assessment)
  const list = tab === 'pending' ? pending : completed
  const submit = () => { submitTrialAssessment(openFor.id, f); setOpenFor(null); setF({ level: '', strengths: '', weaknesses: '', recommendation: '', notes: '' }); toast({ title: 'Assessment submitted', desc: 'The family has been notified.', type: 'success' }) }
  return (
    <div>
      <PageHeader icon={ClipboardList} title="Trial Assessments" subtitle="Submit and review trial class assessment reports." />
      <div className="tabs mb-4">{[['pending', `Pending${pending.length ? ` (${pending.length})` : ''}`], ['completed', `Completed (${completed.length})`]].map(([v, l]) => <button key={v} type="button" className={cn('tab', tab === v && 'tab-active')} onClick={() => setTab(v)}>{l}</button>)}</div>
      <Card app><CardBody className="!py-2">
        {list.length === 0 && <EmptyState icon={ClipboardCheck} title={tab === 'pending' ? 'Nothing pending' : 'No completed assessments yet'} desc={tab === 'pending' ? 'New trial bookings will appear here.' : ''} />}
        <div className="divide-y divide-ink/5">
          {list.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={t.studentName} size="md" />
                <div><p className="font-semibold">{t.studentName} {t.age ? <span className="font-normal text-ink/50">· {t.age} yrs {t.grade ? `· ${t.grade}` : ''}</span> : null}</p>
                  <p className="text-sm text-ink/60">🎓 {courseOf(t.courseId)?.title} · 📅 {fmtDateTime(t.start)}</p>
                  {t.notes && <p className="mt-0.5 text-xs text-ink/50">Parent note: “{t.notes}”</p>}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={t.status === 'completed' ? (t.assessment ? 'approved' : 'completed') : t.status}>{t.assessment ? 'Report sent' : t.status === 'completed' ? 'Completed' : 'Scheduled'}</Badge>
                {!t.assessment && t.status === 'completed' && <Button app onClick={() => setOpenFor(t)}><ClipboardCheck className="h-4 w-4" /> Submit Assessment</Button>}
                {t.assessment && <Button app variant="outline" size="sm" onClick={() => setOpenFor(t)}>View report</Button>}
              </div>
            </div>
          ))}
        </div>
      </CardBody></Card>
      <Dialog open={!!openFor} onClose={() => setOpenFor(null)} title={openFor?.assessment ? `Assessment — ${openFor?.studentName}` : `Trial assessment for ${openFor?.studentName}`} size="lg">
        {openFor?.assessment ? (
          <div className="space-y-3 text-sm">
            {[['Assessed level', openFor.assessment.level], ['Strengths', openFor.assessment.strengths], ['Areas to improve', openFor.assessment.weaknesses], ['Recommended course & plan', openFor.assessment.recommendation], ['Notes', openFor.assessment.notes]].filter(([, v]) => v).map(([k, v]) => <div key={k}><p className="text-xs font-bold uppercase tracking-wider text-ink/50">{k}</p><p className="mt-0.5">{v}</p></div>)}
            <p className="text-xs text-ink/40">Submitted {fmtDate(openFor.assessment.submittedAt)}</p>
          </div>
        ) : openFor && (
          <div className="space-y-4">
            <Select app label="Assessed level" required value={f.level} onChange={(e) => setF((x) => ({ ...x, level: e.target.value }))}>
              <option value="">Select level…</option>{['Pre-Qaida (letters unknown)', 'Qaida — beginner', 'Qaida — advanced', 'Nazirah — beginner', 'Nazirah — intermediate', 'Nazirah — fluent', 'Hifz-ready', 'Arabic A0', 'Arabic A1', 'Arabic A2'].map((l) => <option key={l}>{l}</option>)}
            </Select>
            <Textarea app label="Strengths" required placeholder="What did the student do well?" value={f.strengths} onChange={(e) => setF((x) => ({ ...x, strengths: e.target.value }))} />
            <Textarea app label="Areas to improve" required placeholder="Specific gaps observed during the trial…" value={f.weaknesses} onChange={(e) => setF((x) => ({ ...x, weaknesses: e.target.value }))} />
            <Input app label="Recommended course & plan" required placeholder="e.g. Quran Recitation with Tajweed — Growth (2×/week)" value={f.recommendation} onChange={(e) => setF((x) => ({ ...x, recommendation: e.target.value }))} />
            <Textarea app label="Notes for the family (optional)" value={f.notes} onChange={(e) => setF((x) => ({ ...x, notes: e.target.value }))} />
            <div className="flex justify-end gap-2"><Button app variant="outline" onClick={() => setOpenFor(null)}>Cancel</Button><Button app disabled={!f.level || !f.strengths || !f.weaknesses || !f.recommendation} onClick={submit}><Send className="h-4 w-4" /> Send report to family</Button></div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export function RescheduleRequests() {
  const user = useCurrentUser()
  const state = useStore()
  const { decideReschedule } = useStore()
  const list = state.rescheduleRequests.filter((r) => r.teacherId === user.teacherId)
  const pending = list.filter((r) => r.status === 'pending'), resolved = list.filter((r) => r.status !== 'pending')
  const who = (r) => state.users.find((u) => u.id === r.requesterId)?.name || 'Parent'
  const stu = (r) => state.users.find((u) => u.id === r.studentId)?.name || ''
  return (
    <div>
      <PageHeader icon={ClipboardList} title="Reschedule Requests" subtitle="Review and respond to session reschedule requests from parents" />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Pending', pending.length, 'sun'], ['Approved', list.filter((r) => r.status === 'approved').length, 'green'], ['Rejected', list.filter((r) => r.status === 'rejected').length, 'red'], ['Total', list.length, 'blue']].map(([l, v, tone]) => <div key={l} className={cn('rounded-xl border p-4', tone === 'sun' ? 'border-sun-400/40 bg-sun-400/10' : tone === 'green' ? 'border-emerald-200 bg-emerald-50' : tone === 'red' ? 'border-coral-500/25 bg-coral-500/8' : 'border-brand-200 bg-brand-50')}><p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">{l}</p><p className="mt-1 text-3xl font-bold">{v}</p></div>)}
      </div>
      <h2 className="mb-2 font-semibold">Pending Requests <span className="badge bg-brand-600 text-white">{pending.length}</span></h2>
      <Card app className="mb-6"><CardBody className="!py-3">
        {pending.length === 0 && <p className="py-8 text-center text-sm text-ink/50">No pending reschedule requests</p>}
        <div className="divide-y divide-ink/5">{pending.map((r) => (
          <div key={r.id} className="py-4">
            <p className="font-semibold">{who(r)} — {courseOf(r.courseId)?.title} — {stu(r)}</p>
            <p className="mt-1 text-sm text-ink/60">{fmtDateTime(r.oldStart)} → <b className="text-ink">{fmtDateTime(r.newStart)}</b></p>
            {r.reason && <p className="mt-1 text-sm italic text-ink/60">“{r.reason}”</p>}
            <div className="mt-3 flex gap-2"><Button app size="sm" variant="success" onClick={() => { decideReschedule(r.id, 'approved'); toast({ title: 'Request approved — session moved', type: 'success' }) }}>Approve</Button><Button app size="sm" variant="outline" onClick={() => { decideReschedule(r.id, 'rejected', 'Time not available'); toast({ title: 'Request rejected' }) }}>Reject</Button></div>
          </div>))}</div>
      </CardBody></Card>
      <h2 className="mb-2 font-semibold">Resolved Requests <span className="badge bg-ink/10 text-ink/70">{resolved.length}</span></h2>
      <Card app><CardBody className="!py-3">
        {resolved.length === 0 && <p className="py-8 text-center text-sm text-ink/50">Nothing resolved yet</p>}
        <div className="divide-y divide-ink/5">{resolved.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 py-3.5">
            <div><p className="font-medium">{who(r)} — {courseOf(r.courseId)?.title} — {stu(r)}</p><p className="text-sm text-ink/60">{fmtDate(r.oldStart)} → {fmtDate(r.newStart)}</p></div>
            <Badge status={r.status} />
          </div>))}</div>
      </CardBody></Card>
    </div>
  )
}
