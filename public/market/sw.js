const CACHE_NAME = 'velmo-market-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './analytics.js',
    './manifest.json',
    './images/electronique-tech.png',
    './images/elctronique-tech.png',
    './images/mode-femme-moderne.png',
    './images/mode-femme.png',
    './images/mode-africain.png',
    './images/mode-jeune.png',
    './images/mode-jeune-montres.png',
    './images/cometique.png',
    './images/cosmetique-me.png',
    './images/electromenager-femmes.png',
    './images/electromenager-f.png',
    './images/electrmenager-femme.png',
    './images/electromenager.png',
];

// Install : cache tous les assets statiques
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => { }))
    );
});

// Activate : supprimer les anciens caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch : stratégie Cache-First pour les assets locaux, Network-First pour l'API
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // API Supabase : toujours réseau (pas de cache SW)
    if (url.hostname.includes('supabase.co')) {
        e.respondWith(fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
        return;
    }

    // Assets statiques locaux : Cache-First
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone)).catch(() => { });
                }
                return res;
            }).catch(() => caches.match('./index.html'));
        })
    );
});
