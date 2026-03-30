// ============================================================
//  VELMO MARKETPLACE — Service Worker
//  Cache stratégie: Network-first pour les données, Cache-first pour assets
// ============================================================

const CACHE_NAME = 'velmo-market-v1';
const OFFLINE_URL = '/marketplace-offline.html';

// Assets à pré-cacher au install
const PRECACHE_ASSETS = [
  '/marketplace',
  '/marketplace-offline.html',
  '/logo-velmo.svg',
];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Si un asset échoue, on continue quand même
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les API externes
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash.com')) return;

  // Images Unsplash → Cache-first (économie données mobiles)
  if (url.hostname.includes('unsplash.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Assets statiques (JS/CSS) → Cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation → Network-first avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Reste → Network-first
  event.respondWith(networkFirst(request));
});

// ── STRATÉGIES ───────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 408 });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage || new Response('<h1>Hors ligne</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
