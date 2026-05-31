import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useReminders } from '../context/ReminderContext'
import { CATEGORIES, formatNextFire } from '../utils/reminderService'

/**
 * Compact reminder widget for the patient dashboard.
 * Shows the next few upcoming reminders + a quick link to the full page.
 */
export default function ReminderWidget() {
  const navigate = useNavigate()
  const { reminders, enabledCount, permission } = useReminders()

  // Pick enabled reminders, sort by time string (HH:MM), take first 3
  const upcoming = reminders
    .filter(r => r.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--glass)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: 18,
        cursor: 'pointer',
        transition: 'border-color .2s',
      }}
      whileHover={{ borderColor: 'var(--border2)', y: -2 }}
      onClick={() => navigate('/patient/reminders')}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Reminders</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>
              {enabledCount} active
              {permission !== 'granted' && <span style={{ color: 'var(--amber)', marginLeft: 6 }}>· notifications off</span>}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>Manage →</span>
      </div>

      {/* Upcoming list */}
      {upcoming.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
          No active reminders — tap to set up
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcoming.map(r => {
            const cat = CATEGORIES[r.type]
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 11px', borderRadius: 10,
                background: cat.bg, border: `1px solid ${cat.border}`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{formatNextFire(r)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, flexShrink: 0 }}>{r.time}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Permission nudge */}
      {permission === 'default' && (
        <div style={{
          marginTop: 12, fontSize: 11, color: 'var(--amber)',
          background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)',
          borderRadius: 8, padding: '6px 10px', textAlign: 'center',
        }}>
          ⚠ Tap to enable browser notifications
        </div>
      )}
    </motion.div>
  )
}
