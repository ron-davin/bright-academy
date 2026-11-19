// Which video engine classes use: Zoom (when its keys are on the server and the admin hasn't picked
// the built-in room) or the free built-in WebRTC room.
import { useEffect, useState } from 'react'
import { useStore } from './store.js'

let statusPromise = null
export const zoomConfigured = () => (statusPromise ||= fetch('/.netlify/functions/zoom').then((r) => (r.ok ? r.json() : {})).then((b) => !!b.configured).catch(() => false))

export function useZoomOn() {
  const setting = useStore((s) => s.settings?.video)
  const [ready, setReady] = useState(null)
  useEffect(() => { let live = true; zoomConfigured().then((v) => live && setReady(v)); return () => { live = false } }, [])
  return !!ready && setting !== 'builtin'
}

export const classUrl = (sessionId, builtin) => `/class/${sessionId}${builtin ? '?room=builtin' : ''}`
