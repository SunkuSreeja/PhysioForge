import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '../context/PWAContext'

/* ── Offline banner (top of viewport, sticky) ───────────────────────────────── */
function OfflineBanner({ isOnline, offlineSince }) {
  const [show, setShow] = useState(!isOnline)
  const [justCameBack, setJustCameBack] = useState(false)

  useEffect(() => {
    if (isOnline && !show) return
    if (isOnline && show) {
      // Just came back online — show "back online" briefly
      setJustCameBack(true)
      setShow(true)
      const t = setTimeout(() => { setShow(false); setJustCameBack(false) }, 3000)
      return () => clearTimeout(t)
    }
    if (!isOnline) setShow(true)
  }, [isOnline])

  const mins = offlineSince ? Math.floor((Date.now() - offlineSince) / 60000) : 0

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: 'hidden', position: 'relative', zIndex: 100 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '8px 20px',
            background: justCameBack
              ? 'linear-gradient(90deg,rgba(0,212,170,.18),rgba(0,212,170,.12))'
              : 'linear-gradient(90deg,rgba(251,146,60,.18),rgba(251,146,60,.12))',
            borderBottom: `1px solid ${justCameBack ? 'rgba(0,212,170,.3)' : 'rgba(251,146,60,.3)'}`,
          }}>
            {/* Pulsing dot */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: justCameBack ? '#00d4aa' : '#fb923c',
              boxShadow: `0 0 8px ${justCameBack ? '#00d4aa' : '#fb923c'}`,
              animation: justCameBack ? 'none' : 'pf-pulse 1.4s ease-in-out infinite',
            }} />

            <span style={{
              fontSize: 12, fontWeight: 600,
              color: justCameBack ? '#00d4aa' : '#fb923c',
            }}>
              {justCameBack
                ? '✓ Back online — syncing your data…'
                : `Offline${mins > 0 ? ` · ${mins}m` : ''} — showing cached content`
              }
            </span>

            {!justCameBack && (
              <span style={{
                fontSize: 11, color: 'rgba(251,146,60,0.7)', marginLeft: 4,
              }}>
                Exercises & remedies still available
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── SW update toast (bottom-right) ────────────────────────────────────────── */
function UpdateToast({ swWaiting, onUpdate }) {
  return (
    <AnimatePresence>
      {swWaiting && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: 'var(--bg2,#0d1829)',
            border: '1px solid rgba(74,158,255,.35)',
            borderRadius: 16, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,.5)',
            maxWidth: 300,
          }}
        >
          <span style={{ fontSize: 22 }}>🔄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              Update available
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2,#94a3b8)' }}>
              A new version of PhysioForge is ready.
            </div>
          </div>
          <button
            onClick={onUpdate}
            style={{
              background: 'linear-gradient(135deg,#00d4aa,#4a9eff)',
              border: 'none', borderRadius: 10, padding: '7px 14px',
              fontWeight: 700, fontSize: 12, color: '#050b18', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Update
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Install banner (bottom, dismissable) ───────────────────────────────────── */
function InstallBanner({ canInstall, onInstall }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pf_install_dismissed') === '1'
  )

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pf_install_dismissed', '1')
  }

  return (
    <AnimatePresence>
      {canInstall && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ delay: 4, duration: 0.4 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9998, width: 'calc(100% - 48px)', maxWidth: 460,
            background: 'var(--bg2,#0d1829)',
            border: '1px solid rgba(0,212,170,.25)',
            borderRadius: 20, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 16px 48px rgba(0,0,0,.55)',
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(0,212,170,.2),rgba(74,158,255,.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>⚕️</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              Install PhysioForge
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2,#94a3b8)', lineHeight: 1.5 }}>
              Add to home screen for offline access & faster loading
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={onInstall}
              style={{
                background: 'linear-gradient(135deg,#00d4aa,#4a9eff)',
                border: 'none', borderRadius: 10, padding: '8px 16px',
                fontWeight: 700, fontSize: 13, color: '#050b18', cursor: 'pointer',
              }}
            >
              Install
            </button>
            <button
              onClick={dismiss}
              style={{
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, padding: '8px 10px', fontSize: 13,
                color: 'var(--text2,#94a3b8)', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Topbar status dot (used inside DashboardLayout header) ─────────────────── */
export function OnlineStatusDot({ elderMode }) {
  const { isOnline, swReady } = usePWA()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <motion.span
        animate={isOnline
          ? { opacity: [1, 0.3, 1] }
          : { opacity: [1, 0.6, 1] }
        }
        transition={{ duration: isOnline ? 2 : 1, repeat: Infinity }}
        style={{
          fontSize: 8,
          color: isOnline ? 'var(--teal,#00d4aa)' : '#fb923c',
        }}
      >●</motion.span>
      <span style={{ fontSize: elderMode ? 14 : 13, color: 'var(--text2,#94a3b8)' }}>
        {isOnline
          ? (swReady ? 'PhysioForge · Offline-ready' : 'PhysioForge is online')
          : 'Offline — cached data'
        }
      </span>
    </div>
  )
}

/* ── Master PWA UI shell ────────────────────────────────────────────────────── */
export default function PWAShell({ children }) {
  const { isOnline, offlineSince, swWaiting, canInstall, promptInstall, skipWaiting } = usePWA()

  return (
    <>
      <OfflineBanner isOnline={isOnline} offlineSince={offlineSince} />
      {children}
      <UpdateToast swWaiting={swWaiting} onUpdate={skipWaiting} />
      <InstallBanner canInstall={canInstall} onInstall={promptInstall} />

      {/* Global keyframe for offline dot pulse */}
      <style>{`
        @keyframes pf-pulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </>
  )
}
