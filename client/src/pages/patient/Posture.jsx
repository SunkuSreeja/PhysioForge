import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useLang } from '../../i18n'
import { useAnalytics } from '../../context/AnalyticsContext'

/* ─── Posture analysis helpers ──────────────────────────────────────── */
function angleBetween(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2) * Math.sqrt(cb.x ** 2 + cb.y ** 2)
  if (mag === 0) return 0
  return Math.round((Math.acos(Math.min(1, Math.max(-1, dot / mag))) * 180) / Math.PI)
}

function analyzePosture(lm) {
  if (!lm || lm.length < 33) return null
  const nose = lm[0], lEar = lm[7], rEar = lm[8]
  const lShoulder = lm[11], rShoulder = lm[12]
  const lHip = lm[23], rHip = lm[24]
  const lElbow = lm[13], rElbow = lm[14]
  const lWrist = lm[15], rWrist = lm[16]

  const issues = []
  let score = 100

  const earMid = { x: (lEar.x + rEar.x) / 2, y: (lEar.y + rEar.y) / 2 }
  const shoulderMid = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 }
  const neckAngle = angleBetween(nose, earMid, shoulderMid)

  if (neckAngle < 140) {
    issues.push({ msg: 'Straighten your neck — head is tilting forward', color: '#ff6b7a', severity: 'high' })
    score -= 25
  } else if (neckAngle < 160) {
    issues.push({ msg: 'Slightly raise your chin — keep neck neutral', color: '#fbbf24', severity: 'medium' })
    score -= 10
  }

  const shoulderDiff = Math.abs(lShoulder.y - rShoulder.y)
  if (shoulderDiff > 0.04) {
    const high = lShoulder.y < rShoulder.y ? 'right' : 'left'
    issues.push({ msg: `Lift your ${high} shoulder — shoulders are uneven`, color: '#fbbf24', severity: 'medium' })
    score -= 15
  }

  const spineDeviation = Math.abs(earMid.x - shoulderMid.x)
  if (spineDeviation > 0.05) {
    issues.push({ msg: 'Sit upright — back is leaning to one side', color: '#fb923c', severity: 'medium' })
    score -= 15
  }

  const hipDiff = Math.abs(lHip.y - rHip.y)
  if (hipDiff > 0.05) {
    issues.push({ msg: 'Level your hips — pelvis is tilted', color: '#fb923c', severity: 'medium' })
    score -= 10
  }

  const rElbowAngle = angleBetween(rShoulder, rElbow, rWrist)
  if (rElbowAngle < 70 || rElbowAngle > 170) {
    issues.push({ msg: `Adjust right arm angle — currently ${rElbowAngle}°`, color: '#fbbf24', severity: 'low' })
    score -= 10
  }

  if (issues.length === 0) {
    issues.push({ msg: 'Excellent posture! Maintain this position 💪', color: '#34d399', severity: 'good' })
  }

  return { issues, score: Math.max(0, score), neckAngle, shoulderDiff: Math.round(shoulderDiff * 100) }
}

/* ─── Simulation messages ─────────────────────────────────────────── */
const SIM_MSGS = [
  { msg: 'Good posture detected! Maintain this position 💪', color: '#34d399', severity: 'good' },
  { msg: 'Straighten your neck — head tilting forward', color: '#ff6b7a', severity: 'high' },
  { msg: 'Lift your right shoulder — shoulders are uneven', color: '#fbbf24', severity: 'medium' },
  { msg: 'Excellent! Joint alignment is perfect ✓', color: '#34d399', severity: 'good' },
  { msg: 'Raise your right arm slightly higher', color: '#fbbf24', severity: 'medium' },
  { msg: 'Sit upright — slight forward lean detected', color: '#fb923c', severity: 'medium' },
  { msg: 'Perfect range of motion ✨', color: '#00d4aa', severity: 'good' },
  { msg: 'Neck tilted too much — look straight ahead', color: '#ff6b7a', severity: 'high' },
  { msg: 'Straighten your back — keep spine neutral', color: '#fb923c', severity: 'medium' },
]

