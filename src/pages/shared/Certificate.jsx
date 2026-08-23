import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { useStore } from '../../lib/store.js'
import { courseOf, teacherOf } from '../../components/app/Shared.jsx'
import { asset, Button } from '../../components/ui/index.jsx'
import { fmtDate } from '../../lib/utils.js'

export default function CertificateView() {
  const { certId } = useParams()
  const cert = useStore((s) => s.certificates.find((c) => c.id === certId))
  const student = useStore((s) => s.users.find((u) => u.id === cert?.studentId))
  if (!cert) return <div className="flex min-h-svh items-center justify-center"><p>Certificate not found. <Link className="text-brand-600 underline" to="/">Home</Link></p></div>
  const course = courseOf(cert.courseId); const teacher = teacherOf(cert.teacherId)
  return (
    <div className="min-h-svh bg-paper p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => window.history.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save PDF</Button>
      </div>
      <div className="mx-auto max-w-4xl rounded-2xl border-[10px] border-double border-brand-700 bg-white p-10 text-center shadow-card print:shadow-none sm:p-14">
        <img src={asset('logo-sm.png')} alt="Bright Academy" className="mx-auto h-16 w-auto" />
        <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.35em] text-sun-600">Certificate of Completion</p>
        <p className="mt-6 text-ink/60">This certifies that</p>
        <p className="mt-2 font-display text-5xl font-black text-brand-800">{student?.name}</p>
        <p className="mt-6 text-ink/60">has successfully completed the course</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink">{course?.title}</p>
        <p className="mt-1 text-sm text-ink/60">{course?.weeks} weeks · {course?.subject}</p>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-10 text-sm">
          <div className="border-t border-ink/20 pt-2"><p className="font-semibold">{teacher?.name}</p><p className="text-ink/50">Course Teacher</p></div>
          <div className="border-t border-ink/20 pt-2"><p className="font-semibold">{fmtDate(cert.issuedAt)}</p><p className="text-ink/50">Date of Issue</p></div>
        </div>
        <p className="mt-8 text-xs text-ink/40">Certificate ID: {cert.code} · Verify at brightacademy demo</p>
      </div>
    </div>
  )
}
