const CACHE_NAME = 'vetassist-v2.2';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: route by request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) return;

  // API calls: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (images, fonts, JS, CSS): cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation / HTML: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Sin conexión. Datos no disponibles offline.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Cache-first: try cache, fall back to network
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
  } catch (err) {
    // For images, return a transparent 1x1 pixel as offline fallback
    if (request.destination === 'image') {
      return new Response(
        'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="%23ccc" width="1" height="1"/></svg>'
          ),
        {
          headers: { 'Content-Type': 'image/svg+xml' },
          status: 200,
        }
      );
    }
    return new Response('Recurso no disponible offline.', {
      status: 503,
    });
  }
}

// Stale-while-revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Network failed, that's ok — we have the cached version
    });

  if (cached) return cached;

  try {
    return await fetchPromise;
  } catch (err) {
    return new Response(
      '<!DOCTYPE html>' +
        '<html lang="es"><head><meta charset="utf-8">' +
        '<title>Sin Conexión - VetAssist</title>' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>' +
        'body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;' +
        'min-height:100vh;margin:0;background:#f0fdfa;color:#0f766e;text-align:center;padding:1rem}' +
        'h1{font-size:1.5rem;margin-bottom:0.5rem}' +
        'p{color:#0d9488;max-width:320px}' +
        '</style></head>' +
        '<body><div><h1>🐕 Sin Conexión</h1>' +
        '<p>VetAssist no está disponible sin conexión en este momento. ' +
        'Por favor verifica tu conexión a internet.</p></div></body></html>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
