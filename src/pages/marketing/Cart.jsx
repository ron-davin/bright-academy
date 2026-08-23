import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Trash2, Lock, CreditCard, Check, PartyPopper } from 'lucide-react'
import { COURSES } from '../../lib/data.js'
import { useStore, useUI, useCurrentUser, childrenOf, toast, EMPTY } from '../../lib/store.js'
import { Avatar, Button, EmptyState, Input, Select } from '../../components/ui/index.jsx'
import { money, cn } from '../../lib/utils.js'

const planOf = (c, id) => c.plans.find((p) => p.id === id) || c.plans[0]

export function computeTotals(items, users) {
  const subtotal = items.reduce((n, i) => n + planOf(COURSES.find((c) => c.id === i.courseId), i.plan).price, 0)
  // per-child multi-course discount (only 2x+/week plans qualify)
  const byChild = {}
  items.forEach((i) => { (byChild[i.studentId || 'unassigned'] ||= []).push(i) })
  let discount = 0
  Object.values(byChild).forEach((list) => {
    const qual = list.filter((i) => planOf(COURSES.find((c) => c.id === i.courseId), i.plan).perWeek >= 2)
    const rate = qual.length >= 3 ? 0.15 : qual.length === 2 ? 0.1 : 0
    discount += qual.reduce((n, i) => n + planOf(COURSES.find((c) => c.id === i.courseId), i.plan).price, 0) * rate
  })
  const childCount = Object.keys(byChild).filter((k) => k !== 'unassigned').length
  if (childCount >= 2) discount += subtotal * 0.1
  return { subtotal, discount: Math.round(discount * 100) / 100, total: Math.round((subtotal - discount) * 100) / 100 }
}

export default function Cart() {
  const user = useCurrentUser()
  const users = useStore((s) => s.users)
  const cart = useStore((s) => (s.currentUserId ? s.carts[s.currentUserId] || EMPTY : EMPTY))
  const { updateCartItem, removeFromCart } = useStore()
  const openAuth = useUI((s) => s.openAuth)
  const nav = useNavigate()
  const kids = user?.role === 'parent' ? childrenOf({ users }, user.id) : []
  const totals = computeTotals(cart, users)
  if (!user) return <section className="container-x py-24"><EmptyState icon={ShoppingCart} title="Your cart lives in your account" desc="Sign in to add courses and check out." action={<Button onClick={() => openAuth('signin', '/cart')}>Sign in</Button>} /></section>
  if (cart.length === 0) return <section className="container-x py-24"><EmptyState icon={ShoppingCart} title="Your cart is empty" desc="Browse our Quran, Arabic and Islamic Studies programs to get started." action={<Button to="/courses">Browse courses</Button>} /></section>
  return (
    <section className="container-x py-14">
      <h1 className="font-display text-4xl font-black text-ink">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {cart.map((item) => { const c = COURSES.find((x) => x.id === item.courseId); const plan = planOf(c, item.plan); return (
            <div key={item.id} className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3"><span className="text-2xl">{c.emoji}</span><div><Link to={`/courses/${c.slug}`} className="font-bold text-ink hover:text-brand-700">{c.title}</Link><p className="text-sm text-ink/60">{c.subject} · {c.type === 'group' ? 'Group' : '1-on-1'}</p></div></div>
                <button type="button" onClick={() => removeFromCart(user.id, item.id)} className="rounded-lg p-2 text-ink/40 hover:bg-coral-500/10 hover:text-coral-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Select label="Plan" value={item.plan} onChange={(e) => updateCartItem(user.id, item.id, { plan: e.target.value })}>{c.plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.perWeek}×/wk — {money(p.price)}/mo</option>)}</Select>
                <Select label="For which child?" value={item.studentId || ''} onChange={(e) => updateCartItem(user.id, item.id, { studentId: e.target.value || null })}><option value="">Choose child…</option>{kids.map((k) => <option key={k.id} value={k.id}>{k.name} ({k.age})</option>)}</Select>
                <div className="flex items-end justify-end"><p className="text-2xl font-bold text-ink">{money(plan.price)}<span className="text-sm font-normal text-ink/50">/mo</span></p></div>
              </div>
            </div>) })}
          <p className="text-xs text-ink/50">Discounts: 10% for 2 courses (2×+/week) per child · 15% for 3+ · extra 10% sibling discount for 2+ children.</p>
        </div>
        <div className="h-fit rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
          <h2 className="text-lg font-bold text-ink">Summary</h2>
          <div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span className="text-ink/60">Subtotal</span><span className="font-semibold">{money(totals.subtotal, { cents: true })}</span></p>
            <p className="flex justify-between"><span className="text-ink/60">Discounts</span><span className="font-semibold text-emerald-700">−{money(totals.discount, { cents: true })}</span></p>
            <p className="flex justify-between border-t border-ink/8 pt-3 text-base"><span className="font-semibold">Total / month</span><span className="text-xl font-black text-ink">{money(totals.total, { cents: true })}</span></p></div>
          <Button className="mt-5 w-full" onClick={() => { if (cart.some((i) => !i.studentId) && kids.length) return toast({ title: 'Choose a child for each course', type: 'warning' }); nav('/checkout') }}>Proceed to checkout</Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink/50"><Lock className="h-3 w-3" /> Demo checkout — no real payment is processed</p>
        </div>
      </div>
    </section>
  )
}

