import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { recoveryJourney } from '../../data/mockData'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../i18n'

/* ─── Storage key ───────────────────────────────────────────────── */
const STORAGE_KEY = 'physioforge_recovery_replies'

/* ─── Initial doctor messages ────────────────────────────────────── */
const INITIAL_DOCTOR_MESSAGES = [
  {
    id: 'doc-1',
    doctorName: 'Dr. Arjun Sharma',
    doctorEmoji: '👨‍⚕️',
    text: 'Priya, your strength numbers look excellent this week. The quadriceps activation during bridge exercises has improved significantly. Let\'s push to 3 sets of 15 reps from Monday. Keep up the incredible consistency! 🌟',
    timestamp: Date.now() - 86400000, // yesterday
  },
  {
    id: 'doc-2',
    doctorName: 'Dr. Arjun Sharma',
    doctorEmoji: '👨‍⚕️',
    text: 'How is your knee pain today on a scale of 1–10? Please also let me know if you experienced any swelling after yesterday\'s exercises.',
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
  },
]

/* ─── Milestone styling ─────────────────────────────────────────── */
const milestoneDetails = {
  done:    { bg: 'linear-gradient(135deg,var(--teal),var(--blue))', border: 'none', icon: '✓' },
  active:  { bg: 'rgba(0,212,170,.15)', border: '2px solid var(--teal)', icon: null },
  pending: { bg: 'var(--bg3)', border: '1px solid var(--border)', icon: null },
}

