// Runs daily on Netlify (free plan) so the free Supabase project never hits 7 days idle and auto-pauses.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../src/lib/cloud-config.js'

export default async () => {
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  const results = {}
  for (const [name, url] of Object.entries({
    db: `${SUPABASE_URL}/rest/v1/records?select=id&collection=eq.reviews&limit=1`,
    auth: `${SUPABASE_URL}/auth/v1/health`,
  })) {
    try { const r = await fetch(url, { headers }); results[name] = r.status } catch (e) { results[name] = `error: ${e.message}` }
  }
  console.log('[keepalive]', new Date().toISOString(), JSON.stringify(results))
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } })
}

export const config = { schedule: '@daily' }
