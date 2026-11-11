import puppeteer from 'puppeteer-core'
const SITE = 'https://bright-academy-online.netlify.app'
const OUT = new URL('./shots/', import.meta.url).pathname
const [, , ADMIN_PW] = process.argv
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'], defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 } })

async function newPage(mobile = false) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  if (mobile) await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  return page
}
const hideBadge = (page) => page.evaluate(() => { document.querySelectorAll('#nl-badge-frame').forEach((e) => (e.style.display = 'none')); for (const el of document.querySelectorAll('body *')) { if (getComputedStyle(el).position === 'fixed' && /Powered by/i.test(el.textContent || '') && !el.closest('#root')) el.style.display = 'none' } document.querySelectorAll('[data-netlify-deploy-id], netlify-drawer, #netlify-drawer').forEach((e) => (e.style.display = 'none')) })
async function shot(page, name, opts = {}) { await sleep(opts.wait ?? 700); await hideBadge(page); await page.screenshot({ path: `${OUT}${name}.png`, fullPage: !!opts.full }); console.log('  ✓', name) }
async function dshot(page, name) {
  const vp = page.viewport(); await page.setViewport({ ...vp, height: 1700 }); await sleep(600); await hideBadge(page)
  const el = await page.$('[role=dialog] > div:nth-child(2)'); await el.screenshot({ path: `${OUT}${name}.png` }); console.log('  ✓', name, '(dialog)')
  await page.setViewport(vp); await sleep(300)
}
const go = async (page, path) => { await page.goto(SITE + path, { waitUntil: 'networkidle0' }); await sleep(1200) }
const clickText = (page, text, sel = 'button') => page.evaluate((text, sel) => { const scope = document.querySelector('[role=dialog]') || document; const el = [...scope.querySelectorAll(sel)].find((b) => b.textContent.trim() === text || b.textContent.trim().startsWith(text)); if (!el) throw new Error('not found: ' + text); el.click() }, text, sel)
const setSelect = (page, idx, matcher) => page.evaluate((idx, matcher) => { const dlg = document.querySelector('[role=dialog]'); const s = dlg.querySelectorAll('select')[idx]; const o = [...s.options].find((o) => o.value === matcher || o.textContent.startsWith(matcher)); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) }, idx, matcher)
const checkLabel = (page, text) => page.evaluate((text) => { [...document.querySelector('[role=dialog]').querySelectorAll('label')].find((l) => l.textContent.includes(text)).querySelector('input').click() }, text)
const esc = async (page) => { await page.keyboard.press('Escape'); await sleep(300) }

async function login(page, email, pw, shotName) {
  await go(page, '/login')
  await page.type('input[type=email]', email, { delay: 15 })
  await page.type('input[type=password]', pw, { delay: 15 })
  if (shotName) await shot(page, shotName)
  await page.click('button[type=submit]')
  await sleep(4500)
  console.log('  logged in →', page.url())
}

// ---------------- PUBLIC ----------------
console.log('public')
{ const p = await newPage(); await go(p, '/'); await shot(p, 'public-home'); await p.evaluate(() => document.getElementById('trial').scrollIntoView()); await shot(p, 'public-trial'); await p.close() }

