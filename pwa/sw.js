const CACHE_NAME = 'lvlbase-v1.0.0';
const STATIC_ASSETS = [
  '/core/css/base.css',
  '/core/css/bento-grid.css',
  '/core/css/gamification.css',
  '/core/css/auth.css',
  '/core/css/data.css',
  '/core/js/firebase/init.js',
  '/core/js/firebase/auth.js',
  '/core/js/firebase/firestore.js',
  '/core/js/core/state.js',
  '/core/js/core/ui-components.js',
  '/core/js/core/security.js',
  '/core/js/features/gamification.js',
  '/public/offline.html',
  '/public/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network first, no cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  // Static assets: cache first
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }
  // HTML: network first, fallback to cache, then offline page
  event.respondWith(
    fetch(request)
      .then(res => { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(request, clone)); return res; })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/public/offline.html')))
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'lvlBase', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/badge-72.png',
      data: data.url,
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
