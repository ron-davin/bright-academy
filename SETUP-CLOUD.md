# Turn on real accounts (cloud mode) — ~5 minutes

The site currently runs in **local demo mode** (each browser has its own sandbox). To make accounts and data real and shared across devices, connect the free Supabase backend:

## 1. Create the project (you do this — needs your account)
1. Go to https://supabase.com → **Start your project** → sign in (GitHub works) → **New project** (Free plan).
2. Name it `bright-academy`, pick a region near your students, set any strong DB password.

## 2. Run the schema
- In the dashboard: **SQL Editor → New query** → paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. You should see "Success".

## 3. Make signups instant (recommended for a demo)
- **Authentication → Sign In / Providers → Email** → turn **off** "Confirm email" → Save.

## 4. Connect the app
- **Project Settings → Data API**: copy the **Project URL** and the **anon public** key.
- Paste them into [`src/lib/cloud-config.js`](src/lib/cloud-config.js) (the two constants at the top) — or just send them to Claude in chat and it will finish everything below for you.

## 5. Seed the demo data (optional but nice)
- **Project Settings → API keys**: copy the **service_role** key (keep it secret — never commit it), then run locally:
```bash
SUPABASE_URL=https://YOURREF.supabase.co SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-cloud.mjs
```
This creates the three demo logins (`teacher/parent/student@bright.academy` · `demo1234`) as real cloud users plus all the sample courses activity. Re-run any time to refresh dates.

## 6. Deploy
```bash
npm run deploy
```

That's it. The live site now has real sign-ups, cross-device logins, live-syncing messages/homework/bookings (Supabase Realtime), and visitors can still choose **"Explore local demo"** for a private sandbox.

**Free tier limits (fine for a demo/small academy):** 500 MB database, 50k monthly active users, 2 projects, pauses after 1 week of inactivity (just click "Restore" in the dashboard). Paid starts at ~$25/mo — see the in-app Services & Costs page.

**Security note (demo-tier):** row-level security keeps strangers out of your data, but permissions are intentionally coarse (any participant of a record can edit it, catalog data is world-readable). A production academy would tighten policies per table and add a server-side layer for payments/payouts.
