// Service Worker for aggressive photo caching
const CACHE_NAME = 'wedding-photos-v1';
const PHOTO_URLS = [
    '1 - RX-min.jpg',
    '2 - RXKO-min.jpg',
    '3 - KO-min.jpg', 
    '4 - RXKO-min.jpg',
    '5 - RXKO-min.jpg',
    '6 - RXKO-min.jpg',
    'NZ_Keisha-Robin_Centred.jpg',
    'Cape-Naturaliste.jpg'
];

// Install event - cache photos immediately
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching wedding photos...');
                return cache.addAll(PHOTO_URLS);
            })
            .then(() => {
                console.log('All photos cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache photos:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
    // Only handle image requests
    if (event.request.destination === 'image' || 
        PHOTO_URLS.some(url => event.request.url.includes(url))) {
        
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        console.log('Serving from cache:', event.request.url);
                        return response;
                    }
                    
                    // Not in cache, fetch from network and cache for next time
                    return fetch(event.request)
                        .then((response) => {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            
                            // Clone the response for caching
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            
                            return response;
                        });
                })
                .catch(() => {
                    console.error('Failed to fetch image:', event.request.url);
                })
        );
    }
});
