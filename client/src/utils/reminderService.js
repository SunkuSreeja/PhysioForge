/**
 * reminderService.js
 * Lightweight browser-notification reminder engine for PhysioForge.
 * All state in localStorage — works offline, no backend required.
 *
 * Three reminder categories: medicine · exercise · hydration
 * Each reminder is a plain object the caller can CRUD freely.
 */

// ── Storage key ───────────────────────────────────────────────────────────────
const LS_KEY = 'pf_reminders'

// ── Default reminder templates ─────────────────────────────────────────────────
export const DEFAULT_REMINDERS = [
  // Medicine
  {
    id: 'med_morning',
    type: 'medicine',
    label: 'Morning Medication',
    icon: '💊',
    time: '08:00',
    days: [0, 1, 2, 3, 4, 5, 6], // everyday
    enabled: true,
    note: 'Take with a full glass of water',
  },
  {
    id: 'med_evening',
    type: 'medicine',
    label: 'Evening Medication',
    icon: '💊',
    time: '20:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: false,
    note: 'After dinner',
  },
  // Exercise
  {
    id: 'ex_morning',
    type: 'exercise',
    label: 'Morning Exercise Session',
    icon: '🏋️',
    time: '07:30',
    days: [1, 2, 3, 4, 5], // weekdays
    enabled: true,
    note: 'Complete 4 prescribed exercises',
  },
  {
    id: 'ex_physio',
    type: 'exercise',
    label: 'Physio Check-in',
    icon: '🎯',
    time: '17:00',
    days: [1, 3, 5], // Mon/Wed/Fri
    enabled: true,
    note: 'Posture analysis session',
  },
  // Hydration
  {
    id: 'hydration_morning',
    type: 'hydration',
    label: 'Morning Hydration',
    icon: '💧',
    time: '09:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    note: 'Drink 2 glasses of water',
  },
  {
    id: 'hydration_midday',
    type: 'hydration',
    label: 'Midday Water Break',
    icon: '💧',
    time: '13:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    note: 'Stay hydrated for recovery',
  },
  {
    id: 'hydration_afternoon',
    type: 'hydration',
    label: 'Afternoon Hydration',
    icon: '💧',
    time: '16:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: false,
    note: 'Pre-exercise hydration',
  },
]

// ── CRUD helpers ───────────────────────────────────────────────────────────────
export function loadReminders() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
    // First run — seed defaults
    saveReminders(DEFAULT_REMINDERS)
    return DEFAULT_REMINDERS
  } catch {
    return DEFAULT_REMINDERS
  }
}

export function saveReminders(reminders) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(reminders))
  } catch { /* storage full */ }
}

export function addReminder(reminder) {
  const all = loadReminders()
  const newR = { ...reminder, id: `custom_${Date.now()}` }
  const updated = [...all, newR]
  saveReminders(updated)
  return updated
}

export function updateReminder(id, patch) {
  const all = loadReminders()
  const updated = all.map(r => r.id === id ? { ...r, ...patch } : r)
  saveReminders(updated)
  return updated
}

export function deleteReminder(id) {
  const updated = loadReminders().filter(r => r.id !== id)
  saveReminders(updated)
  return updated
}

export function toggleReminder(id) {
  const all = loadReminders()
  const updated = all.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
  saveReminders(updated)
  return updated
}

// ── Notification permission ────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// ── Fire a single browser notification ────────────────────────────────────────
export function fireNotification(reminder) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const titles = {
    medicine:   '💊 Time for your medication',
    exercise:   '🏋️ Exercise time!',
    hydration:  '💧 Stay hydrated',
  }

  const n = new Notification(titles[reminder.type] || '⚕ PhysioForge Reminder', {
    body: `${reminder.label}${reminder.note ? '\n' + reminder.note : ''}`,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: reminder.id,            // collapses duplicate notifications
    renotify: false,
    silent: false,
  })

  // Auto-close after 8 seconds
  setTimeout(() => n.close(), 8000)

  // Clicking the notification focuses the app
  n.onclick = () => { window.focus(); n.close() }

  return n
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
// Returns a cleanup function. Call it to stop the scheduler.
let _schedulerInterval = null

export function startScheduler() {
  if (_schedulerInterval) clearInterval(_schedulerInterval)

  const check = () => {
    const reminders = loadReminders()
    const now = new Date()
    const todayDay = now.getDay()      // 0=Sun…6=Sat
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    reminders.forEach(r => {
      if (!r.enabled) return
      if (!r.days.includes(todayDay)) return
      if (r.time !== hhmm) return
      // Check we haven't already fired this reminder in the last 2 minutes
      const firedKey = `pf_fired_${r.id}_${now.toDateString()}_${hhmm}`
      if (sessionStorage.getItem(firedKey)) return
      sessionStorage.setItem(firedKey, '1')
      fireNotification(r)
    })
  }

  // Check every 30 seconds (catches the minute boundary)
  _schedulerInterval = setInterval(check, 30_000)
  check() // also run immediately on mount

  return () => clearInterval(_schedulerInterval)
}

export function stopScheduler() {
  if (_schedulerInterval) clearInterval(_schedulerInterval)
  _schedulerInterval = null
}

// ── Next-fire helper (for UI display) ─────────────────────────────────────────
export function getNextFire(reminder) {
  if (!reminder.enabled || !reminder.days.length) return null

  const now = new Date()
  const [h, m] = reminder.time.split(':').map(Number)

  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(now)
    candidate.setDate(now.getDate() + offset)
    candidate.setHours(h, m, 0, 0)
    if (candidate <= now) continue
    if (!reminder.days.includes(candidate.getDay())) continue
    return candidate
  }
  return null
}

export function formatNextFire(reminder) {
  const d = getNextFire(reminder)
  if (!d) return 'Not scheduled'
  const now = new Date()
  const diffMs = d - now
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 60) return `in ${diffMins}m`
  if (diffMins < 24 * 60) return `today at ${reminder.time}`

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return `${days[d.getDay()]} at ${reminder.time}`
}

// ── Day labels ─────────────────────────────────────────────────────────────────
export const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']
export const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ── Category config ────────────────────────────────────────────────────────────
export const CATEGORIES = {
  medicine:  { label: 'Medicine',   icon: '💊', color: '#ff6b7a', bg: 'rgba(255,107,122,.12)', border: 'rgba(255,107,122,.25)' },
  exercise:  { label: 'Exercise',   icon: '🏋️', color: '#4a9eff', bg: 'rgba(74,158,255,.12)',  border: 'rgba(74,158,255,.25)'  },
  hydration: { label: 'Hydration',  icon: '💧', color: '#00d4aa', bg: 'rgba(0,212,170,.12)',   border: 'rgba(0,212,170,.25)'   },
}
