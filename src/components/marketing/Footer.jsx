import React from 'react'
import { Link } from 'react-router-dom'
import { Send, ArrowUp, Mail, Phone, MapPin, Globe, Camera, Tv } from 'lucide-react'
import { BRAND } from '../../lib/data.js'
import { asset } from '../ui/index.jsx'

const cols = [
  { h: 'Explore', links: [['Programs', '/courses'], ['Our Teachers', '/instructors'], ['Prices', '/#pricing'], ['How It Works', '/how-it-works'], ['Become Teacher', '/become-teacher'], ['Success Stories', '/results']] },
  { h: 'Company', links: [['About Us', '/about-us'], ['Contact Us', '/contact-us'], ['Support', '/support'], ['Services & Costs', '/costs']] },
  { h: 'Legal', links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Refund Policy', '/terms#refunds'], ['Cancellation Policy', '/terms#cancellation']] },
]
export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="inline-flex rounded-xl bg-white px-3 py-2"><img src={asset('logo-sm.png')} alt="Bright Academy" className="h-10 w-auto" /></div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">An outcome-driven Islamic learning platform offering live, structured Quran, Arabic and Islamic Studies curricula for ages 4–18, taught by qualified, vetted teachers.</p>
            <div className="mt-6 space-y-2 text-sm text-cream/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sun-400">Contact</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-cream/50" /> {BRAND.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-cream/50" /> {BRAND.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cream/50" /> {BRAND.address}</p>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}><p className="text-[11px] font-bold uppercase tracking-wider text-sun-400">{c.h}</p><ul className="mt-4 space-y-2.5">{c.links.map(([l, to]) => <li key={l}><Link to={to} className="text-sm text-cream/75 hover:text-white">{l}</Link></li>)}</ul></div>
          ))}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-sun-400">Follow us</p>
            <ul className="mt-4 space-y-2.5">
              {[['Facebook', Globe], ['Instagram', Camera], ['Telegram', Send], ['YouTube', Tv]].map(([l, I]) => <li key={l}><a href="#" className="flex items-center gap-2 text-sm text-cream/75 hover:text-white"><I className="h-4 w-4" /> {l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-cream/60 sm:flex-row">
          <p>©{new Date().getFullYear()} Bright Academy. All rights reserved. · Demo build — see <Link to="/costs" className="underline hover:text-white">Services & Costs</Link></p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 hover:bg-white/10"><ArrowUp className="h-3.5 w-3.5" /> Back to Top</button>
        </div>
      </div>
    </footer>
  )
}
