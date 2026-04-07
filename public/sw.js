// BREW CHAIN — Service Worker v1.0
// Estrategia: Network first con fallback a cache (app siempre actualizada)

const CACHE_NAME = 'brewchain-v1';
const OFFLINE_URL = '/offline';

// Assets críticos para el offline
const PRECACHE_URLS = [
  '/',
  '/m01',
  '/m02',
  '/m03',
  '/m04',
  '/m04/recibir',
  '/m04/historial',
  '/m05',
  '/m06',
  '/m06/escanear',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH — Network First ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Solo interceptar GET
  if (event.request.method !== 'GET') return;

  // No interceptar APIs externas ni extensiones
  const url = new URL(event.request.url);
  if (!url.origin.includes('localhost') && !url.origin.includes('brewchain')) return;

  // Rutas de API → siempre network, sin cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Sin conexión' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // Páginas y assets → Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar en cache solo respuestas válidas
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Sin red → buscar en cache
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Si es navegación → servir la raíz (SPA fallback)
        if (event.request.mode === 'navigate') {
          const root = await caches.match('/');
          if (root) return root;
        }

        return new Response('Sin conexión · BREW CHAIN', { status: 503 });
      })
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'BREW CHAIN';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'ver', title: 'Ver ahora' },
      { action: 'cerrar', title: 'Cerrar' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'ver' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});

// ── BACKGROUND SYNC — Parcelas offline ───────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-parcelas') {
    event.waitUntil(
      // Notificar a todos los clientes que hay sync disponible
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_PARCELAS' }));
      })
    );
  }
});
