const CACHE_NAME = 'kaido-cache-v3'; // <-- Incrémente la version ici à chaque grosse modif (v2, v3...)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './creer.html',
  './voyage.html',
  './css/style.css',
  './js/auth.js',
  './js/supabase.js',
  './js/voyage.js',
  './js/create-trip.js',
  './image/logo kaido V4.png'
];

// Installation : Mise en cache des ressources principales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [Service Worker] Mise en cache des fichiers PWA v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage immédiat des anciens caches (v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [Service Worker] Suppression ancien cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie "Network First avec mise à jour du cache"
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes vers les API externes
  if (
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('pexels.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
