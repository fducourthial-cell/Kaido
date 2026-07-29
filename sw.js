const CACHE_NAME = 'kaido-cache-v4'; // <-- Incrémenté en v4
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
    './js/modules/gallery.js',    // <--- Ajouté
    './js/modules/documents.js', // <--- Ajouté
    './image/logo kaido v7.2.png'  // <--- Mis à jour avec ton nom de logo correct
];

// Installation : Mise en cache des ressources principales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 [Service Worker] Mise en cache des fichiers PWA v4');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activation : Nettoyage immédiat des anciens caches
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
    // 1. Sécurité : On ignore toutes les requêtes qui ne sont pas en GET (les POST vers Supabase/Cloudinary)
    if (event.request.method !== 'GET') {
        return;
    }

    // 2. Ignorer les requêtes vers les API externes (Google Maps, Supabase, Cloudinary, Pexels)
    if (
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('supabase.co') ||
        event.request.url.includes('cloudinary.com') ||
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
