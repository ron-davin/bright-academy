import React, { useState } from 'react'
import { Inbox, Mail, Phone, Check, RotateCcw, UserPlus } from 'lucide-react'
import { useStore, toast } from '../../lib/store.js'
import { subjectById } from '../../lib/data.js'
import { PageTitle } from '../../components/app/AppShell.jsx'
import { Button, EmptyState, Dialog } from '../../components/ui/index.jsx'
import { PersonForm } from './People.jsx'
import { SubjectChip } from '../../components/app/common.jsx'
import { cn, fmtRelative } from '../../lib/utils.js'

export default function Requests() {
  const leads = useStore((s) => s.leads)
  const updateLead = useStore((s) => s.updateLead)
  const [showHandled, setShowHandled] = useState(false)
  const [creating, setCreating] = useState(null)
  const [creds, setCreds] = useState(null)
  const list = [...leads].filter((l) => showHandled || !l.handled).sort((a, b) => new Date(b.at) - new Date(a.at))
  const name = (l) => l.name || `${l.first || ''} ${l.last || ''}`.trim() || 'Unknown'
  return (
    <div>
      <PageTitle title="Requests" subtitle="Free-trial requests from the website. Contact them, then create their student account." />
      <label className="mb-4 flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} className="h-4 w-4 accent-brand-600" /> Show handled requests</label>
      {list.length === 0 ? <div className="app-card"><EmptyState icon={Inbox} title="No new requests" desc="When someone sends the free-trial form on the homepage, it appears here." /></div> : (
        <div className="space-y-3">
          {list.map((l) => (
            <div key={l.id} className={cn('app-card p-5', l.handled && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{name(l)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 text-brand-700 hover:underline"><Mail className="h-3.5 w-3.5" />{l.email}</a>}
                    {l.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{l.phone}</span>}
                    <span className="text-gray-400">{fmtRelative(l.at)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!l.handled && <Button app size="sm" onClick={() => setCreating(l)}><UserPlus className="h-3.5 w-3.5" /> Create student</Button>}
                  {l.handled ? <Button app size="sm" variant="ghost" onClick={() => updateLead(l.id, { handled: false })}><RotateCcw className="h-3.5 w-3.5" /> Reopen</Button>
                    : <Button app size="sm" variant="outline" onClick={() => { updateLead(l.id, { handled: true }); toast({ title: 'Marked as handled' }) }}><Check className="h-3.5 w-3.5" /> Mark handled</Button>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {l.subject && <SubjectChip subjectId={l.subject} />}
                {l.studentAge && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">Age {l.studentAge}</span>}
                {l.times && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">Prefers: {l.times}</span>}
              </div>
              {l.message && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
      {creating && <PersonForm role="student" prefill={{ name: name(creating), email: creating.email, phone: creating.phone, age: creating.studentAge, notes: [creating.subject && `Wants ${subjectById(creating.subject).name}`, creating.times && `Prefers ${creating.times}`].filter(Boolean).join('. ') }}
        onClose={() => setCreating(null)} onCreated={(c) => { updateLead(creating.id, { handled: true, studentId: c.id }); setCreating(null); setCreds(c) }} />}
      {creds && <Dialog open onClose={() => setCreds(null)} title="Student account ready" size="sm">
        <p className="text-sm text-gray-600">Share these details with the student, then add them to a class from <b>Schedule → New class</b>.</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm">{`Website: ${window.location.origin}/login\nEmail: ${creds.email}\nPassword: ${creds.password}`}</pre>
        <div className="mt-4 flex justify-end"><Button app onClick={() => setCreds(null)}>Done</Button></div>
      </Dialog>}
    </div>
  )
}
