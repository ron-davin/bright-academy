# Bright Academy

Live online classes in **Math, Science, English (ESL), Computer Programming, Qur'an, Arabic and Islamic Studies**.

**Live site:** https://bright-academy-online.netlify.app

## Roles
| Role | Can do |
|---|---|
| **Admin** | Schedule (week calendar for everyone), Classes, People (create/edit accounts, reset passwords, deactivate, teacher availability), Requests (free-trial form) |
| **Teacher** | Today (next class + Start), Schedule, Students, Availability, lesson topic / homework / attendance |
| **Student** | Today (next class + Join, homework), Schedule, My classes |

There is no public sign-up: the admin creates every account and shares the login details.

## Scheduling (admin)
1. **Schedule → New class** (or click an empty time on the calendar): subject → teacher → student(s) → weekly days & times → start date.
2. The form checks the next 8 weeks for clashes (teacher or student double-booked → blocked) and warns when outside the teacher's availability.
3. Saving creates the sessions for the next 8 weeks (kept topped up automatically).
4. Click any session to **move** it, **change the teacher** for that day, **cancel/restore** it, or **edit the whole class** (future sessions are regenerated; past ones stay).
5. **Extra class** adds a single make-up or trial session.

## Tech
Vite + React 19 + Tailwind v4 + Zustand, Supabase (auth, Postgres with row-level security, realtime) and Netlify (hosting + functions). Live classroom = WebRTC video/chat/whiteboard signalled over Supabase Realtime, with a Jitsi fallback.

- `src/lib/schedule.js` — pure scheduling logic (expansion, top-up, conflicts, availability)
- `src/lib/store.js` / `src/lib/cloud.js` — state + Supabase sync
- `netlify/functions/admin-users.mjs` — admin-only account management (uses `SUPABASE_SERVICE_KEY` env var on Netlify)
- `netlify/functions/supabase-keepalive.mjs` — daily ping so the free Supabase project never pauses
- `scripts/seed-cloud.mjs` — demo data (keeps all leads)

```bash
npm install
npm run dev
npm run build && npx netlify-cli deploy --prod --dir dist --functions netlify/functions --site <site-id>
```

## Costs
Everything runs on free tiers (Netlify, Supabase, public STUN servers). Paid upgrades only if needed: Supabase Pro (~$25/mo), a TURN relay for very strict networks, a custom domain (~$10–15/yr).
