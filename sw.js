// Libreta: guarda la app en el dispositivo para que abra sin conexión.
const VERSION = 'libreta-20261001154138';
const SHELL = ['./', './index.html', './manifest.webmanifest', './firebase-config.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];
const CDN = ["https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js", "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    await Promise.all(CDN.map(u => fetch(u, { mode: 'no-cors' }).then(r => c.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
const keep = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const fresh = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('firebase-config.js');
    if (fresh) {
      const key = req.mode === 'navigate' ? './index.html' : req;
      // Siempre pregunta al servidor si hay una versión nueva (sin usar la copia guardada del navegador).
      let net = req;
      try { net = req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' }) : new Request(req, { cache: 'no-cache' }); } catch (_) {}
      e.respondWith(fetch(net).then(r => keep(key, r)).catch(() => caches.match(key, { ignoreSearch: true })));
    } else {
      e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(req, r))));
    }
    return;
  }
  const cdn = (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (cdn) e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(req, r))));
});
