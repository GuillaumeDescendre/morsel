// Minimal service worker — enables install and an offline app shell.
const CACHE = 'morsel-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Only handle same-origin GETs; never cache Supabase API/auth calls.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // Network-first for navigations so users get fresh HTML; fall back to cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }
  // Cache-first for other same-origin assets.
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
})