// ---------------- ADMIN ----------------
console.log('admin')
{
  const p = await newPage()
  await login(p, 'admin@bright.academy', ADMIN_PW, 'login')
  if (!p.url().includes('/admin')) throw new Error('Admin login failed — check password')
  await go(p, '/admin/schedule'); await shot(p, 'admin-schedule', { wait: 1500 })
  // New class (filled, not saved)
  await clickText(p, 'New class'); await sleep(500)
  await clickText(p, 'Math'); await sleep(200)
  await setSelect(p, 0, 'Daniel Cruz'); await checkLabel(p, 'Mia Tan'); await sleep(200)
  await setSelect(p, 1, '2'); await setSelect(p, 2, '15:00'); await sleep(500)
  await dshot(p, 'admin-newclass')
  // conflict: Monday 4 PM = Daniel already teaches Liam
  await setSelect(p, 1, '1'); await setSelect(p, 2, '16:00'); await sleep(500)
  await dshot(p, 'admin-conflict')
  await esc(p)
  // Session panel
  await p.click('button[aria-label="Next week"]'); await sleep(800)
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /\d:\d\d [AP]M/.test(x.textContent) && x.className.includes('absolute') && x.textContent.includes('Math')); b.click() }); await sleep(500)
  await dshot(p, 'admin-session-panel')
  await clickText(p, 'Move this session'); await dshot(p, 'admin-session-move'); await esc(p)
  // Extra class
  await clickText(p, 'Extra class'); await sleep(400); await setSelect(p, 1, 'Sara Kim'); await dshot(p, 'admin-extra-class'); await esc(p)
  // Filtered by teacher (availability shading)
  await p.evaluate(() => { const s = document.querySelector('main select'); const o = [...s.options].find((o) => o.textContent === 'Daniel Cruz'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) })
  await shot(p, 'admin-schedule-filter', { wait: 1000 })
  await go(p, '/admin/classes'); await shot(p, 'admin-classes')
  await go(p, '/admin/people'); await shot(p, 'admin-people-students')
  await clickText(p, 'Teachers'); await shot(p, 'admin-people-teachers')
  await clickText(p, 'Add teacher'); await sleep(400)
  await p.evaluate(() => { const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) }; const i = document.querySelectorAll('[role=dialog] input'); set(i[0], 'Example Teacher'); set(i[1], 'example.teacher@bright.academy') })
  await clickText(p, 'Science'); await dshot(p, 'admin-add-person'); await esc(p)
  await p.evaluate(() => { const row = [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Availability'); row.click() }); await dshot(p, 'admin-availability'); await esc(p)
  await p.evaluate(() => { const b = [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Password'); b.click() }); await dshot(p, 'admin-reset-password'); await esc(p)
  await go(p, '/admin/requests'); await shot(p, 'admin-requests')
  await go(p, '/settings'); await shot(p, 'settings')
  await p.close()
}

// ---------------- TEACHER ----------------
console.log('teacher')
{
  const p = await newPage()
  await login(p, 'math@bright.academy', 'demo1234', 'login-teacher')
  await go(p, '/teacher'); await shot(p, 'teacher-today', { wait: 1200 })
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Lesson notes') || [...document.querySelectorAll('main .cursor-pointer')][0]; b.click() }); await sleep(500)
  await dshot(p, 'teacher-lesson-notes'); await esc(p)
  await go(p, '/teacher/schedule'); await shot(p, 'teacher-schedule', { wait: 1500 })
  await go(p, '/teacher/students'); await shot(p, 'teacher-students')
  await go(p, '/teacher/availability'); await shot(p, 'teacher-availability')
  const sid = await p.evaluate(() => { const st = window.__ba.getState(); const me = st.me(); return st.sessions.filter((s) => s.teacherId === me.id && s.status === 'scheduled' && new Date(s.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0]?.id })
  await go(p, `/class/${sid}`); await shot(p, 'teacher-classroom-prejoin')
  await p.close()
}

// ---------------- STUDENT ----------------
console.log('student')
{
  const p = await newPage()
  await login(p, 'liam@bright.academy', 'demo1234', 'login-student')
  await go(p, '/student'); await shot(p, 'student-today', { wait: 1200 })
  await go(p, '/student/schedule'); await shot(p, 'student-schedule')
  await go(p, '/student/classes'); await shot(p, 'student-classes')
  const sid = await p.evaluate(() => { const st = window.__ba.getState(); const me = st.me(); return st.sessions.filter((s) => s.studentIds.includes(me.id) && s.status === 'scheduled' && new Date(s.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0]?.id })
  await go(p, `/class/${sid}`); await shot(p, 'student-classroom-prejoin')
  await clickText(p, 'Join the session'); await sleep(7000); await shot(p, 'classroom-in-room')
  await p.type('input[placeholder="Message the class…"]', 'Hello! Ready for class.', { delay: 10 }); await p.keyboard.press('Enter'); await shot(p, 'classroom-chat')
  await clickText(p, 'Board'); await sleep(500)
  const c = await p.$('canvas'); const bx = await c.boundingBox()
  const stroke = async (pts) => { await p.mouse.move(bx.x + pts[0][0], bx.y + pts[0][1]); await p.mouse.down(); for (const [x, y] of pts.slice(1)) await p.mouse.move(bx.x + x, bx.y + y, { steps: 6 }); await p.mouse.up() }
  await stroke([[40, 60], [120, 60], [80, 60], [80, 140]]); await stroke([[150, 140], [180, 60], [210, 140]]); await stroke([[160, 110], [200, 110]]); await stroke([[240, 100], [300, 100]]); await stroke([[270, 70], [270, 130]])
  await shot(p, 'classroom-whiteboard')
  await p.close()
  const m = await newPage(true)
  await login(m, 'liam@bright.academy', 'demo1234')
  await go(m, '/student'); await shot(m, 'student-mobile-today', { wait: 1200 })
  await go(m, '/student/schedule'); await shot(m, 'student-mobile-schedule')
  await m.close()
}
await browser.close()
console.log('done')
