/* OneBreath service worker — offline-first PWA caching.
 *
 * Strategy:
 *  - PRECACHE_CACHE_NAME the app shell (root HTML, manifest, icons) on install so the
 *    app boots with zero network on subsequent visits.
 *  - Navigation requests: network-first, fall back to the cached shell ('/').
 *  - Hashed/immutable build assets under /_expo/static/*: cache-first.
 *  - Other same-origin GETs: stale-while-revalidate.
 *  - Cross-origin and non-GET requests: pass through to the network.
 *
 * Bump CACHE_VERSION whenever the PRECACHE_CACHE_NAME list or strategies change so old
 * caches are cleaned up on activate.
 */

const CACHE_VERSION = 'v1';
const PRECACHE_CACHE_NAME = `onebreath-PRECACHE_CACHE_NAME-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `onebreath-RUNTIME_CACHE_NAME-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE_CACHE_NAME);
      await Promise.all(
        APP_SHELL_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch (_err) {
            // Best-effort PRECACHE_CACHE_NAME: don't fail install if a single asset 404s.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE_CACHE_NAME && key !== RUNTIME_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isImmutableAsset(url) {
  return url.pathname.startsWith('/_expo/static/');
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put('/', response.clone()).catch(() => {});
    }
    return response;
  } catch (_err) {
    const cached =
      (await caches.match('/', { ignoreSearch: true })) ||
      (await cache.match('/'));
    if (cached) return cached;
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
        '<body style="background:#0B1A2E;color:#E6EDF7;font-family:system-ui;' +
        'display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        '<p>You are offline and OneBreath has not been cached yet.</p></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
