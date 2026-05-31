import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const PWAContext = createContext(null)

// ── Local storage cache helpers ───────────────────────────────────────────────
const LS_PREFIX = 'pf_cache_'

export function lsSet(key, data) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* storage full — ignore */ }
}

export function lsGet(key, maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > maxAgeMs) return null
    return data
  } catch { return null }
}

export function lsClear(key) {
  try { localStorage.removeItem(LS_PREFIX + key) } catch {}
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function PWAProvider({ children }) {
  const [isOnline, setIsOnline]           = useState(navigator.onLine)
  const [swReady, setSwReady]             = useState(false)
  const [swWaiting, setSwWaiting]         = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled]     = useState(false)
  const [cacheSize, setCacheSize]         = useState(0)
  const [offlineSince, setOfflineSince]   = useState(null)
  const swReg = useRef(null)

  // ── Online / offline detection ────────────────────────────
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true);  setOfflineSince(null) }
    const onOffline = () => { setIsOnline(false); setOfflineSince(Date.now()) }
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // ── Service worker registration ───────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        swReg.current = reg

        if (reg.active) setSwReady(true)

        // New SW waiting to take over
        if (reg.waiting) setSwWaiting(true)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwWaiting(true)
            }
            if (newWorker.state === 'activated') {
              setSwReady(true)
              setSwWaiting(false)
            }
          })
        })

        // Ask SW for cache size
        const queryCacheSize = () => {
          if (reg.active) {
            const mc = new MessageChannel()
            mc.port1.onmessage = e => { if (e.data?.type === 'CACHE_SIZE') setCacheSize(e.data.size) }
            reg.active.postMessage({ type: 'GET_CACHE_SIZE' }, [mc.port2])
          }
        }
        queryCacheSize()
        setTimeout(queryCacheSize, 4000)

      } catch (err) {
        console.warn('[PWA] SW registration failed:', err)
      }
    }

    register()
    navigator.serviceWorker.addEventListener('controllerchange', () => setSwReady(true))
  }, [])

  // ── PWA install prompt ────────────────────────────────────
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    const mq = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mq.matches)
    const mqListener = e => setIsInstalled(e.matches)
    mq.addEventListener('change', mqListener)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ── Actions ───────────────────────────────────────────────
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
    return outcome === 'accepted'
  }, [installPrompt])

  const skipWaiting = useCallback(() => {
    if (swReg.current?.waiting) {
      swReg.current.waiting.postMessage({ type: 'SKIP_WAITING' })
      setSwWaiting(false)
    }
  }, [])

  // Pre-cache specific URLs via SW message
  const precacheUrls = useCallback((urls) => {
    if (swReg.current?.active) {
      swReg.current.active.postMessage({ type: 'CACHE_URLS', urls })
    }
  }, [])

  const value = {
    isOnline,
    swReady,
    swWaiting,
    isInstalled,
    canInstall: !!installPrompt && !isInstalled,
    offlineSince,
    cacheSize,
    promptInstall,
    skipWaiting,
    precacheUrls,
    // Local-storage cache helpers re-exported for convenience
    lsSet,
    lsGet,
    lsClear,
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}

export const usePWA = () => {
  const ctx = useContext(PWAContext)
  if (!ctx) throw new Error('usePWA must be used within PWAProvider')
  return ctx
}
