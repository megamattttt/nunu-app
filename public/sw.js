/* NUNU service worker — cache statique + navigation offline.
   La bibliothèque DiceBear est empaquetée dans le bundle JS de l'application
   (import statique, pas de chargement dynamique) : elle est donc mise en cache
   par la règle « assets » ci-dessous dès la première visite, et la génération
   d'avatars fonctionne ensuite sans réseau. */
const VERSION = 'nunu-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigations : réseau d'abord, repli sur la coquille en cache (offline).
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;

  // Bundles JS/CSS (dont DiceBear) : cache d'abord, revalidation en arrière-plan.
  if (sameOrigin && /\.(js|mjs|css)$/.test(url.pathname)) {
    e.respondWith(
      caches.open(VERSION).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  // Autres assets : cache d'abord, puis réseau + mise en cache.
  if (sameOrigin || url.host.includes('fonts.g')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit))
    );
  }
});
