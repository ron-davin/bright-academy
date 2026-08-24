import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Circle, Square, MessageSquare, PenTool, Users, NotebookPen, Send, Eraser, Trash2, ExternalLink, Copy, Clock, ShieldCheck, LogIn } from 'lucide-react'
import { useStore, useCurrentUser, useUI, toast } from '../../lib/store.js'
import { supabase, cloudActive } from '../../lib/cloud.js'
import { Avatar, Badge, Button, Dialog, Input, asset } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, fmtTime, initials, uid } from '../../lib/utils.js'

const roomName = (sessionId) => `room-${String(sessionId).replace(/[^a-zA-Z0-9-]/g, '')}`
// Free connectivity: three independent public STUN providers (probed live 2026-08).
// For very strict/symmetric NATs add TURN credentials below (free Metered account = 20GB/mo) — see /costs.
const TURN_SERVERS = [] // e.g. [{ urls: 'turn:xx.relay.metered.ca:443', username: '…', credential: '…' }]
const ICE = { iceServers: [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  ...TURN_SERVERS,
], iceCandidatePoolSize: 2 }
const waitForIce = (pc, ms = 3000) => new Promise((resolve) => {
  if (pc.iceGatheringState === 'complete') return resolve()
  const timer = setTimeout(resolve, ms)
  pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(timer); resolve() } })
})

function useTimer(startedAt) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.max(0, Math.floor((now - startedAt) / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function VideoTile({ stream, name, muted, self, off, link }) {
  const ref = useRef(null)
  const [needsTap, setNeedsTap] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    el.srcObject = stream
    el.muted = !!muted
    el.play().catch(() => { el.muted = true; el.play().catch(() => {}); if (!muted) setNeedsTap(true) })
  }, [stream, muted])
  const unmute = () => { if (ref.current) { ref.current.muted = false; ref.current.play().catch(() => {}) } setNeedsTap(false) }
  const hasVideo = stream && stream.getVideoTracks().some((t) => t.enabled !== false) && !off
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-950">
      {hasVideo ? <video ref={ref} autoPlay playsInline className={cn('h-full w-full object-cover', self && 'scale-x-[-1]')} /> : (
        <div className="flex h-full w-full items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white">{initials(name)}</span></div>
      )}
      {stream && !hasVideo && <audio autoPlay ref={(el) => { if (el && stream) { el.srcObject = stream; el.play?.().catch(() => {}) } }} />}
      {needsTap && <button type="button" onClick={unmute} className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">🔊 Tap for sound</button>}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white">{name}{self ? ' (you)' : ''}</span>
      {!self && link && link !== 'connected' && <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-sun-300">{link === 'failed' ? 'reconnecting…' : `${link}…`}</span>}
    </div>
  )
}

function Whiteboard({ send, bus }) {
  const canvasRef = useRef(null)
  const [color, setColor] = useState('#0B2F40')
  const [size, setSize] = useState(3)
  const [erase, setErase] = useState(false)
  const drawing = useRef(false)
  const current = useRef(null)
  const strokes = useRef([])
  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
    for (const s of strokes.current) { ctx.strokeStyle = s.erase ? '#ffffff' : s.color; ctx.lineWidth = s.erase ? s.size * 6 : s.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x * c.width, y * c.height) : ctx.moveTo(x * c.width, y * c.height))); ctx.stroke() }
  }, [])
  useEffect(() => { const c = canvasRef.current; if (!c) return; const resize = () => { const r = c.parentElement.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; redraw() }; resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize) }, [redraw])
  useEffect(() => { if (!bus) return; return bus.subscribe((msg) => { if (msg.type === 'stroke') { strokes.current.push(msg.stroke); redraw() } else if (msg.type === 'wb-clear') { strokes.current = []; redraw() } }) }, [bus, redraw])
  const pos = (e) => { const r = canvasRef.current.getBoundingClientRect(); const t = e.touches?.[0] || e; return [(t.clientX - r.left) / r.width, (t.clientY - r.top) / r.height] }
  const start = (e) => { drawing.current = true; current.current = { color, size, erase, points: [pos(e)] } }
  const move = (e) => { if (!drawing.current || !current.current) return; e.preventDefault(); current.current.points.push(pos(e)); strokes.current = [...strokes.current.filter((s) => s !== current.current), current.current]; redraw() }
  const end = () => { if (!drawing.current || !current.current) return; drawing.current = false; if (current.current.points.length > 1) send({ type: 'stroke', stroke: current.current }); current.current = null }
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/8 p-2">
        {['#0B2F40', '#0078A0', '#E5484D', '#F8A018', '#059669'].map((c) => <button key={c} type="button" onClick={() => { setColor(c); setErase(false) }} className={cn('h-6 w-6 rounded-full border-2', color === c && !erase ? 'border-ink' : 'border-transparent')} style={{ background: c }} aria-label={`Color ${c}`} />)}
        <button type="button" onClick={() => setErase((e) => !e)} className={cn('rounded-lg border p-1.5', erase ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink/15 text-ink/60')} aria-label="Eraser"><Eraser className="h-4 w-4" /></button>
        <input type="range" min="1" max="10" value={size} onChange={(e) => setSize(+e.target.value)} className="w-20" aria-label="Brush size" />
        <button type="button" onClick={() => { strokes.current = []; redraw(); send({ type: 'wb-clear' }) }} className="ml-auto rounded-lg border border-ink/15 p-1.5 text-ink/60 hover:text-coral-600" aria-label="Clear board"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="relative flex-1 bg-white">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair touch-none" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>
      <p className="border-t border-ink/8 p-2 text-center text-[11px] text-ink/45">Shared whiteboard — everyone in the room sees your strokes live.</p>
    </div>
  )
}

