 // service-worker.js

// ورژن نمبر بڑھائیں تاکہ سروس ورکر اپ ڈیٹ ہو
const CACHE_NAME = 'paper-marking-app-cache-v4';

const urlsToCache = [
  '/',
  'index.html', // <-- یہ فائل فال بیک کے لیے بہت اہم ہے
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js'
];

// --- انسٹالیشن کا مرحلہ ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// --- ایکٹیویشن کا مرحلہ ---
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

// --- فیچ (Fetch) کا مرحلہ (حتمی ورژن) ---
self.addEventListener('fetch', event => {
  // اگر یہ صفحہ ریفریش کرنے کی درخواست ہے (navigation request)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // اگر آن لائن ہیں تو نیٹ ورک سے جواب دیں
          return response;
        })
        .catch(() => {
          // اگر آف لائن ہیں، تو کیشے سے মূল HTML فائل واپس کریں
          return caches.match('index.html');
        })
    );
    return; // یہاں رک جائیں
  }

  // باقی تمام درخواستوں کے لیے (CSS, JS, تصاویر, وغیرہ)
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // نیٹ ورک سے جواب ملا، اسے کیشے میں محفوظ کریں
        return caches.open(CACHE_NAME).then(cache => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // نیٹ ورک ناکام، کیشے سے جواب تلاش کریں
        return caches.match(event.request);
      })
  );
});
