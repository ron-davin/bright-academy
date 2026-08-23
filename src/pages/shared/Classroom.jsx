import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import Peer from 'peerjs'
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Circle, Square, MessageSquare, PenTool, Users, NotebookPen, Send, Eraser, Trash2, ExternalLink, Copy, Clock, ShieldCheck, X } from 'lucide-react'
import { useStore, useCurrentUser, toast } from '../../lib/store.js'
import { Avatar, Badge, Button, Dialog, Input, asset } from '../../components/ui/index.jsx'
import { courseOf } from '../../components/app/Shared.jsx'
import { cn, fmtTime, initials } from '../../lib/utils.js'

const roomId = (sessionId) => `ba-${String(sessionId).replace(/[^a-zA-Z0-9-]/g, '')}-v1`

function useTimer(startedAt) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.max(0, Math.floor((now - startedAt) / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function VideoTile({ stream, name, muted, self, off }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current && stream) { ref.current.srcObject = stream; ref.current.play().catch(() => {}) } }, [stream])
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-950">
      {stream && !off ? <video ref={ref} autoPlay playsInline muted={muted} className={cn('h-full w-full object-cover', self && 'scale-x-[-1]')} /> :
        <div className="flex h-full w-full items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white">{initials(name)}</span></div>}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white">{name}{self ? ' (you)' : ''}</span>
    </div>
  )
}

