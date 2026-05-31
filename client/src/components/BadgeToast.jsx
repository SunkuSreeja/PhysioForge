import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalytics } from '../context/AnalyticsContext'

export default function BadgeToast() {
  const { newBadges, dismissBadge } = useAnalytics()
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (newBadges.length > 0 && !current) {
      setCurrent(newBadges[0])
      // Auto-dismiss after 5s
      const t = setTimeout(() => {
        dismissBadge(newBadges[0].id)
        setCurrent(null)
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [newBadges, current, dismissBadge])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            position: 'fixed', top: 72, right: 20, zIndex: 9999,
            background: 'var(--bg2)',
            border: '1.5px solid rgba(0,212,170,.35)',
            borderRadius: 18, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(0,212,170,.08)',
            maxWidth: 320, cursor: 'pointer',
          }}
          onClick={() => { dismissBadge(current.id); setCurrent(null) }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 36, flexShrink: 0 }}
          >
            {current.icon}
          </motion.div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              🏅 Badge Earned!
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>
              {current.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{current.desc}</div>
          </div>
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              background: 'var(--teal)', borderRadius: '0 0 18px 18px',
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
