const CACHE_NAME = 'ludotic-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheable(response, url) {
  return (
    response &&
    response.ok &&
    url.origin === self.location.origin &&
    !response.headers.get('cache-control')?.includes('no-store')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Always bypass non-GET requests.
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Same-origin navigations: network-first con fallback offline a la caché.
  // Así los usuarios reciben siempre la última versión de la app y la caché
  // solo cubre ausencia de red.
  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response, url)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(
            (cached) =>
              cached ||
              new Response('Sin conexión', {
                status: 503,
                statusText: 'Offline',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              }),
          ),
        ),
    );
    return;
  }

  // Resto de assets: stale-while-revalidate (respuesta instantánea desde
  // caché mientras se actualiza en segundo plano).
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (isCacheable(response, url)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || refresh;
    }),
  );
});
