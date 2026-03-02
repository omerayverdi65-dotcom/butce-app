const CACHE_NAME = 'asistan-v4';
const urlsToCache = [
    '/',
    '/index.html',
    '/anasayfa.html',
    '/isler.html',
    '/butce.html',
    '/raporlar.html',
    '/hatirlatmalar.html',
    '/hedefler.html',
    '/manifest.json',
    '/sync.js',
    '/notifications.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(function() {
                    return caches.match('/index.html');
                });
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// PUSH BİLDİRİM İŞLEMLERİ
self.addEventListener('push', function(event) {
    var data = event.data ? event.data.json() : {};
    
    var options = {
        body: data.body || 'Yeni hatırlatmanız var!',
        icon: 'icon-192x192.png',
        badge: 'icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'default',
        requireInteraction: true,
        data: data,
        actions: [
            { action: 'open', title: 'Aç' },
            { action: 'close', title: 'Kapat' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Kişisel Asistan', options)
    );
});

// Bildirim tıklama
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    // Uygulamayı aç
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});