function Whiteboard({ send, remoteStrokes }) {
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
  useEffect(() => { if (!remoteStrokes) return; const un = remoteStrokes.subscribe((msg) => { if (msg.type === 'stroke') { strokes.current.push(msg.stroke); redraw() } else if (msg.type === 'wb-clear') { strokes.current = []; redraw() } }); return un }, [remoteStrokes, redraw])
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
  const sess = useStore((s) => s.sessions.find((x) => x.id === sessionId))
  const users = useStore((s) => s.users)
  const { startSession, endSession, markAttendance } = useStore()
  const isTeacher = user?.role === 'teacher' && user?.teacherId === sess?.teacherId
  const [joined, setJoined] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [mediaError, setMediaError] = useState('')
  const [peers, setPeers] = useState({}) // peerId -> {name, stream}
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [tab, setTab] = useState(params.get('tab') || 'chat')
  const [chat, setChat] = useState([])
  const [msg, setMsg] = useState('')
  const [connState, setConnState] = useState('idle')
  const [endOpen, setEndOpen] = useState(false)
  const peerRef = useRef(null)
  const connsRef = useRef({}) // peerId -> DataConnection
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const wbSubs = useRef(new Set())
  const startedAtRef = useRef(Date.now())
  const timer = useTimer(startedAtRef.current)
  const course = sess && courseOf(sess.courseId)
  const myName = user?.name || 'Guest'

  const broadcast = useCallback((data, except) => { Object.entries(connsRef.current).forEach(([pid, c]) => { if (pid !== except && c.open) c.send(data) }) }, [])
  const wbBus = useMemo(() => ({ subscribe: (fn) => { wbSubs.current.add(fn); return () => wbSubs.current.delete(fn) }, emit: (m) => wbSubs.current.forEach((fn) => fn(m)) }), [])
  const sendWb = useCallback((m) => { wbBus.emit(m); broadcast({ ...m, from: myName }) }, [broadcast, wbBus, myName])

  const handleData = useCallback((data, fromPid) => {
    if (!data || typeof data !== 'object') return
    if (data.type === 'chat') setChat((c) => [...c, data])
    if (data.type === 'stroke' || data.type === 'wb-clear') wbBus.emit(data)
    if (data.type === 'hello') setPeers((p) => ({ ...p, [fromPid]: { ...(p[fromPid] || {}), name: data.name } }))
    // host relays to everyone else
    if (isTeacher) broadcast(data, fromPid)
  }, [broadcast, isTeacher, wbBus])

  const attachConn = useCallback((conn) => {
    connsRef.current[conn.peer] = conn
    conn.on('data', (d) => handleData(d, conn.peer))
    conn.on('open', () => conn.send({ type: 'hello', name: myName }))
    conn.on('close', () => { delete connsRef.current[conn.peer]; setPeers((p) => { const q = { ...p }; delete q[conn.peer]; return q }) })
  }, [handleData, myName])

  const attachCall = useCallback((call) => {
    call.on('stream', (remote) => setPeers((p) => ({ ...p, [call.peer]: { ...(p[call.peer] || { name: 'Participant' }), stream: remote } })))
    call.on('close', () => setPeers((p) => { const q = { ...p }; if (q[call.peer]) delete q[call.peer].stream; return q }))
  }, [])

  const join = useCallback(async () => {
    setConnState('connecting')
    let stream = null
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
    try { stream = await withTimeout(navigator.mediaDevices.getUserMedia({ video: true, audio: true }), 6000) } catch { try { stream = await withTimeout(navigator.mediaDevices.getUserMedia({ audio: true }), 3000) } catch { setMediaError('Camera/mic unavailable — joining without media. Check browser permissions, then rejoin.') } }
    streamRef.current = stream; setLocalStream(stream)
    const host = roomId(sessionId)
    const peer = new Peer(isTeacher ? host : undefined, { debug: 0 })
    peerRef.current = peer
    peer.on('open', () => {
      setJoined(true); setConnState('connected')
      if (isTeacher) { startSession(sessionId); toast({ title: 'Classroom is live', desc: 'Students can join now.', type: 'success' }) }
      else {
        const tryConnect = () => {
          const conn = peer.connect(host, { reliable: true }); attachConn(conn)
          const call = stream ? peer.call(host, stream, { metadata: { name: myName } }) : null; if (call) attachCall(call)
          conn.on('error', () => {}); setPeers((p) => ({ ...p, [host]: { ...(p[host] || {}), name: 'Teacher' } }))
        }
        tryConnect()
        const iv = setInterval(() => { if (!connsRef.current[host] || !connsRef.current[host].open) tryConnect(); else clearInterval(iv) }, 4000)
      }
    })
    peer.on('connection', attachConn)
    peer.on('call', (call) => { call.answer(streamRef.current || undefined); if (call.metadata?.name) setPeers((p) => ({ ...p, [call.peer]: { ...(p[call.peer] || {}), name: call.metadata.name } })); attachCall(call) })
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id') { setConnState('error'); setMediaError('This class already has an open teacher window. Close the other tab first.') }
      else if (e.type === 'peer-unavailable') setConnState('waiting')
      else if (['network', 'server-error', 'socket-error'].includes(e.type)) { setConnState('error'); setMediaError('Could not reach the free P2P signaling server. Use "Open in Jitsi" below as a fallback.') }
    })
  }, [attachCall, attachConn, isTeacher, myName, sessionId, startSession])

  useEffect(() => () => { // cleanup on unmount
    Object.values(connsRef.current).forEach((c) => c.close?.())
    peerRef.current?.destroy(); streamRef.current?.getTracks().forEach((t) => t.stop()); recorderRef.current?.stop?.()
  }, [])

  if (!user) return <div className="flex min-h-svh items-center justify-center bg-brand-950 text-white"><p>Please sign in to join the classroom.</p></div>
  if (!sess) return <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-brand-950 text-white"><p>Session not found.</p><Button variant="light" onClick={() => nav(-1)}>Go back</Button></div>

  const toggleMic = () => { const t = streamRef.current?.getAudioTracks?.()[0]; if (t) { t.enabled = !t.enabled; setMic(t.enabled) } }
  const toggleCam = () => { const t = streamRef.current?.getVideoTracks?.()[0]; if (t) { t.enabled = !t.enabled; setCam(t.enabled) } }
  const share = async () => {
    try {
      if (sharing) return
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const track = display.getVideoTracks()[0]
      Object.values(peerRef.current?.connections || {}).flat().forEach((c) => { const sender = c.peerConnection?.getSenders?.().find((s) => s.track?.kind === 'video'); if (sender) sender.replaceTrack(track) })
      setSharing(true)
      track.onended = () => { const camTrack = streamRef.current?.getVideoTracks?.()[0]; Object.values(peerRef.current?.connections || {}).flat().forEach((c) => { const sender = c.peerConnection?.getSenders?.().find((s) => s.track?.kind === 'video'); if (sender && camTrack) sender.replaceTrack(camTrack) }); setSharing(false) }
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
  const sendChat = (e) => { e.preventDefault(); if (!msg.trim()) return; const m = { type: 'chat', from: myName, text: msg.trim(), at: new Date().toISOString() }; setChat((c) => [...c, m]); broadcast(m); setMsg('') }
  const leave = () => { if (isTeacher) setEndOpen(true); else nav(-1) }
  const confirmEnd = (finish) => {
    setEndOpen(false)
    if (finish) { endSession(sessionId, { recorded: recording || undefined, durationMin: Math.round((Date.now() - startedAtRef.current) / 60000) || 45 }); toast({ title: 'Session marked complete', desc: 'Now fill in the lesson feedback.', type: 'success' }); nav('/teacher/feedback') }
    else nav(-1)
  }
  const jitsiUrl = `https://meet.jit.si/BrightAcademy-${roomId(sessionId)}`
  const students = sess.studentIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  if (!joined) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-brand-950 p-6 text-white">
      <img src={asset('logo-mark-t.png')} alt="" className="h-16 w-16 rounded-2xl bg-white/95 object-contain p-1.5" />
      <div className="text-center"><h1 className="font-display text-3xl font-black">{course?.title}</h1>
        <p className="mt-1 text-white/70">{students.map((s) => s.name).join(', ')} · {fmtTime(sess.start)}–{fmtTime(sess.end)}</p></div>
      <div className="w-full max-w-md rounded-2xl bg-white/8 p-6">
        <p className="text-sm text-white/80">Check camera/mic before joining. Your browser will ask for permission.</p>
        {mediaError && <p className="mt-3 rounded-lg bg-coral-500/20 p-2.5 text-xs text-coral-200">{mediaError}</p>}
        {connState === 'waiting' && <p className="mt-3 rounded-lg bg-sun-400/20 p-2.5 text-xs text-sun-300">Waiting for the teacher to start the class… we'll keep retrying.</p>}
        <Button variant="sun" className="mt-4 w-full" onClick={join} loading={connState === 'connecting'}>{isTeacher ? 'Start class & join' : 'Join the session'}</Button>
        <a href={jitsiUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"><ExternalLink className="h-4 w-4" /> Open in Jitsi Meet instead (free fallback)</a>
        <p className="mt-4 text-[11px] leading-relaxed text-white/50">Built-in room uses free peer-to-peer WebRTC (PeerJS + public STUN) — no servers, no cost. For strict school/office networks a TURN server or a managed video service is needed — see <Link to="/costs" className="underline">Services & Costs</Link>.</p>
      </div>
      <button type="button" onClick={() => nav(-1)} className="text-sm text-white/60 hover:text-white">← Back</button>
    </div>
  )

  const peerList = Object.entries(peers)
  return (
    <div className="flex min-h-svh flex-col bg-brand-950 text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <img src={asset('logo-mark-t.png')} alt="" className="h-8 w-8 rounded-lg bg-white/95 object-contain p-0.5" />
          <div className="min-w-0"><p className="truncate text-sm font-bold">{course?.title}</p><p className="truncate text-xs text-white/60">{students.map((s) => s.name).join(', ')}</p></div>
          <Badge tone="bg-emerald-500/20 text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium"><Clock className="h-3.5 w-3.5" /> {timer}</span>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast({ title: 'Class link copied', type: 'success' }) }} className="rounded-lg bg-white/10 p-2 hover:bg-white/20" aria-label="Copy link"><Copy className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col p-3">
          <div className={cn('grid flex-1 content-start gap-3', peerList.length === 0 ? 'grid-cols-1 max-w-2xl mx-auto w-full' : peerList.length <= 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
            <VideoTile stream={localStream} name={myName} muted self off={!cam} />
            {peerList.map(([pid, p]) => <VideoTile key={pid} stream={p.stream} name={p.name || 'Participant'} />)}
            {peerList.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">{isTeacher ? 'Waiting for students to join… Share the class link or ask them to press Join in their portal.' : 'Connecting you to the room…'}</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={toggleMic} className={cn('rounded-full p-3.5', mic ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label="Toggle microphone">{mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}</button>
            <button type="button" onClick={toggleCam} className={cn('rounded-full p-3.5', cam ? 'bg-white/10 hover:bg-white/20' : 'bg-coral-500 hover:bg-coral-600')} aria-label="Toggle camera">{cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}</button>
            <button type="button" onClick={share} className={cn('rounded-full p-3.5', sharing ? 'bg-brand-500' : 'bg-white/10 hover:bg-white/20')} aria-label="Share screen"><MonitorUp className="h-5 w-5" /></button>
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
          {tab === 'whiteboard' && <Whiteboard send={sendWb} remoteStrokes={wbBus} />}
          {tab === 'people' && (
            <div className="flex-1 overflow-y-auto thin-scroll p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">In the room ({peerList.length + 1})</p>
              <p className="flex items-center gap-2 py-1.5 text-sm"><Avatar name={myName} size="xs" /> {myName} (you)</p>
              {peerList.map(([pid, p]) => <p key={pid} className="flex items-center gap-2 py-1.5 text-sm"><Avatar name={p.name || '?'} size="xs" /> {p.name || 'Participant'}</p>)}
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
