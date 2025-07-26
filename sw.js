// sw.js

// نیا ورژن نمبر تاکہ براؤزر اپ ڈیٹ کو پہچانے
const CACHE_NAME = 'paper-marking-app-cache-v6';

// صرف وہی فائلیں شامل کی گئی ہیں جو آپ کے پروجیکٹ میں موجود ہیں
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// --- انسٹالیشن کا مرحلہ ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened, adding core assets.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// --- ایکٹیویشن کا مرحلہ ---
// پرانے کیشے کو صاف کرتا ہے
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- فیچ (Fetch) کا مرحلہ (Cache First حکمت عملی) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    // پہلے کیشے میں تلاش کریں
    caches.match(event.request)
      .then(cachedResponse => {
        // اگر کیشے میں ہے تو اسے واپس کریں
        if (cachedResponse) {
          return cachedResponse;
        }

        // اگر کیشے میں نہیں ہے، تو نیٹ ورک پر جائیں
        return fetch(event.request);
        // چونکہ آپ کی ایپ میں کوئی متحرک مواد نہیں ہے،
        // اس لیے نیٹ ورک سے آئی چیزوں کو دوبارہ کیشے کرنے کی ضرورت نہیں ہے۔
        // یہ کوڈ کو سادہ اور تیز رکھتا ہے۔
      })
  );
});
