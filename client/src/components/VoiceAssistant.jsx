import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../context/AuthContext'
import { useAnalytics } from '../context/AnalyticsContext'
import {
  processMessage,
  getDailyGreeting,
  getCheckins,
  getHistory,
  appendHistory,
  getRuralMode,
  setRuralMode,
  getAnalyticsSummaryForAI,
} from './ai/physioAI'
import { QUICK_CHIPS } from './ai/aiKnowledgeBase'

// ── Speech lang map ──────────────────────────────────────────────────────────
const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

// ── Typing animation hook ────────────────────────────────────────────────────
function useTyping(text, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(true); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return { displayed, done }
}

// ── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, onAction, lang }) {
  const isUser = msg.role === 'user'
  const { displayed, done } = useTyping(isUser ? msg.text : msg.text, isUser ? 0 : 14)

  const actionLabel = (a) =>
    (typeof a.label === 'object' ? a.label[lang] || a.label.en : a.label)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      style={{ display: 'flex', flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start', gap: 8 }}
    >
      {/* Avatar row */}
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: 'linear-gradient(135deg,var(--teal),var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
          }}>🤖</div>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>
            PhysioForge AI
          </span>
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '88%',
        padding: isUser ? '9px 14px' : '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        background: isUser
          ? 'linear-gradient(135deg,var(--teal),var(--blue))'
          : 'var(--bg3)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#fff' : 'var(--text)',
        fontSize: 12.5,
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        boxShadow: isUser ? '0 4px 14px rgba(0,212,170,.2)' : 'none',
      }}>
        {displayed}
        {!done && !isUser && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ marginLeft: 2, color: 'var(--teal)' }}
          >▋</motion.span>
        )}
      </div>

      {/* Pharmacy card */}
      {msg.type === 'pharmacy' && msg.scenarios && done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '92%', borderRadius: 14,
            border: '1px solid rgba(251,146,60,.3)',
            background: 'rgba(251,146,60,.06)',
            overflow: 'hidden',
          }}
        >
          {msg.scenarios.map((s, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderBottom: i < msg.scenarios.length - 1 ? '1px solid rgba(251,146,60,.15)' : 'none',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', marginBottom: 4 }}>
                📋 {s.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
          {msg.safer && (
            <div style={{ padding: '10px 14px', background: 'rgba(0,212,170,.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', marginBottom: 6 }}>
                ✅ Safer alternatives:
              </div>
              {msg.safer.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3, lineHeight: 1.5 }}>{s}</div>
              ))}
            </div>
          )}
          {msg.when_doctor && (
            <div style={{
              padding: '8px 14px', fontSize: 11,
              color: 'var(--text3)', borderTop: '1px solid var(--border)',
              fontStyle: 'italic',
            }}>⚕️ {msg.when_doctor}</div>
          )}
        </motion.div>
      )}

      {/* Recovery summary pill */}
      {msg.summary && done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            maxWidth: '92%', padding: '8px 12px', borderRadius: 10,
            background: 'rgba(74,158,255,.08)', border: '1px solid rgba(74,158,255,.2)',
            fontSize: 11, color: '#4a9eff', lineHeight: 1.55,
          }}
        >
          {msg.summary}
        </motion.div>
      )}

      {/* Action buttons */}
      {msg.actions && msg.actions.length > 0 && done && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '92%' }}
        >
          {msg.actions.map((a, i) => (
            <motion.button
              key={i}
              onClick={() => onAction(a)}
              whileHover={{ scale: 1.04, borderColor: 'var(--teal)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '6px 11px', borderRadius: 20,
                border: '1px solid var(--border2)',
                background: 'var(--bg2)',
                color: 'var(--text2)',
                fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'border-color .15s',
              }}
            >
              <span>{a.icon}</span>
              <span>{actionLabel(a)}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Waveform bars ────────────────────────────────────────────────────────────
function Waveform({ active, color, bars = 20 }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 28 }}>
      {Array(bars).fill(0).map((_, i) => (
        <motion.div
          key={i}
          style={{ width: 3, borderRadius: 2, background: color }}
          animate={active
            ? { height: [4, 4 + Math.sin(i * 0.7) * 16 + 6, 4] }
            : { height: 4 }}
          transition={{ duration: 0.45 + i * 0.03, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── Pain trend mini chart ─────────────────────────────────────────────────────
function PainTrendChart({ logs }) {
  if (!logs || logs.length < 2) return null
  const last7 = logs.slice(-7)
  const max = 10
  const W = 200, H = 36

  const points = last7.map((l, i) => ({
    x: (i / (last7.length - 1)) * (W - 16) + 8,
    y: H - 4 - ((l.score / max) * (H - 12)),
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <div style={{ padding: '8px 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff6b7a" />
            <stop offset="1" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#trendGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="url(#trendGrad)" />
        ))}
      </svg>
      <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
        Pain trend<br />(last {last7.length}d)
      </div>
    </div>
  )
}

// ── Main VoiceAssistant component ─────────────────────────────────────────────
export default function VoiceAssistant() {
  const { lang, setLanguage, t, languageNames } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { logChatMessage, logChatNavigation } = useAnalytics()

  const [open, setOpen]             = useState(false)
  const [minimized, setMinimized]   = useState(false)
  const [listenState, setListenState] = useState('idle') // idle|listening|thinking|speaking
  const [messages, setMessages]     = useState([])
  const [textInput, setTextInput]   = useState('')
  const [ttsOk, setTtsOk]           = useState(false)
  const [sttOk, setSttOk]           = useState(false)
  const [ruralMode, setRuralModeState] = useState(getRuralMode)
  const [showChips, setShowChips]   = useState(true)
  const [checkinLogs, setCheckinLogs] = useState(getCheckins)
  const [tab, setTab]               = useState('chat') // chat|history|checkins

  const recRef    = useRef(null)
  const chatEndRef = useRef(null)
  const inputRef  = useRef(null)

  const userName = user?.name?.split(' ')[0] || ''

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    setTtsOk('speechSynthesis' in window)
    setSttOk(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
    // Pre-load voices (Chrome loads async on first call)
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices()
        if (v.length > 0) window.__pfVoices = v
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // ── Daily greeting ────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (messages.length > 0) return
    const greeting = getDailyGreeting(lang, userName)
    const ctxSummary = getAnalyticsSummaryForAI()
    if (greeting) {
      const ctxNote = ctxSummary ? ` (Your stats: ${ctxSummary})` : ''
      pushAI({ type: 'greeting', text: greeting + (ctxSummary ? ` Your progress: ${ctxSummary}. 🎯` : ''), actions: [] })
    } else {
      const ctxLine = ctxSummary ? ` Your progress so far: ${ctxSummary}.` : ''
      const welcome = {
        en: `Hi${userName ? ` ${userName}` : ''}! 👋 I'm your PhysioForge AI.${ctxLine} Describe how you're feeling, ask about exercises, or tap a suggestion below.`,
        hi: `नमस्ते${userName ? ` ${userName}` : ''}! 👋 मैं आपका PhysioForge AI हूं।${ctxLine ? ' ' + ctxLine : ''} दर्द बताएं या नीचे से चुनें।`,
        te: `నమస్కారం${userName ? ` ${userName}` : ''}! 👋 నేను మీ PhysioForge AI.${ctxLine ? ' ' + ctxLine : ''} నొప్పి వివరించండి లేదా కిందన ఎంచుకోండి.`,
      }
      pushAI({ type: 'greeting', text: welcome[lang] || welcome.en, actions: [] })
    }
  }, [open])

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, listenState])

  // ── Push helpers ──────────────────────────────────────────
  const pushUser = useCallback((text) => {
    setMessages(h => [...h, { role: 'user', text }])
    appendHistory('user', text)
    setShowChips(false)
  }, [])

  const pushAI = useCallback((resp) => {
    setMessages(h => [...h, { role: 'ai', ...resp }])
    appendHistory('ai', resp.text)
  }, [])

  // ── TTS ───────────────────────────────────────────────────
  const speak = useCallback((text, responseLang) => {
    if (!ttsOk) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300))
    const targetLang = responseLang || lang
    const targetBcp = SPEECH_LANG[targetLang] || 'en-IN'
    utt.lang = targetBcp
    utt.rate = ruralMode ? 0.8 : 0.92
    utt.pitch = 1.05

    // Select best available voice — use cached list for reliability (esp. Chrome async loading)
    const voices = window.__pfVoices || window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      // Priority: exact match → prefix match → language-family fallback → any English
      let voice = voices.find(v => v.lang === targetBcp)
      if (!voice) {
        const prefix = targetBcp.split('-')[0]
        voice = voices.find(v => v.lang.startsWith(prefix + '-'))
      }
      if (!voice && targetLang === 'te') {
        // Telugu not available on most browsers — use Hindi (closest script family) or Indian English
        voice = voices.find(v => v.lang === 'hi-IN')
          || voices.find(v => v.lang === 'en-IN')
          || voices.find(v => v.lang.startsWith('en'))
      }
      if (!voice && targetLang === 'hi') {
        voice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en'))
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en'))
      }
      if (voice) utt.voice = voice
    }

    setListenState('speaking')
    utt.onend = utt.onerror = () => setListenState('idle')
    window.speechSynthesis.speak(utt)
  }, [ttsOk, lang, ruralMode])

  // ── Process input ─────────────────────────────────────────
  const processInput = useCallback((input) => {
    if (!input.trim()) return
    pushUser(input)
    setListenState('thinking')
    setTextInput('')
    logChatMessage('user', 'general')

    setTimeout(() => {
      const resp = processMessage(input, lang, userName)
      pushAI(resp)
      setListenState('idle')
      speak(resp.text, resp.lang)
      logChatMessage('ai', resp.type || 'response')

      // Refresh checkin logs after processing
      setCheckinLogs(getCheckins())

      // Update rural mode state
      if (resp.type === 'rural') setRuralModeState(true)

      // Auto-navigate for explicit nav intents
      if (resp.autoNavigate && resp.route) {
        logChatNavigation(resp.route)
        setTimeout(() => navigate(resp.route), 1800)
      }
    }, ruralMode ? 300 : 520)
  }, [lang, userName, pushUser, pushAI, speak, navigate, ruralMode, logChatMessage, logChatNavigation])

  // ── STT ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { processInput('(voice not supported — please type)'); return }
    window.speechSynthesis?.cancel()
    const rec = new SR()
    rec.lang = SPEECH_LANG[lang] || 'en-IN'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListenState('listening')
    rec.onresult = e => processInput(e.results[0][0].transcript)
    rec.onerror = () => setListenState('idle')
    rec.onend = () => { if (listenState === 'listening') setListenState('idle') }
    recRef.current = rec
    try { rec.start() } catch {}
  }, [lang, processInput, listenState])

  const stopAll = useCallback(() => {
    try { recRef.current?.stop() } catch {}
    window.speechSynthesis?.cancel()
    setListenState('idle')
  }, [])

  const micAction = () => {
    if (listenState === 'listening' || listenState === 'speaking') stopAll()
    else startListening()
  }

  const sendText = () => {
    const v = textInput.trim()
    if (v) processInput(v)
  }

  const handleAction = useCallback((action) => {
    if (action.route) {
      logChatNavigation(action.route)
      navigate(action.route)
    }
  }, [navigate, logChatNavigation])

  const handleChip = (chip) => processInput(chip.text)

  const toggleRural = () => {
    const next = !ruralMode
    setRuralModeState(next)
    setRuralMode(next)
  }

  // ── Derived UI values ─────────────────────────────────────
  const micColor = listenState === 'listening' ? '#ff6b7a'
    : listenState === 'speaking' ? '#4a9eff' : 'var(--teal)'

  const micIcon = listenState === 'listening' ? '⏹'
    : listenState === 'speaking' ? '🔊' : '🎤'

  const stateLabel = {
    idle: sttOk ? (t('speak') || 'Tap mic or type') : 'Type your message',
    listening: t('listening') || '🔴 Listening...',
    thinking: 'Thinking...',
    speaking: '🔊 Speaking...',
  }[listenState]

  const chips = (QUICK_CHIPS[lang] || QUICK_CHIPS.en)

  // ── Persist chat across re-opens (load from LS on first open) ──
  useEffect(() => {
    if (open && messages.length === 0) {
      const hist = getHistory().slice(-20)
      if (hist.length > 2) {
        setMessages(hist.map(h => ({ role: h.role, text: h.text, type: 'restored' })))
        setShowChips(false)
      }
    }
  }, [open])

  const panelWidth = 360

  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating chat panel ────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{
              position: 'fixed',
              bottom: 90,
              right: 24,
              zIndex: 9990,
              width: panelWidth,
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,.55), 0 0 0 1px rgba(0,212,170,.08)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: minimized ? 64 : 'min(640px, 90vh)',
              transition: 'max-height .3s ease',
            }}
          >
            {/* ── Header ───────────────────────────────────── */}
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: minimized ? 'none' : '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg,rgba(0,212,170,.07),rgba(74,158,255,.04))',
              cursor: 'pointer', flexShrink: 0,
            }}
              onClick={() => minimized && setMinimized(false)}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <motion.div
                  animate={listenState !== 'idle' ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: 'linear-gradient(135deg,var(--teal),var(--blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, boxShadow: '0 4px 12px rgba(0,212,170,.3)',
                  }}
                >🤖</motion.div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                    PhysioForge AI
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ color: 'var(--teal)', fontSize: 8 }}
                    >●</motion.span>
                    {sttOk ? '🎤' : '⌨️'} · {ttsOk ? '🔊' : '📝'} ·{' '}
                    {ruralMode ? '🌾 Simple Mode' : `🤖 ${languageNames[lang]}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Smart AI / Simple Mode toggle */}
                <motion.button
                  onClick={e => { e.stopPropagation(); toggleRural() }}
                  whileTap={{ scale: 0.9 }}
                  title={ruralMode
                    ? 'Simple Offline Mode: shorter responses, no analytics. Click to switch to Smart AI Mode.'
                    : 'Smart AI Mode: full AI responses with analytics. Click to switch to Simple Offline Mode.'}
                  style={{
                    background: ruralMode ? 'rgba(251,191,36,.15)' : 'rgba(0,212,170,.1)',
                    border: `1px solid ${ruralMode ? 'rgba(251,191,36,.4)' : 'rgba(0,212,170,.3)'}`,
                    borderRadius: 8, padding: '3px 8px', fontSize: 10,
                    cursor: 'pointer', color: ruralMode ? '#fbbf24' : 'var(--teal)',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  {ruralMode ? '🌾 Simple' : '🤖 Smart'}
                </motion.button>
                {/* Minimize */}
                <motion.button
                  onClick={e => { e.stopPropagation(); setMinimized(m => !m) }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text2)', fontSize: 16, lineHeight: 1,
                    padding: '2px 4px',
                  }}
                >{minimized ? '▲' : '▬'}</motion.button>
                {/* Close */}
                <motion.button
                  onClick={e => { e.stopPropagation(); stopAll(); setOpen(false) }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text2)', fontSize: 18, lineHeight: 1,
                  }}
                >✕</motion.button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* ── Language selector + tabs ──────────────── */}
                <div style={{
                  padding: '8px 14px 0',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {/* Language chips */}
                  <div style={{ display: 'flex', gap: 5, marginRight: 6 }}>
                    {Object.entries(languageNames).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => setLanguage(code)}
                        style={{
                          padding: '3px 9px', borderRadius: 100, fontSize: 10,
                          border: `1px solid ${lang === code ? 'var(--teal)' : 'var(--border)'}`,
                          background: lang === code ? 'rgba(0,212,170,.12)' : 'transparent',
                          color: lang === code ? 'var(--teal)' : 'var(--text3)',
                          cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                          transition: 'all .15s',
                        }}
                      >{name}</button>
                    ))}
                  </div>
                  {/* Tab pills */}
                  {[
                    { key: 'chat', label: '💬 Chat' },
                    { key: 'checkins', label: `📊 Check-ins${checkinLogs.length > 0 ? ` (${checkinLogs.length})` : ''}` },
                  ].map(tb => (
                    <button
                      key={tb.key}
                      onClick={() => setTab(tb.key)}
                      style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: 10,
                        border: `1px solid ${tab === tb.key ? 'var(--blue)' : 'var(--border)'}`,
                        background: tab === tb.key ? 'rgba(74,158,255,.12)' : 'transparent',
                        color: tab === tb.key ? 'var(--blue)' : 'var(--text3)',
                        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                        marginBottom: 6,
                      }}
                    >{tb.label}</button>
                  ))}
                </div>

                {/* ── TAB: Check-ins ──────────────────────────── */}
                {tab === 'checkins' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                    <PainTrendChart logs={checkinLogs} />
                    {checkinLogs.length === 0 ? (
                      <div style={{ textAlign: 'center', paddingTop: 30, color: 'var(--text3)', fontSize: 13 }}>
                        No check-ins yet.<br />Chat and report your pain score (1–10).
                      </div>
                    ) : (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[...checkinLogs].reverse().slice(0, 14).map((l, i) => {
                          const color = l.score <= 3 ? '#34d399' : l.score <= 6 ? '#fbbf24' : '#ff6b7a'
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 12px', borderRadius: 10,
                              background: 'var(--bg3)', border: '1px solid var(--border)',
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                background: `${color}22`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 15, color,
                              }}>{l.score}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
                                  Pain {l.score}/10
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                                  {new Date(l.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                              {/* Mini bar */}
                              <div style={{ width: 60, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${l.score * 10}%`,
                                  background: color, borderRadius: 3,
                                }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB: Chat ───────────────────────────────── */}
                {tab === 'chat' && (
                  <>
                    {/* Message list */}
                    <div style={{
                      flex: 1, overflowY: 'auto', padding: '12px 14px',
                      display: 'flex', flexDirection: 'column', gap: 14,
                      minHeight: 0,
                    }}>
                      {messages.length === 0 && (
                        <div style={{
                          fontSize: 12, color: 'var(--text3)',
                          textAlign: 'center', paddingTop: 24, fontStyle: 'italic',
                        }}>
                          {lang === 'hi' ? 'बोलें या टाइप करें...'
                            : lang === 'te' ? 'మాట్లాడండి లేదా టైప్ చేయండి...'
                            : 'Speak or type — I understand English, Hindi & Telugu'}
                        </div>
                      )}

                      {messages.map((msg, i) => (
                        <MessageBubble
                          key={i}
                          msg={msg}
                          onAction={handleAction}
                          lang={lang}
                        />
                      ))}

                      {/* Thinking indicator */}
                      {listenState === 'thinking' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 8,
                            background: 'linear-gradient(135deg,var(--teal),var(--blue))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                          }}>🤖</div>
                          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'var(--bg3)', borderRadius: '4px 18px 18px 18px', border: '1px solid var(--border)' }}>
                            {[0, 0.18, 0.36].map((d, i) => (
                              <motion.div
                                key={i}
                                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.55, repeat: Infinity, delay: d }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Quick chips */}
                    <AnimatePresence>
                      {showChips && messages.length <= 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            padding: '0 12px 8px',
                            display: 'flex', flexWrap: 'wrap', gap: 5, flexShrink: 0,
                          }}
                        >
                          {chips.map((chip, i) => (
                            <motion.button
                              key={i}
                              onClick={() => handleChip(chip)}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.06 }}
                              whileHover={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
                              style={{
                                padding: '5px 10px', borderRadius: 14,
                                border: '1px solid var(--border)',
                                background: 'var(--bg3)', color: 'var(--text2)',
                                fontSize: 11, cursor: 'pointer',
                                fontFamily: "'DM Sans',sans-serif",
                                transition: 'all .15s', textAlign: 'left',
                              }}
                            >{chip.text}</motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Mic control ─────────────────────────── */}
                    <div style={{
                      padding: '8px 16px', borderTop: '1px solid var(--border)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      flexShrink: 0,
                    }}>
                      <Waveform
                        active={listenState === 'listening' || listenState === 'speaking'}
                        color={micColor}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <motion.button
                          onClick={micAction}
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.92 }}
                          style={{
                            width: 50, height: 50, borderRadius: '50%',
                            background: `linear-gradient(135deg,${micColor},${micColor}88)`,
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, position: 'relative',
                            boxShadow: `0 4px 16px ${micColor}44`,
                          }}
                        >
                          {listenState === 'listening' && (
                            <motion.div
                              style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: '#ff6b7a', opacity: 0.3,
                              }}
                              animate={{ scale: [1, 1.7, 1.7], opacity: [0.3, 0, 0] }}
                              transition={{ duration: 1.3, repeat: Infinity }}
                            />
                          )}
                          {micIcon}
                        </motion.button>
                        <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', maxWidth: 160 }}>
                          {stateLabel}
                        </div>
                      </div>
                    </div>

                    {/* ── Text input ──────────────────────────── */}
                    <div style={{ padding: '0 12px 12px', display: 'flex', gap: 7, flexShrink: 0 }}>
                      <input
                        type="text"
                        ref={inputRef}
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
                        placeholder={
                          lang === 'hi' ? 'यहां टाइप करें...'
                          : lang === 'te' ? 'ఇక్కడ టైప్ చేయండి...'
                          : 'Type your question...'
                        }
                        style={{
                          flex: 1, padding: '9px 13px',
                          background: 'var(--bg3)',
                          border: '1px solid var(--border)',
                          borderRadius: 12, color: 'var(--text)',
                          fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", outline: 'none',
                          transition: 'border-color .15s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <motion.button
                        type="button"
                        onClick={sendText}
                        whileTap={{ scale: 0.9 }}
                        disabled={!textInput.trim()}
                        style={{
                          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                          background: textInput.trim()
                            ? 'linear-gradient(135deg,var(--teal),var(--blue))'
                            : 'var(--bg3)',
                          border: textInput.trim() ? 'none' : '1px solid var(--border)',
                          cursor: textInput.trim() ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: textInput.trim() ? '#fff' : 'var(--text3)',
                          transition: 'all .2s',
                        }}
                      >↑</motion.button>
                    </div>

                    {/* ── Disclaimer ──────────────────────────── */}
                    <div style={{
                      padding: '6px 14px 10px',
                      fontSize: 9.5, color: 'var(--text3)', textAlign: 'center',
                      lineHeight: 1.5, flexShrink: 0,
                    }}>
                      {ruralMode
                        ? '🌾 Simple Offline Mode — shorter, direct answers. No analytics needed.'
                        : '🤖 Smart AI Mode — personalized responses using your recovery data.'}
                      {' · '}AI guidance only. Not a substitute for medical advice.
                      Always consult your physiotherapist for treatment decisions.
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <motion.button
        onClick={() => { setOpen(o => !o); setMinimized(false) }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.91 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9991,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--teal),var(--blue))',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(0,212,170,.45)',
        }}
      >
        {/* Pulse ring */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'var(--teal)', opacity: 0.3,
          }}
          animate={{ scale: [1, 1.55, 1.55], opacity: [0.3, 0, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              style={{ fontSize: 20, color: 'white', lineHeight: 1 }}
            >✕</motion.span>
          ) : (
            <motion.div
              key="mic"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
                <line x1="9" y1="23" x2="15" y2="23" strokeLinecap="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
