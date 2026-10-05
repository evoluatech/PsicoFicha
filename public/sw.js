const CACHE_NAME = 'psicoficha-cache-v3';
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/logo.svg',
  '/favicon.ico',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache static assets note:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore cross-origin requests
  if (url.origin !== location.origin) return;

  // CRITICAL: NEVER intercept Next.js chunks, dev-server, HMR, internals, or API calls!
  // Allowing the browser to handle these directly prevents ChunkLoadError and SyntaxError.
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('webpack') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('__next')
  ) {
    return;
  }

  // HTML Page Navigation (Network-first with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const fallback = await caches.match('/');
        if (fallback) return fallback;
        return new Response(
          '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:2rem;background:#0b1015;color:#fff;"><h2>Modo Offline - Psicoficha</h2><p>Conecte-se à internet para carregar novas telas.</p></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // Precached static assets (icons, logo, manifest)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});

// System notification interaction handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = '/?route=lembretes';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
