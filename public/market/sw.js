const CACHE_NAME = 'velmo-market-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    './shop.html',
    './styles.css',
    './shop.css',
    './app.js',
    './shop.js',
    './analytics.js',
    './manifest.json',
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // API Supabase : réseau uniquement, jamais de cache
    if (url.hostname.includes('supabase.co')) {
        e.respondWith(
            fetch(e.request).catch(() => new Response('[]', { headers: { 'Content-Type': 'application/json' } }))
        );
        return;
    }

    // Images externes (unsplash, etc.) : cache-first
    if (url.hostname !== self.location.hostname && e.request.destination === 'image') {
        e.respondWith(
            caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
                return res;
            }).catch(() => new Response('', { status: 404 })))
        );
        return;
    }

    // Assets locaux : cache-first avec fallback réseau
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res && res.status === 200 && e.request.method === 'GET') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
                }
                return res;
            }).catch(() => {
                // Navigation offline → page offline
                if (e.request.mode === 'navigate') {
                    return caches.match('/marketplace-offline.html');
                }
                return new Response('', { status: 408 });
            });
        })
    );
});
