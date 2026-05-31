/* ============================================================
   PhysioForge Service Worker  v1.0
   Strategy:
     • Static assets  → Cache-First  (instant load)
     • API requests   → Network-First with cache fallback
     • Navigate req   → Network-First, fallback to cached shell or /offline.html
   ============================================================ */

const CACHE_VERSION = 'pf-v1'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const API_CACHE     = `${CACHE_VERSION}-api`
const IMAGE_CACHE   = `${CACHE_VERSION}-images`

// Assets that MUST be cached on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// API routes worth caching for offline use
const CACHEABLE_API = [
  '/api/exercises',
  '/api/progress',
  '/api/auth/me',
]

// ── Install: cache app shell ─────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(() => {
            // Non-fatal: asset may not exist at install time during dev
            console.warn('[SW] Precache miss:', url)
          })
        )
      )
    }).then(() => self.skipWaiting())
  )
})

// ── Activate: delete old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !key.startsWith(CACHE_VERSION))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: request interception ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, chrome-extension, and cross-origin non-asset requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin && !isFont(url)) return

  // Google Fonts — cache-first
  if (isFont(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // API calls — network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request))
    return
  }

  // Static assets (JS/CSS/images/icons) — cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Navigation (HTML) — network-first, offline shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
})

// ── Strategies ───────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || new Response('Offline', { status: 503 })
  }
}

async function networkFirstAPI(request) {
  const url = new URL(request.url)
  const isCacheable = CACHEABLE_API.some(path => url.pathname.startsWith(path))

  try {
    const response = await fetch(request)
    if (response.ok && isCacheable) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    if (isCacheable) {
      const cached = await caches.match(request, { cacheName: API_CACHE })
      if (cached) {
        // Add offline header so the app knows this is stale
        const body = await cached.json().catch(() => ({}))
        return new Response(JSON.stringify({ ...body, _offline: true, _cachedAt: Date.now() }), {
          headers: { 'Content-Type': 'application/json', 'X-Served-By': 'ServiceWorker-Cache' },
        })
      }
    }
    return new Response(JSON.stringify({ error: 'offline', _offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request)
    // Cache successful navigation for future offline use
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Try cached version of this URL
    const cached = await caches.match(request)
    if (cached) return cached
    // Try the app root (SPA shell)
    const shell = await caches.match('/')
    if (shell) return shell
    // Last resort: offline page
    return caches.match('/offline.html') ||
      new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)
  return cached || fetchPromise
}

// ── Helpers ──────────────────────────────────────────────────

function isStaticAsset(url) {
  return /\.(js|jsx|ts|tsx|css|woff2?|ttf|otf|png|jpg|jpeg|gif|webp|svg|ico|json)$/i
    .test(url.pathname)
}

function isFont(url) {
  return url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com')
}

// ── Background sync: queue failed API writes ─────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CACHE_URLS') {
    const { urls } = event.data
    caches.open(STATIC_CACHE).then(cache => cache.addAll(urls))
  }
  if (event.data?.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => event.source.postMessage({ type: 'CACHE_SIZE', size }))
  }
})

async function getCacheSize() {
  let total = 0
  const cacheNames = await caches.keys()
  for (const name of cacheNames) {
    const cache = await caches.open(name)
    const keys = await cache.keys()
    total += keys.length
  }
  return total
}
