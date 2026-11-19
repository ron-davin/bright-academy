// Zoom Video SDK: signs short-lived join tokens. The SDK secret lives only in the Netlify env vars
// ZOOM_SDK_KEY / ZOOM_SDK_SECRET; the browser never sees it.
//   GET  → { configured }                       (public: tells the classroom whether Zoom can be used)
//   POST { sessionId } + Bearer <supabase JWT>  → { token, topic, userName, host }
import crypto from 'node:crypto'
import { SUPABASE_URL } from '../../src/lib/cloud-config.js'

const SB_KEY = process.env.SUPABASE_SERVICE_KEY
const ZOOM_KEY = process.env.ZOOM_SDK_KEY
const ZOOM_SECRET = process.env.ZOOM_SDK_SECRET
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
const sb = async (path, auth) => {
  const r = await fetch(SUPABASE_URL + path, { headers: { apikey: SB_KEY, Authorization: `Bearer ${auth || SB_KEY}` } })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}
const b64url = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url')

// https://developers.zoom.us/docs/video-sdk/auth/
export function signVideoSdkJwt({ key, secret, topic, host, identity, ttlSec = 2 * 3600 }) {
  const iat = Math.floor(Date.now() / 1000) - 30
  const payload = { app_key: key, version: 1, role_type: host ? 1 : 0, tpc: topic, user_identity: identity, iat, exp: iat + ttlSec }
  const head = b64url({ alg: 'HS256', typ: 'JWT' }) + '.' + b64url(payload)
  return head + '.' + crypto.createHmac('sha256', secret).update(head).digest('base64url')
}
export const topicFor = (sessionId) => `ba-${String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '')}`.slice(0, 200)

export default async (req) => {
  const configured = !!(ZOOM_KEY && ZOOM_SECRET && SB_KEY)
  if (req.method === 'GET') return json(200, { configured })
  if (req.method !== 'POST') return json(405, { error: 'GET or POST only' })
  if (!configured) return json(501, { error: 'Zoom is not set up yet' })

  const auth = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!auth) return json(401, { error: 'Not signed in' })
  let caller
  try { caller = await sb('/auth/v1/user', auth) } catch { return json(401, { error: 'Session expired — please log in again' }) }
  const { sessionId } = await req.json().catch(() => ({}))
  if (!sessionId) return json(400, { error: 'Missing sessionId' })

  const [[prof], [row]] = await Promise.all([
    sb(`/rest/v1/profiles?id=eq.${caller.id}&select=role,name,data`),
    sb(`/rest/v1/records?id=eq.${encodeURIComponent('sessions:' + sessionId)}&select=data`),
  ])
  const sess = row?.data
  if (!prof || prof.data?.active === false) return json(403, { error: 'This account is deactivated' })
  if (!sess) return json(404, { error: 'Class not found' })
  const isAdmin = prof.role === 'admin'
  const isTeacher = sess.teacherId === caller.id
  if (!isAdmin && !isTeacher && !(sess.studentIds || []).includes(caller.id)) return json(403, { error: 'You are not in this class' })
  if (sess.status === 'cancelled') return json(409, { error: 'This class was cancelled' })
  // Only during class time (opens 15 min early, closes 30 min after) so Zoom minutes can't be used outside lessons
  const now = Date.now(), start = new Date(sess.start).getTime(), end = new Date(sess.end).getTime()
  if (!isAdmin && (now < start - 15 * 6e4 || now > end + 30 * 6e4)) return json(409, { error: 'This class is not open right now' })

  const topic = topicFor(sessionId)
  const token = signVideoSdkJwt({ key: ZOOM_KEY, secret: ZOOM_SECRET, topic, host: isTeacher, identity: caller.id })
  return json(200, { token, topic, userName: (prof.name || 'Guest').slice(0, 60), host: isTeacher })
}
