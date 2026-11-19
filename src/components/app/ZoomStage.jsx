// Zoom Video SDK video area for the classroom. Video/audio/screen share run on Zoom's network; chat, board and
// attendance stay in the classroom's own side panel. The join token is signed by netlify/functions/zoom.mjs.
import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Volume2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/cloud.js'
import { toast } from '../../lib/store.js'
import { Button } from '../ui/index.jsx'
import { cn, initials } from '../../lib/utils.js'

// The SDK client is a singleton; serialise join/leave so React's dev double-mount can't overlap them.
let lock = Promise.resolve()
const reason = (e) => e?.reason || e?.message || (typeof e === 'string' ? e : 'Could not connect to Zoom')

export default function ZoomStage({ sessionId, onLeave, onFallback }) {
  const [status, setStatus] = useState('connecting') // connecting | joined | reconnecting | ended | error
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [selfId, setSelfId] = useState(null)
  const [mic, setMic] = useState(false)
  const [cam, setCam] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareUser, setShareUser] = useState(null)
  const [needsTap, setNeedsTap] = useState(false)
  const client = useRef(null)
  const stream = useRef(null)
  const sdk = useRef(null)
  const audioOn = useRef(false)
  const attached = useRef(new Map()) // userId -> video-player element
  const sync = useRef(Promise.resolve())
  const selfShareRef = useRef(null)
  const shareTileRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const run = lock.then(async () => {
      if (cancelled) return
      try {
        const { data } = await supabase.auth.getSession()
        const res = await fetch('/.netlify/functions/zoom', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ sessionId }) })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || `Zoom is unavailable (${res.status})`)
        if (cancelled) return
        sdk.current = await import('@zoom/videosdk')
        const c = sdk.current.default.createClient(); client.current = c
        await c.init('en-US', 'Global', { patchJsMedia: true, leaveOnPageUnload: true, stayAwake: true })
        const refresh = () => { if (!cancelled) setUsers([...c.getAllUser()]) }
        c.on('user-added', refresh); c.on('user-removed', refresh); c.on('user-updated', refresh); c.on('peer-video-state-change', refresh)
        c.on('active-share-change', ({ state, userId }) => setShareUser(state === 'Active' ? userId : null))
        c.on('passively-stop-share', () => setSharing(false))
        c.on('auto-play-audio-failed', () => setNeedsTap(true))
        c.on('connection-change', ({ state }) => setStatus(state === 'Closed' ? 'ended' : state === 'Reconnecting' ? 'reconnecting' : state === 'Connected' ? 'joined' : 'error'))
        await c.join(body.topic, body.token, body.userName, '', 20)
        if (cancelled) { await c.leave().catch(() => {}); return }
        stream.current = c.getMediaStream()
        setSelfId(c.getCurrentUserInfo()?.userId); setStatus('joined'); refresh()
        try { await stream.current.startAudio(); audioOn.current = true; setMic(true) } catch { toast({ title: 'Microphone unavailable', desc: 'Check browser permissions — you can still listen.', type: 'error' }) }
        try { await stream.current.startVideo(); setCam(true) } catch { toast({ title: 'Camera unavailable', desc: 'Others will see your initials instead.', type: 'error' }) }
        refresh()
      } catch (e) { if (!cancelled) { setStatus('error'); setError(reason(e)) } }
    })
    lock = run.catch(() => {})
    return () => {
      cancelled = true
      lock = lock.then(async () => {
        const c = client.current; if (!c) return
        try { await c.leave() } catch { /* not joined */ }
        try { sdk.current?.default.destroyClient() } catch { /* noop */ }
        client.current = null; stream.current = null; attached.current.clear()
      })
    }
  }, [sessionId])

  // Attach / detach camera videos as people turn cameras on and off (serialised to avoid double attaches)
  useEffect(() => {
    const s = stream.current, Q = sdk.current?.VideoQuality
    if (!s || !Q) return
    sync.current = sync.current.then(async () => {
      for (const u of users) {
        const tile = document.querySelector(`[data-zoom-tile="${u.userId}"]`)
        const has = attached.current.has(u.userId)
        if (u.bVideoOn && !has && tile) {
          const el = await s.attachVideo(u.userId, users.length > 2 ? Q.Video_360P : Q.Video_720P).catch(() => null)
          if (el?.nodeType) { tile.appendChild(el); attached.current.set(u.userId, el) }
        } else if (!u.bVideoOn && has) {
          await s.detachVideo(u.userId).catch(() => {}); attached.current.get(u.userId)?.remove(); attached.current.delete(u.userId)
        }
      }
      for (const id of [...attached.current.keys()]) if (!users.some((u) => u.userId === id)) { await s.detachVideo(id).catch(() => {}); attached.current.get(id)?.remove(); attached.current.delete(id) }
    }).catch(() => {})
  }, [users])

  // Someone else's screen share
  useEffect(() => {
    const s = stream.current, tile = shareTileRef.current
    if (!s || !tile) return
    if (shareUser && shareUser !== selfId) {
      s.attachShareView(shareUser).then((el) => { if (el?.nodeType) { tile.replaceChildren(el) } }).catch(() => {})
      return () => { s.detachShareView?.(shareUser).catch?.(() => {}); tile.replaceChildren() }
    }
  }, [shareUser, selfId])

  const toggleMic = async () => {
    const s = stream.current; if (!s) return
    try {
      if (!audioOn.current) { await s.startAudio(); audioOn.current = true; setMic(true) }
      else if (mic) { await s.muteAudio(); setMic(false) } else { await s.unmuteAudio(); setMic(true) }
    } catch (e) { toast({ title: 'Microphone problem', desc: reason(e), type: 'error' }) }
  }
  const toggleCam = async () => {
    const s = stream.current; if (!s) return
    try { if (cam) { await s.stopVideo(); setCam(false) } else { await s.startVideo(); setCam(true) } setUsers([...client.current.getAllUser()]) } catch (e) { toast({ title: 'Camera problem', desc: reason(e), type: 'error' }) }
  }
  const toggleShare = async () => {
    const s = stream.current; if (!s) return
    try {
      if (sharing) { await s.stopShareScreen(); setSharing(false); return }
      const host = selfShareRef.current; host.replaceChildren()
      const el = document.createElement(s.isStartShareScreenWithVideoElement() ? 'video' : 'canvas'); el.className = 'h-full w-full'
      host.appendChild(el)
      await s.startShareScreen(el); setSharing(true)
    } catch (e) { if (!/cancel|denied|permission/i.test(reason(e))) toast({ title: 'Could not share screen', desc: reason(e), type: 'error' }) }
  }
  const tapForSound = async () => { setNeedsTap(false); try { await stream.current?.startAudio(); audioOn.current = true; setMic(true) } catch { /* noop */ } }

  if (status === 'error' || status === 'ended') return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg font-semibold">{status === 'ended' ? 'The class has ended.' : 'Zoom could not connect'}</p>
      {error && <p className="max-w-md text-sm text-white/70">{error}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        {status === 'error' && <Button variant="sun" onClick={() => window.location.reload()}>Try again</Button>}
        {status === 'error' && <Button variant="light" onClick={onFallback}>Use the backup room</Button>}
        <Button variant="light" onClick={() => onLeave(false)}>Leave</Button>
      </div>
    </div>
  )

  const remoteShare = shareUser && shareUser !== selfId
  return (
    <div className="flex flex-1 flex-col p-3">
      {status !== 'joined' && <p className="mb-2 flex items-center justify-center gap-2 text-sm text-white/70"><Loader2 className="h-4 w-4 animate-spin" /> {status === 'reconnecting' ? 'Reconnecting to Zoom…' : 'Connecting to Zoom…'}</p>}
      {needsTap && <button type="button" onClick={tapForSound} className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-sun-400 px-4 py-2.5 text-sm font-semibold text-ink"><Volume2 className="h-4 w-4" /> Tap to turn on sound</button>}
      <video-player-container className={cn('zoom-share mb-3 block overflow-hidden rounded-xl bg-black', !remoteShare && 'hidden')}><div ref={shareTileRef} className="aspect-video w-full" /></video-player-container>
      <video-player-container className={cn('grid flex-1 content-start gap-3', users.length <= 1 ? 'mx-auto w-full max-w-2xl grid-cols-1' : users.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3', remoteShare && 'max-h-40 grid-cols-3 sm:grid-cols-4 xl:grid-cols-6')}>
        {users.map((u) => (
          <div key={u.userId} className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-900">
            {!u.bVideoOn && <div className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white">{initials(u.displayName)}</span></div>}
            <div data-zoom-tile={u.userId} className={cn('zoom-tile absolute inset-0', u.userId === selfId && 'zoom-self')} />
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white">{u.muted !== false && <MicOff className="h-3 w-3 text-coral-300" />}{u.displayName}{u.userId === selfId ? ' (you)' : ''}</span>
          </div>
        ))}
        {status === 'joined' && users.length <= 1 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">Waiting for others to join…</p>}
      </video-player-container>
      <div ref={selfShareRef} className="pointer-events-none fixed -left-[9999px] top-0 h-[360px] w-[640px]" aria-hidden />
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={toggleMic} disabled={status !== 'joined'} className={cn('rounded-full p-3.5 disabled:opacity-40', mic ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}>{mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}</button>
        <button type="button" onClick={toggleCam} disabled={status !== 'joined'} className={cn('rounded-full p-3.5 disabled:opacity-40', cam ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label={cam ? 'Turn camera off' : 'Turn camera on'}>{cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}</button>
        <button type="button" onClick={toggleShare} disabled={status !== 'joined'} className={cn('rounded-full p-3.5 disabled:opacity-40', sharing ? 'bg-brand-500' : 'bg-white/10 hover:bg-white/20')} aria-label={sharing ? 'Stop sharing' : 'Share screen'} title={sharing ? 'Stop sharing' : 'Share screen'}><MonitorUp className="h-5 w-5" /></button>
        <button type="button" onClick={() => onLeave(true)} className="rounded-full bg-coral-500 px-6 py-3.5 hover:bg-coral-600" aria-label="Leave"><PhoneOff className="h-5 w-5" /></button>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40">Video by Zoom</p>
    </div>
  )
}