const DEFAULT_EXERCISES = [
  'Shoulder Pendulum', 'Hip Flexor Stretch', 'Shoulder External Rotation',
  'Ankle Circles', 'Bridge Exercise', 'Wall Slides',
]

/* ─── Voice Coach ─────────────────────────────────────────────────── */
function useVoiceCoach() {
  const synthRef = useRef(null)
  const lastSpokenRef = useRef('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceLang, setVoiceLang] = useState('en-US')

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      setVoiceSupported(true)
    }
  }, [])

  const speak = useCallback((text) => {
    if (!voiceEnabled || !synthRef.current || !text) return
    if (text === lastSpokenRef.current) return
    lastSpokenRef.current = text
    synthRef.current.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = voiceLang
    utt.rate = 0.9
    utt.pitch = 1.0
    utt.volume = 1.0
    synthRef.current.speak(utt)
  }, [voiceEnabled, voiceLang])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel()
    lastSpokenRef.current = ''
  }, [])

  return { speak, stopSpeaking, voiceEnabled, setVoiceEnabled, voiceSupported, voiceLang, setVoiceLang }
}

/* ─── CDN script loader (module-level, no React deps) ──────────────── */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function PosturePage() {
  
  const { t } = useLang()
  const location = useLocation()
  const { logPostureStarted, logPostureEnded } = useAnalytics()
   const { speak, stopSpeaking, voiceEnabled, setVoiceEnabled, voiceSupported, voiceLang, setVoiceLang } = useVoiceCoach()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const simTimerRef = useRef(null)
  const sessionIdRef = useRef(null)
  const sessionStartRef = useRef(null)
  const scoreHistoryRef = useRef([])
  const speakThrottleRef = useRef(0)
  const lastFeedbackRef = useRef(null)

  // Extract exercise context passed via navigation state
  const navState = location.state || {}
  const contextExercise = navState.exercise || null
  const contextPainArea = navState.painArea || null

  const [mode, setMode] = useState('idle') // idle | loading | real | sim | paused
  const [cameraError, setCameraError] = useState('')
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const [score, setScore] = useState(null)
  const [log, setLog] = useState([])
  const [reps, setReps] = useState(0)
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [simIdx, setSimIdx] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [pausedMode, setPausedMode] = useState(null) // which mode was active before pause
  const durationTimerRef = useRef(null)

  // Build exercise list — prefer context from Exercise Library
  const exercises = contextExercise
    ? [contextExercise, ...DEFAULT_EXERCISES.filter(e => e !== contextExercise)]
    : DEFAULT_EXERCISES

  /* ── Duration timer ────────────────────────────────────────────── */
  const startDurationTimer = useCallback(() => {
    clearInterval(durationTimerRef.current)
    durationTimerRef.current = setInterval(() => setSessionDuration(s => s + 1), 1000)
  }, [])

  const stopDurationTimer = useCallback(() => {
    clearInterval(durationTimerRef.current)
  }, [])

  /* ── Draw skeleton (landmarks are already mirrored by MediaPipe when
        using Camera helper — do NOT apply scaleX(-1) to canvas itself,
        we mirror by flipping x = 1 - lm.x in drawSkeleton) ──────── */
  const drawSkeleton = useCallback((landmarks, canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!landmarks) return

    const W = canvas.width, H = canvas.height
    // Mirror x so skeleton aligns with the CSS-mirrored video feed
    const pt = (idx) => ({ x: (1 - landmarks[idx].x) * W, y: landmarks[idx].y * H })

    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
      [0, 7], [0, 8], [7, 11], [8, 12],
    ]

    ctx.lineWidth = 3
    connections.forEach(([a, b]) => {
      if (!landmarks[a] || !landmarks[b]) return
      const pa = pt(a), pb = pt(b)
      ctx.beginPath()
      ctx.moveTo(pa.x, pa.y)
      ctx.lineTo(pb.x, pb.y)
      ctx.strokeStyle = 'rgba(0,212,170,0.8)'
      ctx.stroke()
    })

    landmarks.forEach((lm, idx) => {
      if (idx > 28) return
      const p = pt(idx)
      const isHighlight = [0, 7, 8, 11, 12, 23, 24].includes(idx)
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHighlight ? 7 : 5, 0, Math.PI * 2)
      ctx.fillStyle = isHighlight ? '#fbbf24' : '#00d4aa'
      ctx.fill()
    })
  }, [])

  /* ── Real camera + MediaPipe ───────────────────────────────────── */
  const startRealCamera = useCallback(async () => {
    setMode('loading')
    setCameraError('')
    setReps(0)
    setLog([])
    setScore(null)
    setSessionDuration(0)

    const sid = logPostureStarted('real')
    sessionIdRef.current = sid
    sessionStartRef.current = Date.now()
    scoreHistoryRef.current = []

    try {
      // Check camera permission first
      const perm = await navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'unknown' }))
      if (perm.state === 'denied') throw new Error('Camera permission denied in browser settings')

      // Check getUserMedia support
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported in this browser')

      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')

      // eslint-disable-next-line no-undef
      const Pose = window.Pose
      // eslint-disable-next-line no-undef
      const Camera = window.Camera
      if (!Pose || !Camera) throw new Error('MediaPipe failed to load from CDN — check network')

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      })
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      })

      pose.onResults((results) => {
        if (!canvasRef.current || !videoRef.current) return
        canvasRef.current.width = videoRef.current.videoWidth || 640
        canvasRef.current.height = videoRef.current.videoHeight || 480
        if (results.poseLandmarks) {
          drawSkeleton(results.poseLandmarks, canvasRef.current)
          const analysis = analyzePosture(results.poseLandmarks)
          if (analysis) {
            const topIssue = analysis.issues[0]
            setCurrentFeedback(topIssue)
            setScore(analysis.score)
            scoreHistoryRef.current.push(analysis.score)
            if (topIssue.severity === 'good') setReps(r => Math.min(r + 1, 12))

            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            setLog(prev => {
              if (prev[0]?.msg === topIssue.msg) return prev
              return [{ msg: topIssue.msg, color: topIssue.color, time: now }, ...prev.slice(0, 6)]
            })

            // Voice coaching — throttle to once per 4s
            const now2 = Date.now()
            if (now2 - speakThrottleRef.current > 4000) {
              speakThrottleRef.current = now2
              speak(topIssue.msg)
              lastFeedbackRef.current = topIssue.msg
            }
          }
        } else {
          // No pose detected — clear canvas
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      })

      poseRef.current = pose

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })

      if (!videoRef.current) throw new Error('Video element not available')
      videoRef.current.srcObject = stream