export default function Classroom() {
  const { sessionId } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const user = useCurrentUser()
  const openAuth = useUI((s) => s.openAuth)
  const sess = useStore((s) => s.sessions.find((x) => x.id === sessionId))
  const users = useStore((s) => s.users)
  const cloudReady = useStore((s) => s.cloudReady)
  const { startSession, endSession, markAttendance } = useStore()
  const isTeacher = user?.role === 'teacher' && user?.teacherId === sess?.teacherId
  const cloud = cloudActive() && !!supabase

  const [joined, setJoined] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [mediaError, setMediaError] = useState('')
  const [peers, setPeers] = useState({}) // peerId -> {name, role, stream}
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [tab, setTab] = useState(params.get('tab') || 'chat')
  const [chat, setChat] = useState([])
  const [msg, setMsg] = useState('')
  const [connState, setConnState] = useState('idle')
  const [endOpen, setEndOpen] = useState(false)

  const myIdRef = useRef(uid('p'))
  const channelRef = useRef(null)
  const pcsRef = useRef({})           // peerId -> RTCPeerConnection
  const presentRef = useRef({})       // peerId -> {name, role}
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const wbSubs = useRef(new Set())
  const startedAtRef = useRef(Date.now())
  const timer = useTimer(startedAtRef.current)
  const course = sess && courseOf(sess.courseId)
  const myName = user?.name || 'Guest'

  const wbBus = useMemo(() => ({ subscribe: (fn) => { wbSubs.current.add(fn); return () => wbSubs.current.delete(fn) }, emit: (m) => wbSubs.current.forEach((fn) => fn(m)) }), [])
  const sendWb = useCallback((m) => { wbBus.emit(m); channelRef.current?.send({ type: 'broadcast', event: 'wb', payload: m }) }, [wbBus])
  const sendSignal = useCallback((payload) => channelRef.current?.send({ type: 'broadcast', event: 'rtc', payload }), [])

  const addLocalMedia = useCallback((pc, isInitiator) => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current))
    else if (isInitiator) { pc.addTransceiver('audio', { direction: 'recvonly' }); pc.addTransceiver('video', { direction: 'recvonly' }) }
  }, [])

  const ensurePc = useCallback((theirId) => {
    if (pcsRef.current[theirId]) return pcsRef.current[theirId]
    const pc = new RTCPeerConnection(ICE)
    pcsRef.current[theirId] = pc
    pc.ontrack = (e) => { const stream = e.streams[0] || new MediaStream([e.track]); setPeers((p) => ({ ...p, [theirId]: { ...(p[theirId] || {}), stream } })) }
    pc.onconnectionstatechange = () => {
      const cs = pc.connectionState
      setPeers((p) => (p[theirId] ? { ...p, [theirId]: { ...p[theirId], link: cs } } : p))
      if (cs === 'connected') pc.getStats().then((stats) => stats.forEach((r) => { if (r.type === 'candidate-pair' && r.nominated && (r.selected || r.state === 'succeeded')) console.info('[rtc] media path connected', r.id) })).catch(() => {})
      if (cs === 'failed') {
        try { pc.close() } catch { /* noop */ }
        delete pcsRef.current[theirId]
        setTimeout(() => { if (channelRef.current && presentRef.current[theirId] && myIdRef.current < theirId) initiateTo(theirId) }, 1500)
      }
    }
    return pc
  }, [sendSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  const initiateTo = useCallback(async (theirId) => {
    try {
      const pc = ensurePc(theirId)
      if (pc.signalingState !== 'stable' || pc.localDescription) return
      addLocalMedia(pc, true)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await waitForIce(pc) // non-trickle: all candidates ride in ONE message (avoids realtime rate limits)
      sendSignal({ to: theirId, from: myIdRef.current, sdp: { type: pc.localDescription.type, sdp: pc.localDescription.sdp }, name: myName })
    } catch (e) { console.warn('[rtc] offer failed', e) }
  }, [addLocalMedia, ensurePc, myName, sendSignal])

  const onSignal = useCallback(async (payload) => {
    if (!payload || payload.to !== myIdRef.current) return
    const { from, sdp, candidate, name } = payload
    if (name) setPeers((p) => ({ ...p, [from]: { ...(p[from] || {}), name } }))
    try {
      if (sdp?.type === 'offer') {
        const pc = ensurePc(from)
        await pc.setRemoteDescription(sdp)
        addLocalMedia(pc, false)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await waitForIce(pc)
        sendSignal({ to: from, from: myIdRef.current, sdp: { type: pc.localDescription.type, sdp: pc.localDescription.sdp }, name: myName })
      } else if (sdp?.type === 'answer') {
        const pc = pcsRef.current[from]; if (pc && !pc.currentRemoteDescription) await pc.setRemoteDescription(sdp)
      } else if (candidate) {
        pcsRef.current[from]?.addIceCandidate(candidate).catch(() => {})
      }
    } catch (e) { console.warn('[rtc] signal failed', e) }
  }, [addLocalMedia, ensurePc, myName, sendSignal])

  const onPresence = useCallback(() => {
    const stateObj = channelRef.current?.presenceState() || {}
    const roster = {}
    for (const [key, metas] of Object.entries(stateObj)) if (key !== myIdRef.current) roster[key] = { name: metas[0]?.name || 'Participant', role: metas[0]?.role }
    presentRef.current = roster
    setPeers((prev) => {
      const next = {}
      for (const [id, meta] of Object.entries(roster)) next[id] = { ...meta, stream: prev[id]?.stream }
      return next
    })
    for (const id of Object.keys(pcsRef.current)) if (!roster[id]) { try { pcsRef.current[id].close() } catch { /* noop */ } delete pcsRef.current[id] }
    for (const id of Object.keys(roster)) if (!pcsRef.current[id] && myIdRef.current < id) initiateTo(id)
  }, [initiateTo])

  const join = useCallback(async () => {
    setConnState('connecting')
    let stream = null
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
    try { stream = await withTimeout(navigator.mediaDevices.getUserMedia({ video: true, audio: true }), 6000) } catch { try { stream = await withTimeout(navigator.mediaDevices.getUserMedia({ audio: true }), 3000) } catch { setMediaError('Camera/mic unavailable — joining without media. Check browser permissions, then rejoin.') } }
    streamRef.current = stream; setLocalStream(stream)
    if (!cloud) { setJoined(true); setConnState('local'); if (isTeacher) startSession(sessionId); return }
    const ch = supabase.channel(roomName(sessionId), { config: { presence: { key: myIdRef.current }, broadcast: { self: false } } })
    channelRef.current = ch
    ch.on('presence', { event: 'sync' }, onPresence)
    ch.on('broadcast', { event: 'rtc' }, ({ payload }) => onSignal(payload))
    ch.on('broadcast', { event: 'chat' }, ({ payload }) => setChat((c) => [...c, payload]))
    ch.on('broadcast', { event: 'wb' }, ({ payload }) => wbBus.emit(payload))
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') { await ch.track({ name: myName, role: user.role }); setJoined(true); setConnState('connected'); if (isTeacher) { startSession(sessionId); toast({ title: 'Classroom is live', desc: 'Students can join now.', type: 'success' }) } }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { setConnState('error'); setMediaError('Could not reach the realtime service. Check your connection, or use "Open in Jitsi" below.') }
    })
  }, [cloud, isTeacher, myName, onPresence, onSignal, sessionId, startSession, user, wbBus])

  useEffect(() => () => {
    Object.values(pcsRef.current).forEach((pc) => { try { pc.close() } catch { /* noop */ } })
    pcsRef.current = {}
    if (channelRef.current && supabase) supabase.removeChannel(channelRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    try { recorderRef.current?.stop?.() } catch { /* noop */ }
  }, [])

  if (!user) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-brand-950 p-6 text-white">
      <img src={asset('logo-mark-t.png')} alt="" className="h-14 w-14 rounded-2xl bg-white/95 object-contain p-1.5" />
      <p className="text-lg font-semibold">Please sign in to join the classroom</p>
      <p className="max-w-sm text-center text-sm text-white/60">Use your Bright Academy account — teachers, students and parents can all join their own classes.</p>
      <Button variant="sun" onClick={() => openAuth('signin', `/classroom/${sessionId}`)}><LogIn className="h-4 w-4" /> Sign in</Button>
      <Link to="/" className="text-sm text-white/60 hover:text-white">← Back to home</Link>
    </div>
  )
  if (!sess && cloud && !cloudReady) return <div className="flex min-h-svh items-center justify-center bg-brand-950 text-white"><p>Loading session…</p></div>
  if (!sess) return <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-brand-950 text-white"><p>Session not found (or not yours to join).</p><Button variant="light" onClick={() => nav(-1)}>Go back</Button></div>

  const toggleMic = () => { const t = streamRef.current?.getAudioTracks?.()[0]; if (t) { t.enabled = !t.enabled; setMic(t.enabled) } }
  const toggleCam = () => { const t = streamRef.current?.getVideoTracks?.()[0]; if (t) { t.enabled = !t.enabled; setCam(t.enabled) } }
  const share = async () => {
    if (sharing || !streamRef.current) return
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const track = display.getVideoTracks()[0]
      Object.values(pcsRef.current).forEach((pc) => { const sender = pc.getSenders().find((s) => s.track?.kind === 'video'); if (sender) sender.replaceTrack(track) })
      setSharing(true)
      track.onended = () => { const camTrack = streamRef.current?.getVideoTracks?.()[0]; Object.values(pcsRef.current).forEach((pc) => { const sender = pc.getSenders().find((s) => s.track?.kind === 'video' || s.track === track); if (sender && camTrack) sender.replaceTrack(camTrack) }); setSharing(false) }
    } catch { /* cancelled */ }
  }
  const record = async () => {
    if (recording) { recorderRef.current?.stop(); setRecording(false); return }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      const rec = new MediaRecorder(display); const chunks = []
      rec.ondataavailable = (e) => chunks.push(e.data)
      rec.onstop = () => { const blob = new Blob(chunks, { type: 'video/webm' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `bright-academy-${sessionId}.webm`; a.click(); display.getTracks().forEach((t) => t.stop()); toast({ title: 'Recording saved to your downloads', type: 'success' }) }
      rec.start(); recorderRef.current = rec; setRecording(true)
      toast({ title: 'Local recording started', desc: 'Free, on-device. Cloud recording is a paid service — see Costs.', type: 'info' })
    } catch { /* cancelled */ }
  }
  const sendChat = (e) => { e.preventDefault(); if (!msg.trim()) return; const m = { from: myName, text: msg.trim(), at: new Date().toISOString() }; setChat((c) => [...c, m]); channelRef.current?.send({ type: 'broadcast', event: 'chat', payload: m }); setMsg('') }
  const leave = () => { if (isTeacher) setEndOpen(true); else nav(-1) }
  const confirmEnd = (finish) => {
    setEndOpen(false)
    if (finish) { endSession(sessionId, { recorded: recording || undefined, durationMin: Math.round((Date.now() - startedAtRef.current) / 60000) || 45 }); toast({ title: 'Session marked complete', desc: 'Now fill in the lesson feedback.', type: 'success' }); nav('/teacher/feedback') }
    else nav(-1)
  }
  const jitsiUrl = `https://meet.jit.si/BrightAcademy-${roomName(sessionId)}`
  const students = sess.studentIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  if (!joined) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-brand-950 p-6 text-white">
      <img src={asset('logo-mark-t.png')} alt="" className="h-16 w-16 rounded-2xl bg-white/95 object-contain p-1.5" />
      <div className="text-center"><h1 className="font-display text-3xl font-black">{course?.title}</h1>
        <p className="mt-1 text-white/70">{students.map((s) => s.name).join(', ')} · {fmtTime(sess.start)}–{fmtTime(sess.end)}</p></div>
      <div className="w-full max-w-md rounded-2xl bg-white/8 p-6">
        <p className="text-sm text-white/80">Check camera/mic before joining. Your browser will ask for permission.</p>
        {mediaError && <p className="mt-3 rounded-lg bg-coral-500/20 p-2.5 text-xs text-coral-200">{mediaError}</p>}
        <Button variant="sun" className="mt-4 w-full" onClick={join} loading={connState === 'connecting'}>{isTeacher ? 'Start class & join' : 'Join the session'}</Button>
        <a href={jitsiUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"><ExternalLink className="h-4 w-4" /> Open in Jitsi Meet instead (free fallback)</a>
        <p className="mt-4 text-[11px] leading-relaxed text-white/50">Built-in room: direct WebRTC video over free public STUN, signalled through the academy cloud — no cost. Very strict school/office networks may need a TURN relay or the Jitsi fallback — see <Link to="/costs" className="underline">Services & Costs</Link>.</p>
      </div>
      <button type="button" onClick={() => nav(-1)} className="text-sm text-white/60 hover:text-white">← Back</button>
    </div>
  )

  const peerList = Object.entries(peers)
  const teacherPresent = isTeacher || peerList.some(([, p]) => p.role === 'teacher')
  return (
    <div className="flex min-h-svh flex-col bg-brand-950 text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <img src={asset('logo-mark-t.png')} alt="" className="h-8 w-8 rounded-lg bg-white/95 object-contain p-0.5" />
          <div className="min-w-0"><p className="truncate text-sm font-bold">{course?.title}</p><p className="truncate text-xs text-white/60">{students.map((s) => s.name).join(', ')}</p></div>
          <Badge tone="bg-emerald-500/20 text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE</Badge>
          {connState === 'local' && <Badge tone="bg-sun-400/20 text-sun-300">sandbox — solo room</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium"><Clock className="h-3.5 w-3.5" /> {timer}</span>
          <a href={jitsiUrl} target="_blank" rel="noreferrer" className="hidden rounded-lg bg-white/10 p-2 hover:bg-white/20 sm:block" aria-label="Open in Jitsi" title="Open in Jitsi (fallback)"><ExternalLink className="h-4 w-4" /></a>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast({ title: 'Class link copied', type: 'success' }) }} className="rounded-lg bg-white/10 p-2 hover:bg-white/20" aria-label="Copy link"><Copy className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col p-3">
          <div className={cn('grid flex-1 content-start gap-3', peerList.length === 0 ? 'mx-auto w-full max-w-2xl grid-cols-1' : peerList.length <= 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
            <VideoTile stream={localStream} name={myName} muted self off={!cam} />
            {peerList.map(([pid, p]) => <VideoTile key={pid} stream={p.stream} name={p.name || 'Participant'} link={p.link} />)}
            {peerList.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">{connState === 'local' ? 'Sandbox mode is single-browser — live multi-device rooms run on the cloud site.' : isTeacher ? 'Waiting for students to join… Share the class link or ask them to press Join in their portal.' : teacherPresent ? 'Connecting…' : 'Waiting for your teacher to join…'}</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={toggleMic} className={cn('rounded-full p-3.5', mic ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label="Toggle microphone">{mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}</button>
            <button type="button" onClick={toggleCam} className={cn('rounded-full p-3.5', cam ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label="Toggle camera">{cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}</button>
            <button type="button" onClick={share} disabled={!localStream} className={cn('rounded-full p-3.5 disabled:opacity-40', sharing ? 'bg-brand-500' : 'bg-white/10 hover:bg-white/20')} aria-label="Share screen" title={localStream ? 'Share screen' : 'Screen share needs camera/mic access'}><MonitorUp className="h-5 w-5" /></button>
            <button type="button" onClick={record} className={cn('rounded-full p-3.5', recording ? 'bg-coral-500' : 'bg-white/10 hover:bg-white/20')} aria-label="Record">{recording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</button>
            <button type="button" onClick={leave} className="rounded-full bg-coral-500 px-6 py-3.5 hover:bg-coral-600" aria-label="Leave"><PhoneOff className="h-5 w-5" /></button>
          </div>
        </div>
        <aside className="flex h-[46vh] flex-col border-t border-white/10 bg-white text-ink lg:h-auto lg:w-[360px] lg:border-l lg:border-t-0">
          <div className="flex border-b border-ink/8">
            {[['chat', MessageSquare, 'Chat'], ['whiteboard', PenTool, 'Board'], ['people', Users, 'People'], ['notes', NotebookPen, 'Topic']].map(([v, I, l]) => (
              <button key={v} type="button" onClick={() => setTab(v)} className={cn('flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold', tab === v ? 'border-b-2 border-brand-600 text-brand-700' : 'text-ink/50 hover:text-ink')}><I className="h-4 w-4" /> {l}</button>
            ))}
          </div>
          {tab === 'chat' && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-2 overflow-y-auto thin-scroll p-3">
                {chat.length === 0 && <p className="py-8 text-center text-xs text-ink/45">No messages yet. <br />🛡 Chat is monitored for safety.</p>}
                {chat.map((m, i) => <div key={i} className={cn('max-w-[85%] rounded-xl px-3 py-1.5 text-sm', m.from === myName ? 'ml-auto bg-brand-600 text-white' : 'bg-ink/6')}><p className={cn('text-[10px] font-bold', m.from === myName ? 'text-white/70' : 'text-brand-700')}>{m.from}</p>{m.text}</div>)}
              </div>
              <form onSubmit={sendChat} className="flex gap-2 border-t border-ink/8 p-2.5"><Input app placeholder="Message the class…" value={msg} onChange={(e) => setMsg(e.target.value)} /><Button app type="submit" size="sm" disabled={!msg.trim()}><Send className="h-4 w-4" /></Button></form>
            </div>
          )}
          {tab === 'whiteboard' && <Whiteboard send={sendWb} bus={wbBus} />}
          {tab === 'people' && (
            <div className="flex-1 overflow-y-auto thin-scroll p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">In the room ({peerList.length + 1})</p>
              <p className="flex items-center gap-2 py-1.5 text-sm"><Avatar name={myName} size="xs" /> {myName} (you)</p>
              {peerList.map(([pid, p]) => <p key={pid} className="flex items-center gap-2 py-1.5 text-sm"><Avatar name={p.name || '?'} size="xs" /> {p.name || 'Participant'} {p.role === 'teacher' && <Badge tone="bg-brand-100 text-brand-700">teacher</Badge>}</p>)}
              {isTeacher && <><p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-ink/50">Attendance</p>
                {students.map((st) => <label key={st.id} className="flex items-center justify-between py-1.5 text-sm"><span className="flex items-center gap-2"><Avatar name={st.name} size="xs" /> {st.name}</span>
                  <input type="checkbox" defaultChecked={sess.attendance?.[st.id] !== false} onChange={(e) => markAttendance(sess.id, st.id, e.target.checked)} className="h-4 w-4 accent-brand-600" /></label>)}</>}
            </div>
          )}
          {tab === 'notes' && (
            <div className="flex-1 overflow-y-auto p-4 text-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Lesson topic</p>
              <p className="mt-1 font-semibold">{sess.topic || 'No topic set — add one from Sessions.'}</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink/50">Course outcome</p>
              <p className="mt-1 text-ink/70">{course?.outcome}</p>
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-ink/4 p-2.5 text-xs text-ink/60"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Sessions may be recorded for child safety and quality review.</p>
            </div>
          )}
        </aside>
      </div>
      <Dialog open={endOpen} onClose={() => setEndOpen(false)} title="Did you finish the lesson?" desc="Marking it complete records attendance and asks for your post-lesson feedback." size="sm"
        footer={<><Button app variant="outline" onClick={() => confirmEnd(false)}>No, just leave</Button><Button app onClick={() => confirmEnd(true)}>Yes, complete & fill report</Button></>} />
    </div>
  )
}
