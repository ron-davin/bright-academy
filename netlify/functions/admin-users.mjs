// Admin-only account management. The Supabase service key lives only in the Netlify env var SUPABASE_SERVICE_KEY.
import { SUPABASE_URL } from '../../src/lib/cloud-config.js'

const KEY = process.env.SUPABASE_SERVICE_KEY
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const api = async (method, path, body, extra = {}) => {
  const r = await fetch(SUPABASE_URL + path, { method, headers: { ...H, ...extra }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = t ? JSON.parse(t) : null } catch { d = t }
  if (!r.ok) throw new Error(d?.msg || d?.message || d?.error_description || `${r.status}`)
  return d
}
const ROLES = ['admin', 'teacher', 'student']

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' })
  if (!KEY) return json(500, { error: 'Server is missing SUPABASE_SERVICE_KEY' })
  // 1) who is calling?
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'Not signed in' })
  let caller
  try { caller = await api('GET', '/auth/v1/user', null, { Authorization: `Bearer ${token}` }) } catch { return json(401, { error: 'Session expired — please log in again' }) }
  const [prof] = await api('GET', `/rest/v1/profiles?id=eq.${caller.id}&select=role`)
  if (prof?.role !== 'admin') return json(403, { error: 'Only the academy admin can manage accounts' })

  const body = await req.json().catch(() => ({}))
  try {
    switch (body.action) {
      case 'create': {
        const { email, password, name, role, data = {} } = body
        if (!email || !password || !name || !ROLES.includes(role)) return json(400, { error: 'Name, email, password and role are required' })
        if (password.length < 8) return json(400, { error: 'Password must be at least 8 characters' })
        const user = await api('POST', '/auth/v1/admin/users', { email: email.trim().toLowerCase(), password, email_confirm: true, user_metadata: { name, role, data } })
        await api('POST', '/rest/v1/profiles', { id: user.id, email: user.email, name, role, data: { active: true, ...data } }, { Prefer: 'resolution=merge-duplicates' })
        return json(200, { id: user.id })
      }
      case 'update': {
        const { id, name, email, data } = body
        if (!id) return json(400, { error: 'Missing id' })
        if (email) await api('PUT', `/auth/v1/admin/users/${id}`, { email: email.trim().toLowerCase(), email_confirm: true })
        const [cur] = await api('GET', `/rest/v1/profiles?id=eq.${id}&select=data`)
        const patch = { ...(name ? { name } : {}), ...(email ? { email: email.trim().toLowerCase() } : {}), ...(data ? { data: { ...(cur?.data || {}), ...data } } : {}) }
        await api('PATCH', `/rest/v1/profiles?id=eq.${id}`, patch)
        return json(200, { ok: true })
      }
      case 'reset-password': {
        if (!body.id || (body.password || '').length < 8) return json(400, { error: 'Password must be at least 8 characters' })
        await api('PUT', `/auth/v1/admin/users/${body.id}`, { password: body.password })
        return json(200, { ok: true })
      }
      case 'set-active': {
        const { id, active } = body
        if (id === caller.id) return json(400, { error: 'You cannot deactivate your own account' })
        await api('PUT', `/auth/v1/admin/users/${id}`, { ban_duration: active ? 'none' : '876000h' })
        const [cur] = await api('GET', `/rest/v1/profiles?id=eq.${id}&select=data`)
        await api('PATCH', `/rest/v1/profiles?id=eq.${id}`, { data: { ...(cur?.data || {}), active: !!active } })
        return json(200, { ok: true })
      }
      default: return json(400, { error: 'Unknown action' })
    }
  } catch (e) {
    return json(400, { error: /already been registered|already exists/i.test(e.message) ? 'An account with this email already exists' : e.message })
  }
}
