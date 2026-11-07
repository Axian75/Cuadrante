/* Cuadrante de vigilantes: funciona sin conexión. Siempre intenta traer la versión más nueva y, si no hay red, usa la guardada. */
const CACHE = 'cuadrante-v4.4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Microsoft (inicio de sesión, OneDrive) va siempre directo
  const key = u.searchParams.has('code') ? './index.html' : e.request;
  e.respondWith(fetch(e.request).then(r => { if (r.ok && !u.search) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); } return r; })
    .catch(() => caches.match(key, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
