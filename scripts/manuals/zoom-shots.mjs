// Screenshots of the Zoom classroom feature from the local dev server (npm run dev), demo data only, no writes.
// The Netlify function is simulated: GET reports Zoom as connected; POST returns a placeholder token, which Zoom
// rejects — that shows the "couldn't connect / backup room" screen. A real call needs the Zoom SDK keys.
import puppeteer from 'puppeteer-core'
import { readFileSync, mkdirSync } from 'node:fs'
import { SUPABASE_URL } from '../../src/lib/cloud-config.js'
import { buildStateFromRows } from '../../src/lib/cloud.js'

const SITE = process.env.SITE || 'http://localhost:5173'
const OUT = process.argv[2] || new URL('./shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const key = readFileSync(new URL('../../.supabase-service-key.local', import.meta.url), 'utf8').trim().split('\n').pop().trim()
const get = async (p) => { for (let i = 0; ; i++) { try { const r = await fetch(SUPABASE_URL + p, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) }); return await r.json() } catch (e) { if (i >= 4) throw e; await sleep(2000) } } }
const DATA = buildStateFromRows(await get('/rest/v1/profiles?select=*'), await get('/rest/v1/records?select=*&limit=5000'))
const demo = new Set(DATA.users.filter((u) => /@bright\.academy$/.test(u.email)).map((u) => u.id))
const ok = (x) => demo.has(x.teacherId) && (x.studentIds || []).every((id) => demo.has(id))
DATA.users = DATA.users.filter((u) => demo.has(u.id)); DATA.classes = DATA.classes.filter(ok); DATA.sessions = DATA.sessions.filter(ok); DATA.leads = []
const by = (email) => DATA.users.find((u) => u.email === email)

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--hide-scrollbars'], defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 } })
async function as(email) {
  const page = await (await browser.createBrowserContext()).newPage()
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    if (r.url().includes('/.netlify/functions/zoom')) return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(r.method() === 'GET' ? { configured: true } : { token: 'placeholder.token.sig', topic: 'ba-demo', userName: 'Daniel Cruz', host: true }) })
    if (/supabase\.co/.test(r.url()) && !['GET', 'HEAD', 'OPTIONS'].includes(r.method())) return r.abort()
    r.continue()
  })
  await page.goto(SITE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => window.__ba?.getState().ready, { timeout: 120000 })
  await page.evaluate((state, id) => window.__ba.setState({ ...state, currentUserId: id }), DATA, by(email).id)
  return page
}
const go = (page, path) => page.evaluate((p) => { history.pushState({}, '', p); dispatchEvent(new PopStateEvent('popstate')) }, path).then(() => sleep(1200))
const hideToasts = (page) => page.evaluate(() => document.querySelectorAll('[role=status], .toast, [data-toast]').forEach((e) => e.remove()))

// 1) Admin › Settings › Video classroom
{ const p = await as('admin@bright.academy'); await go(p, '/settings'); await sleep(800)
  const card = await p.evaluateHandle(() => [...document.querySelectorAll('.app-card')].find((c) => c.textContent.includes('Video classroom')))
  await card.screenshot({ path: OUT + 'zoom-admin-setting.png' }); console.log('✓ zoom-admin-setting') }

// Teacher › Today card and session panel with "Start Zoom session" + "Built-in room"
{ const p = await as('math@bright.academy'); await go(p, '/teacher'); await sleep(1500)
  await p.screenshot({ path: OUT + 'zoom-teacher-today.png' }); console.log('✓ zoom-teacher-today')
  await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Lesson notes').click()); await sleep(800)
  const dlg = await p.$('[role=dialog] > div:nth-child(2)'); await dlg.screenshot({ path: OUT + 'zoom-teacher-panel.png' }); console.log('✓ zoom-teacher-panel') }
{ const p = await as('liam@bright.academy'); await go(p, '/student'); await sleep(1500)
  await p.screenshot({ path: OUT + 'zoom-student-today.png' }); console.log('✓ zoom-student-today') }

// 2) Teacher › classroom join screen (Zoom mode) → 3) Zoom fails with placeholder keys → backup option
{ const p = await as('math@bright.academy')
  const me = by('math@bright.academy')
  const sess = DATA.sessions.filter((s) => s.teacherId === me.id && s.status === 'scheduled' && new Date(s.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0]
  await go(p, `/class/${sess.id}`); await sleep(1500)
  await p.screenshot({ path: OUT + 'zoom-prejoin.png' }); console.log('✓ zoom-prejoin')
  await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Start class & join|Join the session/.test(b.textContent)).click())
  await sleep(2500); await hideToasts(p); await p.screenshot({ path: OUT + 'zoom-connecting.png' }); console.log('✓ zoom-connecting')
  await p.waitForFunction(() => /could not connect/i.test(document.body.innerText), { timeout: 45000 }).catch(() => {})
  await sleep(500); await hideToasts(p); await p.screenshot({ path: OUT + 'zoom-fallback.png' }); console.log('✓ zoom-fallback') }
await browser.close()
