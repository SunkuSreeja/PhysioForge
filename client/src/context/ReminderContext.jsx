import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  loadReminders, saveReminders, addReminder as svcAdd,
  updateReminder, deleteReminder, toggleReminder,
  requestNotificationPermission, getNotificationPermission,
  startScheduler, fireNotification,
} from '../utils/reminderService'

const ReminderContext = createContext(null)

export function ReminderProvider({ children }) {
  const [reminders, setReminders]   = useState(() => loadReminders())
  const [permission, setPermission] = useState(() => getNotificationPermission())
  const [snackbar, setSnackbar]     = useState(null) // { msg, type }

  // ── Start the scheduler once (runs every 30s) ──────────────────────────────
  useEffect(() => {
    const stop = startScheduler()
    return stop
  }, [])

  // ── Toast helper ───────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = 'success') => {
    setSnackbar({ msg, type })
    const t = setTimeout(() => setSnackbar(null), 3000)
    return () => clearTimeout(t)
  }, [])

  // ── Permission request ──────────────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') toast('🔔 Notifications enabled!')
    else if (result === 'denied') toast('Notifications blocked in browser settings', 'error')
    return result
  }, [toast])

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const toggle = useCallback((id) => {
    const updated = toggleReminder(id)
    setReminders(updated)
    const r = updated.find(x => x.id === id)
    if (r) toast(r.enabled ? `🔔 "${r.label}" enabled` : `🔕 "${r.label}" disabled`)
  }, [toast])

  const update = useCallback((id, patch) => {
    const updated = updateReminder(id, patch)
    setReminders(updated)
    toast('✓ Reminder updated')
  }, [toast])

  const add = useCallback((reminder) => {
    const updated = svcAdd(reminder)
    setReminders(updated)
    toast('➕ Reminder added')
    return updated
  }, [toast])

  const remove = useCallback((id) => {
    const r = reminders.find(x => x.id === id)
    const updated = deleteReminder(id)
    setReminders(updated)
    if (r) toast(`🗑 "${r.label}" removed`)
  }, [reminders, toast])

  // ── Test fire (for "Preview" button) ──────────────────────────────────────
  const testFire = useCallback(async (reminder) => {
    let perm = permission
    if (perm !== 'granted') perm = await requestNotificationPermission()
    setPermission(perm)
    if (perm !== 'granted') { toast('Enable notifications first', 'error'); return }
    fireNotification(reminder)
    toast(`🔔 Test notification sent for "${reminder.label}"`)
  }, [permission, toast])

  // Stats for dashboard widget
  const enabledCount  = reminders.filter(r => r.enabled).length
  const totalCount    = reminders.length
  const byType = {
    medicine:  reminders.filter(r => r.type === 'medicine'),
    exercise:  reminders.filter(r => r.type === 'exercise'),
    hydration: reminders.filter(r => r.type === 'hydration'),
  }

  return (
    <ReminderContext.Provider value={{
      reminders, permission,
      requestPermission, toggle, update, add, remove, testFire,
      enabledCount, totalCount, byType, snackbar,
    }}>
      {children}
    </ReminderContext.Provider>
  )
}

export const useReminders = () => {
  const ctx = useContext(ReminderContext)
  if (!ctx) throw new Error('useReminders must be used within ReminderProvider')
  return ctx
}
