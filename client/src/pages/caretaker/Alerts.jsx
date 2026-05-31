import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'

const LS_KEY = 'pf_caretaker_alert_state'

function loadState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveState(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch {}
}

const allAlerts = [
  { patient: 'Rajesh Kumar', type: 'missed', message: 'Missed 3 consecutive sessions', severity: 'high', time: '2h ago' },
  { patient: 'Rajesh Kumar', type: 'pain', message: 'Reported pain spike 8/10', severity: 'high', time: '4h ago' },
  { patient: 'Rajesh Kumar', type: 'missed', message: 'Wednesday session skipped', severity: 'medium', time: '1d ago' },
  { patient: 'Rajesh Kumar', type: 'pain', message: 'Knee pain 6/10 before morning session', severity: 'medium', time: '2d ago' },
]

function Toast({ msg, onDone }) {
  useState(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) })
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2000, background: 'var(--bg2)', border: '1px solid rgba(0,212,170,.35)',
        borderRadius: 14, padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 40px rgba(0,0,0,.3)', whiteSpace: 'nowrap',
      }}>
      <span style={{ fontSize: 18 }}>📲</span>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>{msg}</span>
    </motion.div>
  )
}

export default function CaretakerAlerts() {
  const init = loadState()
  const [resolved, setResolved] = useState(() => init.resolved || [])
  const [reminded, setReminded] = useState(() => init.reminded || [])
  const [toast, setToast] = useState('')

  const persist = (r, rm) => saveState({ resolved: r, reminded: rm })

  const handleRemind = (i, patient) => {
    const next = [...new Set([...reminded, i])]
    setReminded(next)
    persist(resolved, next)
    setToast(`Reminder sent to ${patient} via SMS & app notification`)
  }

  const handleResolve = (i) => {
    const next = [...resolved, i]
    setResolved(next)
    persist(next, reminded)
  }

  const unresolved = allAlerts.filter((_, i) => !resolved.includes(i))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Alerts</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>{unresolved.length} unresolved alert{unresolved.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {allAlerts.map((a, i) => {
          const isResolved = resolved.includes(i)
          const isReminded = reminded.includes(i)
          const color = a.severity === 'high' ? 'red' : 'amber'
          const borderRgb = color === 'red' ? '255,107,122' : '251,191,36'
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: isResolved ? 0.45 : 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: isResolved ? 'var(--bg2)' : `rgba(${borderRgb},.05)`,
                border: `1px solid rgba(${borderRgb},${isResolved ? '.1' : '.25'})`,
                borderRadius: 16, padding: '16px 20px',
                display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap',
              }}>
              <div style={{ fontSize: 28 }}>{a.type === 'missed' ? '⏰' : '🔴'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.patient}</span>
                  <Badge color={color} style={{ fontSize: 10 }}>{a.severity}</Badge>
                  {isResolved && <Badge color="green" style={{ fontSize: 10 }}>✓ Resolved</Badge>}
                  {isReminded && !isResolved && <Badge color="blue" style={{ fontSize: 10 }}>📲 Reminded</Badge>}
                </div>
                <div style={{ fontSize: 13, color: `var(--${color})`, marginBottom: 3 }}>{a.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.time}</div>
              </div>
              {!isResolved && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn
                    variant={isReminded ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => handleRemind(i, a.patient)}>
                    {isReminded ? '📲 Resend' : 'Remind'}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => handleResolve(i)}>Resolve</Btn>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <GlassCard style={{ background: 'rgba(255,107,122,.05)', borderColor: 'rgba(255,107,122,.2)' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🆘 Emergency Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="ghost" size="sm" onClick={() => setToast('Calling Rajesh Kumar...')}>📞 Call Rajesh</Btn>
          <Btn variant="ghost" size="sm" onClick={() => setToast('Calling Dr. Sharma...')}>👨‍⚕️ Call Dr. Sharma</Btn>
          <Btn variant="danger" size="sm" onClick={() => window.open('tel:108')}>🏥 Ambulance (108)</Btn>
        </div>
      </GlassCard>

      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  )
}
