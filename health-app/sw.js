// Service Worker: App-Shell cache-first (offline-fähig),
// Wetter-API network-first mit stillem Fallback.

const CACHE = 'pulse-v1';

const SHELL = [
  './',
  './index.html',
  './css/app.css',
  './manifest.webmanifest',
  './js/app.js', './js/store.js', './js/ui.js', './js/goals.js', './js/ics.js', './js/weather.js',
  './js/pages/dashboard.js', './js/pages/kalorien.js', './js/pages/gewicht.js', './js/pages/schritte.js',
  './js/pages/wasser.js', './js/pages/supplemente.js', './js/pages/training.js', './js/pages/schlaf.js',
  './js/pages/stimmung.js', './js/pages/fasten.js', './js/pages/wetter.js', './js/pages/kalender.js',
  './js/pages/notizen.js', './js/pages/aufgaben.js', './js/pages/erinnerungen.js', './js/pages/einkauf.js',
  './js/pages/ziele.js', './js/pages/report.js', './js/pages/einstellungen.js', './js/pages/mehr.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Wetter/Geocoding: network-first (frische Daten), kein Cache-Fallback nötig –
  // die App cached die letzte Antwort selbst in localStorage.
  if (url.hostname.endsWith('open-meteo.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // App-Shell: cache-first, danach Netz (und Antwort nachcachen)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))),
    );
  }
});
