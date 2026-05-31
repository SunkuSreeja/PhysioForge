import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { mockAlerts, mockAppointments } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

// ── Alerts ────────────────────────────────────────
export function CaretakerAlerts() {
  const [resolved, setResolved] = useState([])

  const allAlerts = [
    ...mockAlerts,
    { patient: 'Rajesh Kumar', type: 'missed', message: 'Wednesday session was skipped entirely', severity: 'medium', time: '1d ago' },
    { patient: 'Rajesh Kumar', type: 'pain', message: 'Reported knee pain 6/10 before morning session', severity: 'medium', time: '2d ago' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Alerts & Notifications</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>{allAlerts.filter((_, i) => !resolved.includes(i)).length} unresolved alerts</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allAlerts.map((a, i) => {
          const isResolved = resolved.includes(i)
          const color = a.severity === 'high' ? 'red' : 'amber'
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: isResolved ? .45 : 1, y: 0 }} transition={{ delay: i * .06 }}
              style={{ background: isResolved ? 'var(--bg2)' : `rgba(${color === 'red' ? '255,107,122' : '251,191,36'},.05)`, border: `1px solid rgba(${color === 'red' ? '255,107,122' : '251,191,36'},.${isResolved ? '1' : '25'})`, borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>
                {a.type === 'missed' ? '⏰' : a.type === 'pain' ? '🔴' : '📐'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.patient}</span>
                  <Badge color={color} style={{ fontSize: 11 }}>{a.severity}</Badge>
                  {isResolved && <Badge color="green" style={{ fontSize: 11 }}>✓ Resolved</Badge>}
                </div>
                <div style={{ fontSize: 13, color: `var(--${color})`, marginBottom: 4 }}>{a.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.time}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                {!isResolved && (
                  <>
                    <Btn variant="primary" size="sm" onClick={() => {}}>Send Reminder</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setResolved(r => [...r, i])}>Mark Resolved</Btn>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Emergency action */}
      <div style={{ marginTop: 24 }}>
        <GlassCard style={{ background: 'rgba(255,107,122,.05)', borderColor: 'rgba(255,107,122,.2)' }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>🆘 Emergency Actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['📞 Call Rajesh', '👨‍⚕️ Call Dr. Sharma', '🏥 Call Ambulance (108)'].map((btn, i) => (
              <Btn key={i} variant={i === 2 ? 'danger' : 'ghost'} size="sm">{btn}</Btn>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ── Appointments ──────────────────────────────────
export function CaretakerAppointments() {
  const [booked, setBooked] = useState(false)
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Appointments</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Rajesh's upcoming consultations with Dr. Arjun Sharma</p>
      </div>

      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>📅 Upcoming Sessions</div>
        {mockAppointments.slice(0, 2).map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 70 }}>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{a.date}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{a.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.topic}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>with {a.doctor}</div>
            </div>
            <Badge color={a.status === 'confirmed' ? 'teal' : 'amber'} style={{ fontSize: 11 }}>{a.status}</Badge>
          </div>
        ))}
      </GlassCard>

      <GlassCard>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>📋 Book on Rajesh's Behalf</div>
        {!booked ? (
          <div>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>Schedule a consultation with Dr. Arjun Sharma for Rajesh Kumar.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {['📹 Video Call', '🏥 In-Person', '💬 Quick Check-in', '📞 Phone'].map((t, i) => (
                <div key={i} style={{ padding: 12, background: 'var(--bg3)', borderRadius: 10, textAlign: 'center', fontSize: 13, color: 'var(--text2)', cursor: 'pointer', border: '1px solid var(--border)' }}>{t}</div>
              ))}
            </div>
            <Btn variant="primary" onClick={() => setBooked(true)} style={{ width: '100%', justifyContent: 'center' }}>Request Appointment</Btn>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Appointment Requested!</div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>Dr. Sharma will confirm within 2 hours.</div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  )
}

// ── Settings ──────────────────────────────────────
export function CaretakerSettings() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ maxWidth: 580 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Settings</h1>
      </div>
      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>👨‍👩‍👧 Caretaker Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--purple),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.email}</div>
            <Badge color="purple" style={{ marginTop: 4 }}>Caretaker</Badge>
          </div>
        </div>
      </GlassCard>
      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{dark ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Toggle interface theme</div>
          </div>
          <button onClick={toggle} style={{ width: 48, height: 26, borderRadius: 13, background: dark ? 'var(--purple)' : 'var(--bg4)', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 4, left: dark ? 26 : 4, transition: 'left .2s' }} />
          </button>
        </div>
      </GlassCard>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} style={{ flex: 1, justifyContent: 'center' }}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </Btn>
        <Btn variant="danger" onClick={logout} style={{ flex: 1, justifyContent: 'center' }}>🚪 Sign Out</Btn>
      </div>
    </div>
  )
}

export default CaretakerAlerts
