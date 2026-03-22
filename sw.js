importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC_B3U16LDVbjxd1XA5R0JdcIkdi_tbjdM",
  authDomain: "daily-focus-cf28c.firebaseapp.com",
  projectId: "daily-focus-cf28c",
  storageBucket: "daily-focus-cf28c.firebasestorage.app",
  messagingSenderId: "687477403439",
  appId: "1:687477403439:web:a0a00e26e1d04dd4297bda"
});

const messaging = firebase.messaging();

const CACHE = 'dailyfocus-v2';
const ASSETS = ['/daily-focus/', '/daily-focus/index.html', '/daily-focus/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(
    payload.notification?.title || 'Daily Focus',
    {
      body: payload.notification?.body || "Don't forget your tasks today!",
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: self.location.origin }
    }
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
