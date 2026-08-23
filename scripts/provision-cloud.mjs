#!/usr/bin/env node
// One-shot Supabase provisioning via the Management API.
// Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/provision-cloud.mjs
// Creates the project, applies supabase/schema.sql, enables instant signups,
// fetches API keys, writes src/lib/cloud-config.js, and prints the seed command.
import { readFileSync, writeFileSync } from 'node:fs'
import crypto from 'node:crypto'

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
if (!TOKEN) { console.error('Set SUPABASE_ACCESS_TOKEN'); process.exit(1) }
const API = 'https://api.supabase.com'
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
const j = async (method, path, body) => {
  const r = await fetch(API + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  const text = await r.text()
  let data; try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  return data
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const run = async () => {
  console.log('→ Listing organizations…')
  const orgs = await j('GET', '/v1/organizations')
  if (!orgs.length) throw new Error('No organization found on this account.')
  const org = orgs[0]
  console.log(`  Using org: ${org.name} (${org.id})`)

  console.log('→ Checking for existing project…')
  const projects = await j('GET', '/v1/projects')
  let project = projects.find((p) => p.name === 'bright-academy')
  let dbPass = null
  if (!project) {
    dbPass = 'BA_' + crypto.randomBytes(18).toString('base64url')
    console.log('→ Creating project bright-academy (Free tier, Singapore)…')
    project = await j('POST', '/v1/projects', { organization_id: org.id, name: 'bright-academy', region: 'ap-southeast-1', db_pass: dbPass })
    writeFileSync('.supabase-db-password.local', `Supabase project bright-academy DB password (only needed for direct Postgres connections; resettable in dashboard):\n${dbPass}\n`)
    console.log('  DB password saved to .supabase-db-password.local (git-ignored).')
  } else console.log('  Found existing project, reusing.')
  const ref = project.id || project.ref
  console.log(`  Project ref: ${ref}`)

  process.stdout.write('→ Waiting for project to come online')
  for (let i = 0; i < 60; i++) {
    const p = await j('GET', `/v1/projects/${ref}`)
    if ((p.status || '').includes('ACTIVE')) { console.log(` ✓ (${p.status})`); break }
    process.stdout.write('.'); await sleep(6000)
    if (i === 59) throw new Error('Timed out waiting for project to become active.')
  }
  await sleep(5000)

  console.log('→ Applying schema.sql…')
  const sql = readFileSync('supabase/schema.sql', 'utf8')
  await j('POST', `/v1/projects/${ref}/database/query`, { query: sql })
  console.log('  Schema applied.')

  console.log('→ Enabling instant signups (email confirmation off)…')
  await j('PATCH', `/v1/projects/${ref}/config/auth`, { mailer_autoconfirm: true })

  console.log('→ Fetching API keys…')
  let keys = await j('GET', `/v1/projects/${ref}/api-keys?reveal=true`).catch(() => j('GET', `/v1/projects/${ref}/api-keys`))
  const anon = keys.find((k) => k.name === 'anon')?.api_key
  const service = keys.find((k) => k.name === 'service_role')?.api_key
  if (!anon) throw new Error('Could not read anon key: ' + JSON.stringify(keys).slice(0, 300))
  const url = `https://${ref}.supabase.co`

  console.log('→ Writing src/lib/cloud-config.js…')
  let cfg = readFileSync('src/lib/cloud-config.js', 'utf8')
  cfg = cfg.replace(/export const SUPABASE_URL = '[^']*'/, `export const SUPABASE_URL = '${url}'`)
  cfg = cfg.replace(/export const SUPABASE_ANON_KEY = '[^']*'/, `export const SUPABASE_ANON_KEY = '${anon}'`)
  writeFileSync('src/lib/cloud-config.js', cfg)

  writeFileSync('.supabase-service-key.local', `${service || ''}\n`)
  console.log('\n✔ Provisioning done.')
  console.log(`  URL:  ${url}`)
  console.log('  anon key written to cloud-config.js; service key → .supabase-service-key.local (git-ignored)')
  console.log('\nNext: seed + deploy:')
  console.log(`  SUPABASE_URL=${url} SUPABASE_SERVICE_KEY=$(cat .supabase-service-key.local) node scripts/seed-cloud.mjs && npm run deploy`)
}
run().catch((e) => { console.error('\n✖ ' + e.message); process.exit(1) })
