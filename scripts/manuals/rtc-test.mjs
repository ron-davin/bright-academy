// Two-party classroom test on the live site: teacher + student in separate headless browsers with fake cameras.
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'
import { SUPABASE_URL } from '../../src/lib/cloud-config.js'
import { buildStateFromRows } from '../../src/lib/cloud.js'
const SITE = process.argv[2] || 'https://bright-academy-online.netlify.app'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const key = readFileSync(new URL('../../.supabase-service-key.local', import.meta.url), 'utf8').trim().split('\n').pop().trim()
const get = (p) => fetch(SUPABASE_URL + p, { headers: { apikey: key, Authorization: `Bearer ${key}` } }).then((r) => r.json())
const DATA = buildStateFromRows(await get('/rest/v1/profiles?select=*'), await get('/rest/v1/records?select=*&limit=5000'))
const teacher = DATA.users.find((u) => u.email === 'math@bright.academy'), student = DATA.users.find((u) => u.email === 'liam@bright.academy')
const sess = DATA.sessions.filter((s) => s.teacherId === teacher.id && s.studentIds.includes(student.id) && s.status === 'scheduled' && new Date(s.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0]
console.log('session', sess.id, sess.subjectId, sess.start)

const extra = process.argv.includes('--relay-only') ? ['--force-webrtc-ip-handling-policy=disable_non_proxied_udp'] : []
async function party(user, label) {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', ...extra] })
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(() => { const O = window.RTCPeerConnection; window.__pcs = []; window.RTCPeerConnection = function (...a) { const pc = new O(...a); window.__pcs.push(pc); return pc }; window.RTCPeerConnection.prototype = O.prototype })
  await page.setRequestInterception(true)
  page.on('request', (r) => (/supabase\.co/.test(r.url()) && !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ? r.abort() : r.continue()))
  page.on('console', (m) => { if (/\[rtc\]|error/i.test(m.text())) console.log(`  [${label}]`, m.text().slice(0, 150)) })
  await page.goto(SITE + '/', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForFunction(() => window.__ba?.getState().ready, { timeout: 90000 })
  await page.evaluate((state, id) => window.__ba.setState({ ...state, currentUserId: id }), DATA, user.id)
  await page.evaluate((p) => { history.pushState({}, '', p); dispatchEvent(new PopStateEvent('popstate')) }, `/class/${sess.id}`)
  await sleep(1500)
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Start class & join|Join the session/.test(b.textContent)).click())
  return { browser, page, label }
}
const t = await party(teacher, 'teacher'); await sleep(1500)
const s = await party(student, 'student')
const report = (p) => p.page.evaluate(async () => {
  const pcs = window.__pcs.filter((pc) => pc.connectionState !== 'closed')
  const out = []
  for (const pc of pcs) {
    const st = await pc.getStats(); let pair = null; const c = {}
    st.forEach((r) => { c[r.id] = r; if (r.type === 'transport' && r.selectedCandidatePairId) pair = r.selectedCandidatePairId })
    const sel = pair && c[pair]; const local = sel && c[sel.localCandidateId], remote = sel && c[sel.remoteCandidateId]
    const inbound = [...st.values()].filter((r) => r.type === 'inbound-rtp').map((r) => `${r.kind}:${r.bytesReceived}B${r.framesDecoded != null ? '/' + r.framesDecoded + 'f' : ''}`)
    out.push({ state: pc.connectionState, path: local ? `${local.candidateType}/${local.protocol} ↔ ${remote.candidateType}` : '-', inbound })
  }
  const vids = [...document.querySelectorAll('video')].map((v) => ({ muted: v.muted, w: v.videoWidth, h: v.videoHeight, playing: !v.paused && v.readyState >= 2 }))
  return { pcs: out, vids, peersText: document.body.innerText.match(/Liam Santos|Daniel Cruz/g) }
})
for (let i = 0; i < 10; i++) { await sleep(2000); const r = await report(s); if (r.pcs.some((x) => x.state === 'connected')) break }
await sleep(4000)
// chat check
await s.page.type('input[placeholder="Message the class…"]', 'ping from student', { delay: 5 }); await s.page.keyboard.press('Enter'); await sleep(1500)
const chatSeen = await t.page.evaluate(() => document.body.innerText.includes('ping from student'))
console.log('teacher:', JSON.stringify(await report(t)))
console.log('student:', JSON.stringify(await report(s)))
console.log('chat delivered to teacher:', chatSeen)
await t.page.screenshot({ path: process.env.SHOT || '/tmp/rtc-teacher.png' })
await t.browser.close(); await s.browser.close()
