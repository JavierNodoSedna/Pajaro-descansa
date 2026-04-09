// Pájaro, descansa — Service Worker
const CACHE = 'pajaro-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Raleway:wght@300;400;500&display=swap'
];

// Instalación: pre-cachear recursos principales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first para recursos propios, network-first para el resto
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cachear respuestas válidas de nuestros dominios
        if (response && response.status === 200 && response.type !== 'opaque') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      }).catch(() => cached); // si falla la red, devolver lo que haya en caché
    })
  );
});
