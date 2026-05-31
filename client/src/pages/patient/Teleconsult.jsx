import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { mockAppointments } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

// ─── localStorage helpers ───────────────────────────────────────────────────
const LS_KEY = 'pf_appointments'

function loadAppointments() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveAppointments(appts) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(appts)) } catch {}
}

// ─── Time slots available for booking ───────────────────────────────────────
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM',
]

// Format today's date as YYYY-MM-DD (for min date on input)
function todayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// Format "2025-06-03" → "Jun 3, 2025"
function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

// ─── Reschedule Modal ────────────────────────────────────────────────────────
function RescheduleModal({ appointment, onClose, onConfirm, elderMode }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fs = elderMode ? { label: 16, input: 16, btn: 18, slot: 15 } : { label: 13, input: 14, btn: 15, slot: 13 }
  const pad = elderMode ? 20 : 14

  const validate = () => {
    if (!date) return 'Please select a new date.'
    if (!time) return 'Please select a time slot.'
    const selected = new Date(`${date}T${convertTo24(time)}`)
    if (selected <= new Date()) return 'Please select a future date and time.'
    return ''
  }

  function convertTo24(slot) {
    const [timePart, ampm] = slot.split(' ')
    let [h, m] = timePart.split(':').map(Number)
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }

  const handleConfirm = async () => {
    const err = validate()
    if (err) return setError(err)
    setError('')
    setLoading(true)
    // Simulate async save
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    onConfirm(appointment.id, { date: formatDate(date), time, reason })
  }

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px'
      }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 24, width: '100%', maxWidth: elderMode ? 520 : 460,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
        }}>

        {/* Header */}
        <div style={{ padding: `${pad}px ${pad + 4}px`, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 22 : 18, fontWeight: 800, marginBottom: 4 }}>
              📅 Reschedule Appointment
            </div>
            <div style={{ color: 'var(--text2)', fontSize: fs.label }}>
              {appointment.topic} · {appointment.doctor}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: elderMode ? 40 : 32, height: elderMode ? 40 : 32, cursor: 'pointer', color: 'var(--text2)', fontSize: elderMode ? 18 : 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: `${pad}px ${pad + 4}px`, display: 'flex', flexDirection: 'column', gap: elderMode ? 22 : 18 }}>

          {/* Current appointment info */}
          <div style={{ background: 'rgba(255,107,122,.06)', border: '1px solid rgba(255,107,122,.18)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: fs.label, color: 'var(--text2)', marginBottom: 4 }}>Current schedule</div>
            <div style={{ fontSize: fs.input, fontWeight: 600, color: 'var(--red)' }}>
              📆 {appointment.date} at {appointment.time}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label style={{ display: 'block', fontSize: fs.label, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
              Select New Date <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => { setDate(e.target.value); setError('') }}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)', border: `1px solid ${date ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: 12, padding: elderMode ? '14px 16px' : '11px 14px',
                color: 'var(--text)', fontSize: fs.input,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Time slots */}
          <div>
            <label style={{ display: 'block', fontSize: fs.label, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
              Select Time Slot <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: elderMode ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: elderMode ? 10 : 7 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} onClick={() => { setTime(slot); setError('') }}
                  style={{
                    padding: elderMode ? '12px 6px' : '9px 4px',
                    borderRadius: 10,
                    border: `1px solid ${time === slot ? 'var(--teal)' : 'var(--border)'}`,
                    background: time === slot ? 'rgba(0,212,170,.12)' : 'var(--bg3)',
                    color: time === slot ? 'var(--teal)' : 'var(--text2)',
                    fontSize: fs.slot, fontFamily: "'DM Sans',sans-serif",
                    cursor: 'pointer', transition: 'all .15s',
                    fontWeight: time === slot ? 700 : 400
                  }}>
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason (optional) */}
          <div>
            <label style={{ display: 'block', fontSize: fs.label, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
              Reason / Message <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Conflict with work schedule, travelling..."
              rows={elderMode ? 4 : 3}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 12, padding: elderMode ? '14px 16px' : '11px 14px',
                color: 'var(--text)', fontSize: fs.input,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
                lineHeight: 1.5
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Validation error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ background: 'rgba(255,107,122,.08)', border: '1px solid rgba(255,107,122,.2)', borderRadius: 10, padding: '10px 14px', fontSize: fs.label, color: 'var(--red)', lineHeight: 1.5 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Btn variant="ghost" size={elderMode ? 'lg' : 'md'} onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </Btn>
            <Btn variant="primary" size={elderMode ? 'lg' : 'md'} onClick={handleConfirm} disabled={loading || !date || !time}
              style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? '⟳ Saving...' : '✅ Confirm Reschedule'}
            </Btn>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Toast notification ──────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2000, background: 'var(--bg2)',
        border: '1px solid rgba(0,212,170,.35)',
        borderRadius: 14, padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 40px rgba(0,212,170,.15)',
        whiteSpace: 'nowrap'
      }}>
      <span style={{ fontSize: 20 }}>✅</span>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{message}</span>
    </motion.div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function TeleconsultPage() {
  const { elderMode } = useAuth()
  const [joining, setJoining] = useState(null)
  const [booking, setBooking] = useState(null)
  const [booked, setBooked] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)  // appointment being rescheduled
  const [toast, setToast] = useState('')

  // Appointments — hydrate from localStorage, fall back to mock data
  const [appointments, setAppointments] = useState(() => {
    const stored = loadAppointments()
    return stored || mockAppointments
  })

  // The "next session" banner uses the first confirmed appointment
  const nextSession = appointments.find(a => a.status === 'confirmed') || appointments[0]

  const handleReschedule = useCallback((appointmentId, { date, time, reason }) => {
    setAppointments(prev => {
      const updated = prev.map(a =>
        a.id === appointmentId
          ? { ...a, date, time, status: 'rescheduled', reason: reason || undefined }
          : a
      )
      saveAppointments(updated)
      return updated
    })
    setRescheduleTarget(null)
    setToast('Appointment rescheduled successfully')
  }, [])

  const apptBtnSize = elderMode ? 'lg' : 'md'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 30 : 26, fontWeight: 800, marginBottom: 6 }}>Teleconsultation</h1>
        <p style={{ color: 'var(--text2)', fontSize: elderMode ? 16 : 14 }}>Video consultations, quick check-ins, and appointment booking with Dr. Arjun Sharma.</p>
      </div>

      {/* Active appointment banner */}
      {nextSession && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg,rgba(0,212,170,.1),rgba(74,158,255,.06))', border: '1px solid rgba(0,212,170,.25)', borderRadius: 20, padding: elderMode ? 28 : 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <Badge color="teal">● Next Session</Badge>
              {nextSession.status === 'rescheduled' && <Badge color="amber">Rescheduled</Badge>}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 24 : 20, fontWeight: 800, marginBottom: 4 }}>{nextSession.topic}</div>
            <div style={{ color: 'var(--text2)', fontSize: elderMode ? 16 : 14 }}>
              {nextSession.doctor} · {nextSession.date} at {nextSession.time} · Video Call
            </div>
            {nextSession.reason && (
              <div style={{ marginTop: 6, fontSize: elderMode ? 14 : 12, color: 'var(--amber)', fontStyle: 'italic' }}>
                📝 Note: {nextSession.reason}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn variant="primary" size={elderMode ? 'xl' : 'lg'} onClick={() => setJoining('main')}>
              {joining === 'main' ? '🔴 In Call...' : '📹 Join Now'}
            </Btn>
            <Btn variant="ghost" size={elderMode ? 'xl' : 'lg'} onClick={() => setRescheduleTarget(nextSession)}>
              🗓 Reschedule
            </Btn>
          </div>
        </motion.div>
      )}

      {/* Video call simulation */}
      {joining && (
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#0a0a1a', borderRadius: 20, height: 340, position: 'relative', marginBottom: 24, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👨‍⚕️</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Dr. Arjun Sharma</div>
              <motion.div animate={{ opacity: [1, .3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: 'var(--teal)', fontSize: 14 }}>● Connected</motion.div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 120, height: 80, background: 'var(--bg3)', borderRadius: 12, border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>😊</div>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12 }}>
            {['🎤', '📷', '🔊'].map((icon, i) => (
              <button key={i} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', fontSize: 20, cursor: 'pointer' }}>{icon}</button>
            ))}
            <button onClick={() => setJoining(null)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--red)', border: 'none', fontSize: 16, cursor: 'pointer', color: '#fff' }}>✕</button>
          </div>
          <div style={{ position: 'absolute', top: 16, left: 16 }}><Badge color="red">● 00:04:22</Badge></div>
        </motion.div>
      )}

      {/* Upcoming appointments */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: elderMode ? 16 : 14 }}>📅 Upcoming Appointments</div>
        {appointments.map((a, i) => (
          <motion.div key={a.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', padding: elderMode ? '16px 0' : '12px 0', borderBottom: i < appointments.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: elderMode ? '10px 16px' : '8px 12px', textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: elderMode ? 13 : 11, color: 'var(--text2)' }}>{a.date}</div>
              <div style={{ fontSize: elderMode ? 16 : 14, fontWeight: 700, color: 'var(--blue)' }}>{a.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: elderMode ? 16 : 14 }}>{a.topic}</div>
              <div style={{ fontSize: elderMode ? 14 : 12, color: 'var(--text2)' }}>{a.doctor}</div>
              {a.reason && (
                <div style={{ fontSize: elderMode ? 13 : 11, color: 'var(--amber)', marginTop: 2, fontStyle: 'italic' }}>
                  📝 {a.reason}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge color={a.type === 'video' ? 'blue' : a.type === 'in-person' ? 'green' : 'amber'} style={{ fontSize: 11 }}>
                {a.type === 'video' ? '📹 Video' : a.type === 'in-person' ? '🏥 In-Person' : '💬 Check-in'}
              </Badge>
              <Badge color={a.status === 'confirmed' ? 'teal' : a.status === 'rescheduled' ? 'amber' : 'amber'} style={{ fontSize: 11 }}>
                {a.status}
              </Badge>
              <Btn variant="ghost" size={elderMode ? 'md' : 'sm'} onClick={() => setRescheduleTarget(a)}
                style={{ fontSize: elderMode ? 13 : 11, padding: elderMode ? '8px 14px' : '5px 10px' }}>
                🗓 Reschedule
              </Btn>
            </div>
          </motion.div>
        ))}
      </GlassCard>

      {/* Book appointment */}
      <GlassCard>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: elderMode ? 16 : 14 }}>📋 Book a New Appointment</div>
        {!booked ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['📹 Video Call', 'video'], ['🏥 In-Person', 'in-person'], ['💬 Quick Check-in', 'quick'], ['📞 Phone Call', 'phone']].map(([label, type], i) => (
                <button key={i} onClick={() => setBooking(type)}
                  style={{ padding: elderMode ? '18px' : '14px', borderRadius: 12, border: `1px solid ${booking === type ? 'var(--teal)' : 'var(--border)'}`, background: booking === type ? 'rgba(0,212,170,.08)' : 'var(--bg3)', color: booking === type ? 'var(--teal)' : 'var(--text2)', cursor: 'pointer', fontSize: elderMode ? 16 : 14, fontFamily: "'DM Sans',sans-serif" }}>
                  {label}
                </button>
              ))}
            </div>
            <Btn variant="primary" disabled={!booking} size={elderMode ? 'lg' : 'md'} onClick={() => setBooked(true)} style={{ width: '100%', justifyContent: 'center' }}>
              Request Appointment
            </Btn>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: elderMode ? 22 : 18, fontWeight: 700, marginBottom: 8 }}>Appointment Requested!</div>
            <div style={{ color: 'var(--text2)', fontSize: elderMode ? 16 : 14 }}>Dr. Sharma will confirm within 2 hours.</div>
            <Btn variant="ghost" size="sm" onClick={() => { setBooked(false); setBooking(null) }} style={{ marginTop: 16 }}>Book Another</Btn>
          </motion.div>
        )}
      </GlassCard>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            appointment={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onConfirm={handleReschedule}
            elderMode={elderMode}
          />
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  )
}
