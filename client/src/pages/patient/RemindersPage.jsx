import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useReminders } from '../../context/ReminderContext'
import {
  CATEGORIES, DAY_LABELS, DAY_FULL,
  formatNextFire, DEFAULT_REMINDERS,
} from '../../utils/reminderService'

// ── Reusable toggle ────────────────────────────────────────────────────────────
function Toggle({ on, onChange, color }) {
  return (
    <button
      onClick={onChange}
      aria-label={on ? 'Disable' : 'Enable'}
      style={{
        width: 46, height: 26, borderRadius: 13, flexShrink: 0,
        background: on ? (color || 'var(--teal)') : 'var(--bg4)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background .2s',
      }}
    >
      <motion.div
        animate={{ left: on ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 4 }}
      />
    </button>
  )
}

// ── Day-picker pill row ────────────────────────────────────────────────────────
function DayPicker({ days, onChange, color }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {DAY_LABELS.map((d, i) => {
        const active = days.includes(i)
        return (
          <button key={i} onClick={() => {
            const next = active ? days.filter(x => x !== i) : [...days, i].sort((a, b) => a - b)
            onChange(next)
          }}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: 'none',
              background: active ? (color || 'var(--teal)') : 'var(--bg4)',
              color: active ? '#050b18' : 'var(--text3)',
              fontWeight: active ? 700 : 400,
              fontSize: 11, cursor: 'pointer', transition: 'all .15s',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >{d}</button>
        )
      })}
    </div>
  )
}

