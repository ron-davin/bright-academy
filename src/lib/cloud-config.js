// ============================================================
// Bright Academy — cloud (Supabase) configuration
// ------------------------------------------------------------
// Fill these two values to switch the deployed site from
// "local demo mode" to real shared accounts (cloud mode):
//   1. Create a free project at https://supabase.com  (Free tier)
//   2. Project Settings → Data API: copy the Project URL + anon public key
//   3. Paste them below, run the SQL in supabase/schema.sql, then `npm run deploy`
// The anon key is designed to be public — data is protected by Row Level Security.
// ============================================================
export const SUPABASE_URL = ''      // e.g. 'https://abcdefgh.supabase.co'
export const SUPABASE_ANON_KEY = '' // e.g. 'eyJhbGciOi…'

export const CLOUD_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
