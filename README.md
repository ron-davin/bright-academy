# Bright Academy 🎓

**Live Quran, Arabic & Islamic Studies classes for kids & teens** — an outcome-driven online academy platform (marketing site + teacher/parent/student portals + live classroom), inspired by darstop.com and rebuilt around Islamic subjects only.

**Live demo:** https://ron-davin.github.io/bright-academy/

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@bright.academy` | `demo1234` |
| Parent | `parent@bright.academy` | `demo1234` |
| Student | `student@bright.academy` | `demo1234` |

Or use the one-click **demo buttons** on the Sign In dialog. You can also create your own accounts.

**Two modes, auto-detected:**
- **Local demo mode** (default until Supabase is connected): everything is stored in your browser's localStorage. *Settings → Account → Reset demo data* restores the seed.
- **Cloud mode** (real accounts): connect a free Supabase project — see **[SETUP-CLOUD.md](SETUP-CLOUD.md)** — and the same site gets real cross-device sign-ups, a shared Postgres database with row-level security, and live realtime sync (messages, homework, bookings update across open browsers instantly). Visitors can still opt into a private local sandbox via "Explore local demo".

## What's inside

- **Marketing site** — home, course catalog with filters, course pages (calendar + plans + reviews), teacher profiles, results, pricing, FAQ, free-trial wizard, course-finder quiz, become-a-teacher application, cart & demo checkout with multi-course/sibling discounts.
- **Teacher portal** — dashboard (today's classes, active session, alerts), sessions with lesson-topic + plan generator, monthly schedule, availability editor, trial assessments, reschedule requests, lessons, homework review & grading, students, groups, course proposals, recordings, completion approvals → printable certificates, earnings & wallet, performance, post-lesson feedback.
- **Parent portal** — children, enrollments (pause/resume), wishlist, schedule, trials & assessment reports, attendance, progress, homework, certificates, teacher feedback, payments, messaging.
- **Student portal** — gamified dashboard (streaks/points), sessions, homework submission, progress + completion requests, certificates, messaging.
- **Live classroom** — free peer-to-peer WebRTC video (PeerJS + public STUN), screen share, **shared whiteboard**, class chat, attendance, local recording (MediaRecorder), session timer, end-of-class flow into feedback. One-click **Jitsi Meet fallback** link per class.

## Tech

Vite + React 19 + Tailwind CSS v4 + React Router 7 + Zustand (persisted to localStorage) + date-fns + PeerJS + lucide-react. 100% static — deployable on any static host.

```bash
npm install
npm run dev       # http://localhost:5173/bright-academy/
npm run build     # outputs dist/
npm run deploy    # build + push dist/ to the gh-pages branch
```

## Free services used now vs. production costs

This demo intentionally runs at **$0/month**. The in-app **Services & Costs** page (`/costs`) carries the full breakdown; summary:

| Capability | Free (now) | Production (approx.) |
|---|---|---|
| Hosting | GitHub Pages | Free; custom domain ~$10–15/yr |
| Backend / DB / auth | Browser localStorage — **or Supabase free tier (wired in, see SETUP-CLOUD.md)** | Supabase Pro ~$25/mo when you outgrow free |
| Live video | PeerJS P2P + Jitsi fallback | Managed video (LiveKit/Daily/100ms) ~$0.004–0.007 per participant-min; or self-hosted Jitsi/LiveKit VPS ~$20–40/mo; TURN for strict NATs |
| Recording & storage | Local file recording | ~$0.0135/min recording + S3/Backblaze storage |
| Payments | Simulated checkout | Stripe ~2.9% + $0.30 per charge; payouts via Stripe Connect/Wise |
| Email/SMS/push | In-app only | Resend/Brevo free tier → ~$10–20/mo; Twilio SMS per-message |
| AI lesson-plan assistant | Template generator | LLM API usage-billed (typically ≪ $0.05 per plan) |

> Prices are ballpark figures — verify current pricing before committing.

## Notes & limitations

- All data (accounts, bookings, messages) lives **per-browser**; two visitors don't see each other's changes. A real deployment needs the backend above.
- Client-side auth is demo-grade (hashed into localStorage) — do not reuse passwords you care about.
- P2P video works on typical home networks; strict school/corporate firewalls need a TURN server or a managed video provider.
- Teacher photos use placeholder names.