/* ─── Relative timestamp helper ─────────────────────────────────── */
function relativeTime(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins} min${mins > 1 ? 's' : ''} ago`
  if (hrs  < 24)  return `Today ${new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (days === 1) return `Yesterday ${new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

/* ─── Load / save from localStorage ─────────────────────────────── */
function loadReplies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveReplies(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

/* ─── Reply Thread for a single doctor message ───────────────────── */
function ReplyThread({ msgId, elderMode, t }) {
  const [open, setOpen]       = useState(false)
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const [replies, setReplies] = useState(() => {
    const all = loadReplies()
    return all[msgId] || []
  })
  const [error, setError]     = useState('')
  const inputRef              = useRef(null)
  const bottomRef             = useRef(null)

  // Persist on every change
  useEffect(() => {
    const all = loadReplies()
    all[msgId] = replies
    saveReplies(all)
  }, [replies, msgId])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  // Auto-scroll to latest reply
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
    }
  }, [replies, open])

  const sendReply = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) { setError(t ? t('replyEmpty') : 'Please type a message before sending.'); return }
    setError('')
    setSending(true)
    setTimeout(() => {
      setReplies(prev => [...prev, {
        id: `reply-${Date.now()}`,
        text: trimmed,
        timestamp: Date.now(),
      }])
      setText('')
      setSending(false)
    }, 320) // brief send animation
  }, [text, t])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }, [sendReply])

  const fs = elderMode ? 15 : 13
  const inputPad = elderMode ? '12px 14px' : '9px 12px'
  const btnH = elderMode ? 44 : 34

  return (
    <div style={{ marginTop: 12 }}>
      {/* Existing replies (always visible even when collapsed) */}
      {replies.length > 0 && (
        <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {replies.map(r => (
            <motion.div key={r.id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              }}>
              <div style={{
                background: 'linear-gradient(135deg,rgba(0,212,170,.18),rgba(74,158,255,.12))',
                border: '1px solid rgba(0,212,170,.3)',
                borderRadius: '14px 14px 4px 14px',
                padding: elderMode ? '10px 14px' : '8px 12px',
                maxWidth: '85%',
              }}>
                <div style={{ fontSize: fs, color: 'var(--text)', lineHeight: 1.55 }}>{r.text}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, marginRight: 2 }}>
                You · {relativeTime(r.timestamp)}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Toggle reply box */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setOpen(o => !o); setError('') }}
          style={{
            height: btnH, padding: elderMode ? '0 20px' : '0 14px',
            borderRadius: 100, border: '1px solid var(--border)',
            background: open ? 'rgba(0,212,170,.12)' : 'var(--bg3)',
            color: open ? 'var(--teal)' : 'var(--text2)',
            fontSize: elderMode ? 14 : 12, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif", transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          {open ? '✕ Close' : `💬 Reply${replies.length > 0 ? ` (${replies.length})` : ''}`}
        </button>
      </div>

      {/* Inline reply input */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ overflow: 'hidden' }}>
            <div style={{
              background: 'var(--bg3)', borderRadius: 14,
              border: '1px solid var(--border)', padding: 12,
            }}>
              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => { setText(e.target.value); if (error) setError('') }}
                onKeyDown={handleKey}
                placeholder={t ? t('replyPlaceholder') : 'Type your reply… (Enter to send)'}
                rows={elderMode ? 3 : 2}
                style={{
                  width: '100%', resize: 'none',
                  background: 'var(--bg2)', color: 'var(--text)',
                  border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: 10, padding: inputPad,
                  fontSize: fs, fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.55, outline: 'none',
                  transition: 'border-color .15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = 'var(--teal)' }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
              />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 12, color: 'var(--red)', marginTop: 5, marginLeft: 2 }}>
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {text.length > 0 ? `${text.length} chars · Enter to send` : 'Shift+Enter for new line'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setText(''); setError(''); setOpen(false) }}
                    style={{
                      height: btnH, padding: elderMode ? '0 18px' : '0 14px',
                      borderRadius: 100, border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text2)',
                      fontSize: elderMode ? 14 : 12, cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif",
                    }}>
                    Cancel
                  </button>
                  <motion.button
                    onClick={sendReply}
                    whileTap={{ scale: 0.95 }}
                    disabled={sending}
                    style={{
                      height: btnH, padding: elderMode ? '0 22px' : '0 18px',
                      borderRadius: 100, border: 'none',
                      background: 'linear-gradient(135deg,var(--teal),var(--blue))',
                      color: '#fff', fontSize: elderMode ? 14 : 12, cursor: sending ? 'default' : 'pointer',
                      fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                      opacity: sending ? 0.75 : 1, transition: 'opacity .15s',
                    }}>
                    {sending
                      ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: .6, repeat: Infinity, ease: 'linear' }}>⟳</motion.span> Sending…</>
                      : '📤 Send'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function RecoveryJourney() {
  const navigate    = useNavigate()
  const { elderMode } = useAuth()
  const { t }       = useLang()
  const progress    = 60

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Badge color="teal" style={{ marginBottom: 10 }}>Recovery Tracker</Badge>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 30 : 26, fontWeight: 800, marginBottom: 6 }}>
          Your Recovery Journey
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: elderMode ? 15 : 14 }}>
          ACL Rehabilitation · Week 3 of 6 · You are ahead of schedule 🎯
        </p>
      </div>

      {/* Progress bar */}
      <GlassCard style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: elderMode ? 17 : 15 }}>Overall Progress</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 26 : 22, fontWeight: 800, color: 'var(--teal)' }}>{progress}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--bg3)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,var(--teal),var(--blue))' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
          <span>Start</span><span>Week 3 — You are here</span><span>Full Recovery</span>
        </div>
      </GlassCard>

      {/* Timeline */}
      <GlassCard style={{ marginBottom: 24, padding: 32 }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 20 : 18, fontWeight: 700, marginBottom: 28 }}>
          Recovery Milestones
        </h3>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'var(--bg4)' }} />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(recoveryJourney.filter(s => s.status === 'done').length / recoveryJourney.length) * 100}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: .3 }}
            style={{ position: 'absolute', left: 19, top: 0, width: 2, background: 'linear-gradient(to bottom,var(--teal),var(--blue))' }} />

          {recoveryJourney.map((step, i) => {
            const m = milestoneDetails[step.status]
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .15 + .2 }}
                style={{ display: 'flex', gap: 20, marginBottom: i < recoveryJourney.length - 1 ? 32 : 0, position: 'relative' }}>
                <motion.div
                  animate={step.status === 'active' ? { boxShadow: ['0 0 0 0 rgba(0,212,170,0.4)', '0 0 0 12px rgba(0,212,170,0)', '0 0 0 0 rgba(0,212,170,0)'] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: m.bg, border: m.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: step.status === 'done' ? 18 : 20, flexShrink: 0, zIndex: 1, color: '#fff', fontWeight: 700 }}>
                  {m.icon || step.icon}
                </motion.div>
                <div style={{ flex: 1, paddingTop: 6, background: step.status === 'active' ? 'linear-gradient(135deg,rgba(0,212,170,.06),rgba(74,158,255,.03))' : 'transparent', borderRadius: 14, padding: '10px 16px', border: step.status === 'active' ? '1px solid rgba(0,212,170,.2)' : 'none', marginLeft: step.status === 'active' ? -6 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 18 : 16, fontWeight: 700, color: step.status === 'pending' ? 'var(--text3)' : 'var(--text)' }}>{step.label}</span>
                    {step.status === 'active'  && <Badge color="teal">● In Progress</Badge>}
                    {step.status === 'done'    && <Badge color="green">✓ Completed</Badge>}
                    {step.status === 'pending' && <Badge color="amber">Upcoming</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{step.date}</div>
                  <p style={{ fontSize: elderMode ? 14 : 13, color: 'var(--text2)', lineHeight: 1.6 }}>{step.desc}</p>
                  {step.status === 'active' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                        <span>Progress in this stage</span><span style={{ color: 'var(--teal)' }}>68%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.2, delay: .8 }}
                          style={{ height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 3 }} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>

      {/* Doctor messages with threaded replies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {INITIAL_DOCTOR_MESSAGES.map((msg, idx) => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * .1 }}>
            <GlassCard>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: elderMode ? 50 : 44, height: elderMode ? 50 : 44,
                  borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: elderMode ? 24 : 20, flexShrink: 0,
                }}>
                  {msg.doctorEmoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Doctor name + timestamp */}
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: elderMode ? 16 : 14 }}>
                    {msg.doctorName}{' '}
                    <span style={{ fontSize: elderMode ? 13 : 12, color: 'var(--text3)', fontWeight: 400 }}>
                      · {relativeTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Doctor message bubble */}
                  <div style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: '4px 14px 14px 14px',
                    padding: elderMode ? '12px 16px' : '10px 14px',
                    marginBottom: 4,
                  }}>
                    <p style={{ color: 'var(--text2)', fontSize: elderMode ? 15 : 14, lineHeight: 1.7, margin: 0 }}>
                      {msg.text}
                    </p>
                  </div>

                  {/* Book follow-up only on first message */}
                  {idx === 0 && (
                    <div style={{ marginTop: 10, marginBottom: 2 }}>
                      <Btn variant="primary" size="sm" onClick={() => navigate('/patient/teleconsult')}>
                        📹 Book Follow-up
                      </Btn>
                    </div>
                  )}

                  {/* Reply thread */}
                  <ReplyThread
                    msgId={msg.id}
                    elderMode={elderMode}
                    t={t}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