// ── Single reminder card ──────────────────────────────────────────────────────
function ReminderCard({ reminder, onToggle, onUpdate, onDelete, onTest }) {
  const [expanded, setExpanded] = useState(false)
  const [editTime, setEditTime] = useState(reminder.time)
  const [editNote, setEditNote] = useState(reminder.note || '')
  const [editLabel, setEditLabel] = useState(reminder.label)
  const [editDays, setEditDays] = useState(reminder.days)

  const cat = CATEGORIES[reminder.type]
  const nextFire = formatNextFire({ ...reminder, time: editTime, days: editDays })

  const saveEdits = () => {
    onUpdate(reminder.id, { time: editTime, note: editNote, label: editLabel, days: editDays })
    setExpanded(false)
  }

  const discardEdits = () => {
    setEditTime(reminder.time)
    setEditNote(reminder.note || '')
    setEditLabel(reminder.label)
    setEditDays(reminder.days)
    setExpanded(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: reminder.enabled ? cat.bg : 'var(--glass)',
        border: `1.5px solid ${reminder.enabled ? cat.border : 'var(--border)'}`,
        borderRadius: 16, overflow: 'hidden',
        transition: 'background .25s, border-color .25s',
        opacity: reminder.enabled ? 1 : 0.65,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
        {/* Icon */}
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: reminder.enabled ? cat.color + '22' : 'var(--bg3)',
          border: `1.5px solid ${reminder.enabled ? cat.border : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, transition: 'all .2s',
        }}>
          {reminder.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {reminder.label}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: reminder.enabled ? cat.color : 'var(--text3)', fontWeight: 600 }}>
              🕐 {reminder.time}
            </span>
            {reminder.enabled && (
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                Next: {nextFire}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label="Edit"
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: expanded ? 'var(--bg3)' : 'transparent',
              color: 'var(--text2)', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >✏️</button>
          <Toggle on={reminder.enabled} onChange={() => onToggle(reminder.id)} color={cat.color} />
        </div>
      </div>

      {/* Days strip */}
      {reminder.days.length < 7 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {reminder.days.map(d => (
            <span key={d} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: cat.color + '22', color: cat.color, fontWeight: 600 }}>
              {DAY_LABELS[d]}
            </span>
          ))}
        </div>
      )}

      {/* Expanded edit panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Label */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Label</label>
                <input
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14,
                    fontFamily: "'DM Sans',sans-serif", outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = cat.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Time */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  style={{
                    padding: '9px 12px', borderRadius: 10,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14,
                    fontFamily: "'DM Sans',sans-serif", outline: 'none',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => e.target.style.borderColor = cat.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Days */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Repeat on</label>
                <DayPicker days={editDays} onChange={setEditDays} color={cat.color} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                  {editDays.length === 0 ? 'No days selected' :
                   editDays.length === 7 ? 'Every day' :
                   editDays.map(d => DAY_FULL[d]).join(', ')}
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Note <span style={{ opacity: .5 }}>(optional)</span></label>
                <input
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="e.g. Take with water"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 13,
                    fontFamily: "'DM Sans',sans-serif", outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = cat.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variant="primary" size="sm" onClick={saveEdits} style={{ flex: 1, justifyContent: 'center', background: `linear-gradient(135deg,${cat.color},${cat.color}cc)` }}>
                  ✓ Save
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => onTest(reminder)} style={{ justifyContent: 'center' }}>
                  🔔 Preview
                </Btn>
                <Btn variant="ghost" size="sm" onClick={discardEdits}>
                  ✕ Cancel
                </Btn>
                {!reminder.id.startsWith('med_') && !reminder.id.startsWith('ex_') && !reminder.id.startsWith('hydration_') && (
                  <Btn variant="danger" size="sm" onClick={() => onDelete(reminder.id)}>
                    🗑
                  </Btn>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Add-reminder modal ─────────────────────────────────────────────────────────
function AddReminderModal({ type, onAdd, onClose }) {
  const cat = CATEGORIES[type]
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('09:00')
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6])
  const [note, setNote] = useState('')

  const submit = () => {
    if (!label.trim()) return
    onAdd({ type, label: label.trim(), icon: cat.icon, time, days, note: note.trim(), enabled: true })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: .92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: .92, y: 20 }}
        style={{
          background: 'var(--bg2)', border: `1.5px solid ${cat.border}`,
          borderRadius: 24, padding: 28, width: '100%', maxWidth: 420,
          boxShadow: '0 24px 64px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, border: `1.5px solid ${cat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {cat.icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>Add {cat.label} Reminder</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Custom reminder for your schedule</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Label */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Label *</label>
            <input
              autoFocus
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={`e.g. ${type === 'medicine' ? 'Afternoon Tablet' : type === 'exercise' ? 'Stretching Session' : 'Water Break'}`}
              style={{
                width: '100%', padding: '10px 13px', borderRadius: 10,
                background: 'var(--bg3)', border: `1px solid ${label ? cat.border : 'var(--border)'}`,
                color: 'var(--text)', fontSize: 14,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
              }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          {/* Time */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                padding: '10px 13px', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 14,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Days */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Repeat on</label>
            <DayPicker days={days} onChange={setDays} color={cat.color} />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Note <span style={{ opacity: .5 }}>(optional)</span></label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Additional instructions..."
              style={{
                width: '100%', padding: '10px 13px', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 13,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn
              variant="primary"
              onClick={submit}
              disabled={!label.trim() || !days.length}
              style={{ flex: 1, justifyContent: 'center', background: `linear-gradient(135deg,${cat.color},${cat.color}cc)` }}
            >
              ➕ Add Reminder
            </Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Snackbar ──────────────────────────────────────────────────────────────────
function Snackbar({ snackbar }) {
  return (
    <AnimatePresence>
      {snackbar && (
        <motion.div
          key={snackbar.msg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10000, padding: '12px 22px', borderRadius: 14,
            background: snackbar.type === 'error' ? 'rgba(255,107,122,.15)' : 'rgba(0,212,170,.12)',
            border: `1px solid ${snackbar.type === 'error' ? 'rgba(255,107,122,.35)' : 'rgba(0,212,170,.35)'}`,
            color: snackbar.type === 'error' ? 'var(--red)' : 'var(--teal)',
            fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          }}
        >
          {snackbar.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Notification permission banner ────────────────────────────────────────────
function PermissionBanner({ permission, onRequest }) {
  if (permission === 'granted' || permission === 'unsupported') return null
  const isDenied = permission === 'denied'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isDenied ? 'rgba(255,107,122,.08)' : 'rgba(251,191,36,.08)',
        border: `1px solid ${isDenied ? 'rgba(255,107,122,.25)' : 'rgba(251,191,36,.25)'}`,
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}
    >
      <div style={{ fontSize: 24 }}>{isDenied ? '🚫' : '🔔'}</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: isDenied ? 'var(--red)' : 'var(--amber)' }}>
          {isDenied ? 'Notifications Blocked' : 'Enable Notifications'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          {isDenied
            ? 'To receive reminders, allow notifications in your browser settings (🔒 icon in address bar).'
            : 'Allow browser notifications to receive medicine, exercise, and hydration reminders.'}
        </div>
      </div>
      {!isDenied && (
        <Btn variant="primary" size="sm" onClick={onRequest}
          style={{ background: 'linear-gradient(135deg,#fbbf24,#fb923c)', color: '#050b18', flexShrink: 0 }}>
          Allow Notifications
        </Btn>
      )}
    </motion.div>
  )
}

// ── Category section ───────────────────────────────────────────────────────────
function CategorySection({ type, reminders, onToggle, onUpdate, onDelete, onTest, onAdd }) {
  const cat = CATEGORIES[type]
  const enabled = reminders.filter(r => r.enabled).length

  return (
    <GlassCard style={{ marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: cat.bg, border: `1.5px solid ${cat.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            {cat.icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>{cat.label} Reminders</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {enabled} of {reminders.length} active
            </div>
          </div>
        </div>
        <button
          onClick={() => onAdd(type)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10,
            background: cat.bg, border: `1px solid ${cat.border}`,
            color: cat.color, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif", transition: 'all .15s',
          }}
        >
          ➕ Add
        </button>
      </div>

      {/* Reminder cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence mode="popLayout">
          {reminders.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13, fontStyle: 'italic' }}>
              No {cat.label.toLowerCase()} reminders yet. Tap ➕ Add to create one.
            </div>
          ) : (
            reminders.map(r => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onTest={onTest}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function RemindersPage() {
  const {
    reminders, permission, byType,
    requestPermission, toggle, update, add, remove, testFire,
    enabledCount, totalCount, snackbar,
  } = useReminders()

  const [addModal, setAddModal] = useState(null) // type string or null

  const handleAdd = useCallback((type) => setAddModal(type), [])

  const confirmAdd = useCallback((reminder) => {
    add(reminder)
    setAddModal(null)
  }, [add])

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Badge color="teal">Reminder System</Badge>
          {enabledCount > 0 && <Badge color="blue">{enabledCount} active</Badge>}
        </div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          🔔 Reminders & Alerts
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Medicine, exercise, and hydration reminders — delivered as browser notifications even when the app is in the background.
        </p>
      </div>

      {/* Permission banner */}
      <PermissionBanner permission={permission} onRequest={requestPermission} />

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(CATEGORIES).map(([type, cat]) => {
          const list = byType[type] || []
          const on   = list.filter(r => r.enabled).length
          return (
            <motion.div key={type} whileHover={{ y: -2 }}
              style={{
                padding: '14px 16px', borderRadius: 14,
                background: on > 0 ? cat.bg : 'var(--glass)',
                border: `1.5px solid ${on > 0 ? cat.border : 'var(--border)'}`,
                textAlign: 'center', transition: 'all .2s', cursor: 'default',
              }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: on > 0 ? cat.color : 'var(--text3)' }}>{on}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{cat.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>of {list.length} active</div>
            </motion.div>
          )
        })}
      </div>

      {/* Category sections */}
      {Object.keys(CATEGORIES).map(type => (
        <CategorySection
          key={type}
          type={type}
          reminders={byType[type] || []}
          onToggle={toggle}
          onUpdate={update}
          onDelete={remove}
          onTest={testFire}
          onAdd={handleAdd}
        />
      ))}

      {/* How it works */}
      <GlassCard style={{ background: 'linear-gradient(135deg,rgba(74,158,255,.05),rgba(0,212,170,.03))' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 14 }}>ℹ️ How Reminders Work</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🔔', text: 'Browser notifications appear even when PhysioForge is minimised (tab must remain open).' },
            { icon: '📱', text: 'Install as a PWA ("Add to Home Screen") for persistent background reminders.' },
            { icon: '💾', text: 'All reminder settings are saved locally — they persist across sessions.' },
            { icon: '✏️', text: 'Tap the pencil icon on any reminder to edit time, days, or note.' },
            { icon: '🔕', text: 'Toggle any reminder off without deleting it to pause temporarily.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Add modal */}
      <AnimatePresence>
        {addModal && (
          <AddReminderModal
            type={addModal}
            onAdd={confirmAdd}
            onClose={() => setAddModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast snackbar */}
      <Snackbar snackbar={snackbar} />
    </div>
  )
}