export function Checkout() {
  const user = useCurrentUser()
  const users = useStore((s) => s.users)
  const cartStored = useStore((s) => (s.currentUserId ? s.carts[s.currentUserId] || EMPTY : EMPTY))
  const { checkout, addChild } = useStore()
  const openAuth = useUI((s) => s.openAuth)
  const [params] = useSearchParams()
  const nav = useNavigate()
  const direct = params.get('course') ? [{ id: 'direct', courseId: params.get('course'), plan: params.get('plan') || 'growth', studentId: null }] : null
  const [items, setItems] = useState(direct || cartStored)
  const [payf, setPayf] = useState({ name: user?.name || '', card: '4242 4242 4242 4242', exp: '12/28', cvc: '123' })
  const [newChild, setNewChild] = useState({ name: '', age: '' })
  const [done, setDone] = useState(null)
  const kids = user?.role === 'parent' ? childrenOf({ users }, user.id) : []
  const totals = computeTotals(items, users)
  if (!user) return <section className="container-x py-24"><EmptyState icon={Lock} title="Sign in to check out" action={<Button onClick={() => openAuth('signin', '/checkout')}>Sign in</Button>} /></section>
  if (done) return (
    <section className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg rounded-3xl border border-ink/8 bg-white p-10 text-center shadow-card">
        <PartyPopper className="mx-auto h-12 w-12 text-sun-500" />
        <h1 className="mt-4 font-display text-3xl font-black text-ink">Enrollment confirmed!</h1>
        <p className="mt-3 text-ink/70">Payment {done.invoice} of <b>{money(done.total, { cents: true })}</b> processed (demo). Weekly sessions were generated and added to your schedule — the teacher has been notified.</p>
        <div className="mt-6 flex justify-center gap-3"><Button to="/parent/schedule">View schedule</Button><Button variant="outline" to="/parent/dashboard">Go to dashboard</Button></div>
      </div>
    </section>
  )
  const setStudent = (id, studentId) => setItems((list) => list.map((i) => (i.id === id ? { ...i, studentId } : i)))
  const pay = () => {
    let its = items
    if (its.some((i) => !i.studentId)) {
      if (newChild.name) { const c = addChild(user.id, newChild); its = its.map((i) => (i.studentId ? i : { ...i, studentId: c.id })) }
      else if (kids.length === 1) its = its.map((i) => ({ ...i, studentId: kids[0].id }))
      else return toast({ title: 'Assign each course to a child', desc: 'Pick a child for every course, or add one below.', type: 'warning' })
    }
    const p = checkout({ parentId: user.id, items: its.map(({ courseId, plan, studentId, slots }) => ({ courseId, plan, studentId, slots })), ...computeTotals(its, users), method: `Demo card •••• ${payf.card.slice(-4)}` })
    setDone(p)
  }
  return (
    <section className="container-x py-14">
      <h1 className="font-display text-4xl font-black text-ink">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
            <h2 className="font-bold text-ink">1 · Assign students</h2>
            <div className="mt-4 space-y-3">{items.map((i) => { const c = COURSES.find((x) => x.id === i.courseId); return (
              <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-ink/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-ink">{c.emoji} {c.title} <span className="text-sm text-ink/50">· {planOf(c, i.plan).name}</span></p>
                <Select value={i.studentId || ''} onChange={(e) => setStudent(i.id, e.target.value || null)} className="sm:w-52"><option value="">Choose child…</option>{kids.map((k) => <option key={k.id} value={k.id}>{k.name} ({k.age})</option>)}</Select>
              </div>) })}</div>
            <div className="mt-4 grid gap-3 rounded-xl bg-ink/4 p-4 sm:grid-cols-[1.6fr_0.6fr_auto]">
              <Input label="Add a new child (optional)" placeholder="Child's full name" value={newChild.name} onChange={(e) => setNewChild((x) => ({ ...x, name: e.target.value }))} />
              <Input label="Age" type="number" placeholder="9" value={newChild.age} onChange={(e) => setNewChild((x) => ({ ...x, age: e.target.value }))} />
              <div className="flex items-end"><Button variant="outline" onClick={() => { if (!newChild.name) return; const c = addChild(user.id, newChild); setNewChild({ name: '', age: '' }); toast({ title: `${c.firstName} added`, type: 'success' }) }}>Add child</Button></div>
            </div>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 font-bold text-ink"><CreditCard className="h-4 w-4" /> 2 · Payment (demo)</h2>
            <p className="mt-1 rounded-lg bg-sun-400/15 px-3 py-2 text-xs text-sun-600">Demo mode: no real charge. In production this would be Stripe/PayPal (≈2.9% + $0.30 per transaction).</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Name on card" value={payf.name} onChange={(e) => setPayf((x) => ({ ...x, name: e.target.value }))} />
              <Input label="Card number" value={payf.card} onChange={(e) => setPayf((x) => ({ ...x, card: e.target.value }))} />
              <Input label="Expiry" value={payf.exp} onChange={(e) => setPayf((x) => ({ ...x, exp: e.target.value }))} />
              <Input label="CVC" value={payf.cvc} onChange={(e) => setPayf((x) => ({ ...x, cvc: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="h-fit rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">{items.map((i) => { const c = COURSES.find((x) => x.id === i.courseId); return <p key={i.id} className="flex justify-between gap-4"><span className="text-ink/70">{c.title}</span><span className="font-semibold">{money(planOf(c, i.plan).price)}</span></p> })}
            <p className="flex justify-between border-t border-ink/8 pt-2"><span className="text-ink/60">Discounts</span><span className="font-semibold text-emerald-700">−{money(totals.discount, { cents: true })}</span></p>
            <p className="flex justify-between text-base"><span className="font-semibold">Total / month</span><span className="text-xl font-black">{money(totals.total, { cents: true })}</span></p></div>
          <Button variant="sun" className="mt-5 w-full" onClick={pay}><Lock className="h-4 w-4" /> Pay {money(totals.total, { cents: true })} (demo)</Button>
          <p className="mt-3 text-center text-xs text-ink/50">Auto-renews monthly · Cancel anytime · First-lesson guarantee</p>
        </div>
      </div>
    </section>
  )
}