await new Promise((resolve, reject) => {
  if (!videoRef.current) return reject(new Error("Video element missing"))

  videoRef.current.onloadedmetadata = () => resolve()
  videoRef.current.onerror = (err) => reject(err)
})

await videoRef.current.play().catch(() => {})

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            await poseRef.current.send({ image: videoRef.current }).catch(() => {})
          }
        },
        width: 640,
        height: 480,
      })
      camera.start()
      cameraRef.current = camera
      setMode('real')
      startDurationTimer()
    } catch (err) {
      console.warn('MediaPipe/camera error:', err.message)
      setCameraError(err.message)
      setCameraError(err.message)
      setMode('idle')
    }
  }, [drawSkeleton, logPostureStarted, startDurationTimer])

  /* ── Simulation fallback ───────────────────────────────────────── */
  const startSimulation = useCallback((keepSession = false) => {
    if (!keepSession) {
      if (!sessionIdRef.current) {
        const sid = logPostureStarted('simulation')
        sessionIdRef.current = sid
        sessionStartRef.current = Date.now()
        scoreHistoryRef.current = []
      }
      setReps(0)
      setLog([])
      setScore(null)
      setSessionDuration(0)
    }
    setMode('sim')
    startDurationTimer()

    simTimerRef.current = setInterval(() => {
      setSimIdx(prev => {
        const next = (prev + 1) % SIM_MSGS.length
        const m = SIM_MSGS[next]
        const s = m.severity === 'good'
          ? Math.floor(82 + Math.random() * 16)
          : Math.floor(48 + Math.random() * 32)
        setCurrentFeedback(m)
        setScore(s)
        scoreHistoryRef.current.push(s)
        if (m.severity === 'good') setReps(r => Math.min(r + 1, 12))
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setLog(prev => [{ msg: m.msg, color: m.color, time: now }, ...prev.slice(0, 6)])
        speak(m.msg)
        return next
      })
    }, 3500)
  }, [logPostureStarted, speak, startDurationTimer])

  /* ── Pause ─────────────────────────────────────────────────────── */
  const pauseSession = useCallback(() => {
    clearInterval(simTimerRef.current)
    stopDurationTimer()
    stopSpeaking()
    if (cameraRef.current) { try { cameraRef.current.stop() } catch {} }
    setPausedMode(mode)
    setMode('paused')
  }, [mode, stopDurationTimer, stopSpeaking])

  /* ── Resume ────────────────────────────────────────────────────── */
  const resumeSession = useCallback(async () => {
    if (pausedMode === 'real') {
      // Re-start camera
      setMode('loading')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        if (cameraRef.current) {
          cameraRef.current.start()
        }
        setMode('real')
        startDurationTimer()
      } catch {
        startSimulation(true)
      }
    } else {
      startSimulation(true)
    }
  }, [pausedMode, startDurationTimer, startSimulation])

  /* ── Stop/End ──────────────────────────────────────────────────── */
  const stopSession = useCallback(() => {
    clearInterval(simTimerRef.current)
    stopDurationTimer()
    stopSpeaking()
    if (cameraRef.current) { try { cameraRef.current.stop() } catch {} }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (poseRef.current) { try { poseRef.current.close() } catch {} }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    if (sessionIdRef.current) {
      const scores = scoreHistoryRef.current
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const peakScore = scores.length ? Math.max(...scores) : 0
      const durationSec = sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0
      logPostureEnded(sessionIdRef.current, { avgScore, peakScore, durationSec, repsDone: reps, issues: [] })
      sessionIdRef.current = null
    }
    setMode('idle')
    setCurrentFeedback(null)
    setScore(null)
    setPausedMode(null)
  }, [logPostureEnded, reps, stopDurationTimer, stopSpeaking])

  useEffect(() => () => stopSession(), [stopSession])

  const isActive = mode === 'real' || mode === 'sim'
  const isPaused = mode === 'paused'
  const isRunning = isActive || isPaused

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            {t('aiPostureTitle')}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {contextExercise
              ? `📋 Exercise: ${contextExercise}${contextPainArea ? ` · Pain: ${contextPainArea}` : ''}`
              : mode === 'real' ? '📹 Real MediaPipe Tracking'
                : mode === 'sim' ? '🤖 AI Simulation Mode'
                  : 'Real-time skeleton · Joint angles · Voice coaching'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isRunning && (
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text2)', background: 'var(--bg3)', padding: '4px 12px', borderRadius: 100 }}>
              ⏱ {fmtTime(sessionDuration)}
            </div>
          )}
          {score !== null && (
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: score > 75 ? 'var(--teal)' : score > 50 ? 'var(--amber)' : 'var(--red)' }}>
              {score}%
            </div>
          )}
          <Badge color={mode === 'real' ? 'teal' : mode === 'sim' ? 'blue' : mode === 'paused' ? 'amber' : 'amber'}>
            {mode === 'real' ? '● Live AI' : mode === 'sim' ? '● Simulation' : mode === 'loading' ? '⟳ Loading…' : mode === 'paused' ? '⏸ Paused' : '○ Ready'}
          </Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }} className="posture-grid">

        {/* ── Camera / Skeleton area ──────────────────────────────── */}
        <div style={{
          borderRadius: 20, border: '2px solid rgba(0,212,170,.25)', overflow: 'hidden',
          minHeight: 460, position: 'relative',
          background: 'radial-gradient(ellipse at center, rgba(0,212,170,.06) 0%, var(--bg2) 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>

          {/* Video — CSS mirrored so it looks like a mirror */}
          <video
            ref={videoRef}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover', transform: 'scaleX(-1)',
              display: mode === 'real' ? 'block' : 'none',
              opacity: 0.85,
            }}
            playsInline
            muted
          />

          {/* Canvas — NOT CSS-mirrored; we flip coords in drawSkeleton */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              display: mode === 'real' ? 'block' : 'none',
            }}
          />

          {/* Simulation SVG skeleton */}
          {(mode === 'sim' || mode === 'paused') && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '32px 20px' }}>
              <svg viewBox="0 0 320 460" width="55%" style={{ maxHeight: 360 }}>
                <motion.circle cx="160" cy="48" r="26" fill="none" stroke="rgba(0,212,170,.6)" strokeWidth="2"
                  animate={{ opacity: mode === 'paused' ? 0.4 : [.5, .9, .5] }}
                  transition={{ duration: 2, repeat: mode === 'paused' ? 0 : Infinity }} />
                <line x1="160" y1="74" x2="160" y2="100" stroke="var(--teal)" strokeWidth="3" />
                <line x1="160" y1="100" x2="160" y2="220" stroke="var(--teal)" strokeWidth="3" />
                <line x1="78" y1="110" x2="222" y2="110" stroke="var(--teal)" strokeWidth="3" />
                <line x1="78" y1="110" x2="50" y2="188" stroke="var(--teal)" strokeWidth="2.5" />
                <line x1="50" y1="188" x2="36" y2="266" stroke="var(--teal)" strokeWidth="2" />
                <motion.line x1="222" y1="110" x2="256" y2="172"
                  stroke={currentFeedback?.severity === 'good' ? 'var(--teal)' : '#fbbf24'} strokeWidth="2.5"
                  animate={mode === 'paused' ? {} : {
                    stroke: currentFeedback?.severity === 'good'
                      ? ['var(--teal)', 'var(--teal)']
                      : ['#fbbf24', '#ff6b7a', '#fbbf24']
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }} />
                <line x1="256" y1="172" x2="274" y2="248" stroke="#fbbf24" strokeWidth="2" />
                <line x1="112" y1="220" x2="188" y2="220" stroke="var(--teal)" strokeWidth="3" />
                <line x1="112" y1="220" x2="97" y2="328" stroke="var(--teal)" strokeWidth="2.5" />
                <line x1="97" y1="328" x2="88" y2="416" stroke="var(--teal)" strokeWidth="2" />
                <line x1="188" y1="220" x2="198" y2="328" stroke="var(--teal)" strokeWidth="2.5" />
                <line x1="198" y1="328" x2="203" y2="416" stroke="var(--teal)" strokeWidth="2" />
                {[[160,80],[78,110],[222,110],[160,220],[112,220],[188,220],[50,188],[36,266],[97,328],[88,416],[198,328],[203,416]].map(([x,y],i)=>(
                  <motion.circle key={i} cx={x} cy={y} r="5.5" fill="var(--teal)" opacity=".85"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * .05 }} />
                ))}
                <motion.circle cx="222" cy="110" r="11" fill="none" stroke="#fbbf24" strokeWidth="2"
                  animate={mode === 'paused' ? {} : { r: [9, 14, 9], opacity: [1, .4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <circle cx="222" cy="110" r="5" fill="#fbbf24" opacity=".9" />
              </svg>
            </div>
          )}

          {/* Idle */}
          {mode === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 32, gap: 16 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 64 }}>📸</motion.div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700 }}>Ready for AI Posture Analysis</h2>
              {contextExercise && (
                <div style={{ background: 'rgba(0,212,170,.1)', border: '1px solid rgba(0,212,170,.3)', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
                  📋 {contextExercise}{contextPainArea ? ` — ${contextPainArea}` : ''}
                </div>
              )}
              <p style={{ color: 'var(--text2)', maxWidth: 340, fontSize: 14, lineHeight: 1.7 }}>
                Activates your webcam with <strong style={{ color: 'var(--teal)' }}>MediaPipe Pose</strong> to track 33 body landmarks in real time. Falls back to simulation if camera is unavailable.
              </p>
              {cameraError && (
                <div style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: 'var(--amber)', maxWidth: 340 }}>
                  ⚠ Camera: {cameraError} — Running in simulation mode
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="primary" size="lg" onClick={startRealCamera}>{t('startSession')}</Btn>
                <Btn variant="ghost" size="md" onClick={() => startSimulation()}>🤖 Simulation</Btn>
              </div>
            </div>
          )}

          {/* Loading */}
          {mode === 'loading' && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--bg3)', borderTopColor: 'var(--teal)', margin: '0 auto 16px' }} />
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700 }}>Loading MediaPipe AI…</div>
              <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 8 }}>Requesting camera · Downloading pose model</div>
            </div>
          )}

          {/* Paused overlay */}
          {isPaused && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 10 }}>
              <div style={{ fontSize: 48 }}>⏸</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff' }}>Session Paused</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>Time: {fmtTime(sessionDuration)}</div>
              <Btn variant="primary" size="lg" onClick={resumeSession}>▶ Resume Session</Btn>
            </div>
          )}

          {/* Corner guides */}
          {(isActive || isPaused) && (
            <>
              {[
                { top: 16, left: 16, borderTop: '2px solid var(--teal)', borderLeft: '2px solid var(--teal)' },
                { top: 16, right: 16, borderTop: '2px solid var(--teal)', borderRight: '2px solid var(--teal)' },
                { bottom: 16, left: 16, borderBottom: '2px solid var(--teal)', borderLeft: '2px solid var(--teal)' },
                { bottom: 16, right: 16, borderBottom: '2px solid var(--teal)', borderRight: '2px solid var(--teal)' },
              ].map((c, i) => (
                <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderRadius: 2, zIndex: 3, ...c }} />
              ))}
              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.8)', border: '1px solid var(--teal)', borderRadius: 100, padding: '4px 14px', fontSize: 12, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, zIndex: 4 }}>
                <motion.span animate={{ opacity: isPaused ? 0.3 : [1, .2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ color: 'var(--teal)', fontSize: 8 }}>●</motion.span>
                {mode === 'real' ? 'MediaPipe Live · 33 Landmarks' : isPaused ? 'Session Paused' : 'AI Simulation Active'}
              </div>
              {score !== null && !isPaused && (
                <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,.8)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: 'var(--text2)', zIndex: 4 }}>
                  Score: <span style={{ color: score > 75 ? 'var(--teal)' : score > 50 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{score}%</span><br />
                  {mode === 'real' ? 'Real-time AI' : 'Simulated AI'}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right panel ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Live feedback */}
          <AnimatePresence mode="wait">
            {currentFeedback && (
              <motion.div key={currentFeedback.msg.slice(0, 20)}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: `${currentFeedback.color}14`, border: `1px solid ${currentFeedback.color}40`, borderRadius: 16, padding: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>
                    {currentFeedback.severity === 'good' ? '✅' : currentFeedback.severity === 'high' ? '🔴' : '⚠️'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: currentFeedback.color, marginBottom: 4, fontSize: 13 }}>
                      {currentFeedback.severity === 'good' ? t('goodPosture') : t('postureAlert')}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>{currentFeedback.msg}</div>
                  </div>
                </div>
              </motion.div>
            )}
            {!currentFeedback && !isRunning && (
              <div style={{ background: 'var(--bg3)', borderRadius: 16, padding: 14, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                Start a session to see live feedback
              </div>
            )}
          </AnimatePresence>

          {/* Exercise tracker */}
          <GlassCard>
            <Badge color="blue" style={{ marginBottom: 10 }}>
              Exercise {exerciseIdx + 1} of {exercises.length}
            </Badge>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              {exercises[exerciseIdx]}
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
              Keep elbow at 90°. Slow and controlled movement.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {[
                { v: reps, l: t('repsDone'), c: 'var(--teal)' },
                { v: 12, l: t('target'), c: 'var(--text)' },
                { v: 3, l: t('setsLeft'), c: 'var(--blue)' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '8px 4px' }}>
                  <motion.div key={s.v} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                    style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: s.c }}>
                    {s.v}
                  </motion.div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div animate={{ width: `${(reps / 12) * 100}%` }} transition={{ duration: .4 }}
                style={{ height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 3 }} />
            </div>
          </GlassCard>

          {/* Voice coach */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>🔊 Voice Coach</div>
              {voiceSupported ? (
                <button
                  onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking() }}
                  style={{
                    padding: '4px 12px', borderRadius: 100, border: `1px solid ${voiceEnabled ? 'var(--teal)' : 'var(--border)'}`,
                    background: voiceEnabled ? 'rgba(0,212,170,.15)' : 'var(--bg3)',
                    color: voiceEnabled ? 'var(--teal)' : 'var(--text2)',
                    fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                  }}>
                  {voiceEnabled ? '● ON' : '○ OFF'}
                </button>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Not supported</span>
              )}
            </div>
            {voiceSupported && voiceEnabled && (
              <select
                value={voiceLang}
                onChange={e => setVoiceLang(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg3)', color: 'var(--text)', fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
                }}>
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="hi-IN">🇮🇳 Hindi</option>
                <option value="te-IN">🇮🇳 Telugu</option>
                <option value="ta-IN">🇮🇳 Tamil</option>
                <option value="de-DE">🇩🇪 Deutsch</option>
                <option value="fr-FR">🇫🇷 Français</option>
                <option value="es-ES">🇪🇸 Español</option>
                <option value="ja-JP">🇯🇵 日本語</option>
                <option value="zh-CN">🇨🇳 中文</option>
              </select>
            )}
            {!voiceSupported && (
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Speech synthesis not available in this browser.</div>
            )}
          </GlassCard>

          {/* Coaching log */}
          <GlassCard>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>🤖 {t('coachingLog')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {log.length > 0 ? log.map((e, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                  <span style={{ color: e.color, flexShrink: 0 }}>●</span>
                  <span style={{ color: 'var(--text2)', flex: 1 }}>{e.msg}</span>
                  <span style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>{e.time}</span>
                </motion.div>
              )) : (
                <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                  Start session to see coaching log
                </div>
              )}
            </div>
          </GlassCard>

          {/* Session controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!isRunning && (
              <Btn variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={startRealCamera}>
                ▶ {t('startSession')}
              </Btn>
            )}
            {isActive && (
              <Btn variant="ghost" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={pauseSession}>
                ⏸ Pause
              </Btn>
            )}
            {isPaused && (
              <Btn variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={resumeSession}>
                ▶ Resume
              </Btn>
            )}
            {isRunning && (
              <Btn variant="danger" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={stopSession}>
                ■ {t('endSession')}
              </Btn>
            )}
          </div>
          <Btn variant="ghost" size="sm" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setExerciseIdx(i => (i + 1) % exercises.length)}>
            {t('nextExercise')}
          </Btn>
          <Btn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => window.history.back()}>← Back</Btn>
        </div>
      </div>
      <style>{`@media(max-width:860px){.posture-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
