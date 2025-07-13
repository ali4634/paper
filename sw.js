const CACHE_NAME = 'paper-marking-app-cache-v2'; // ورژن نمبر بڑھا دیں

const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js' // <-- یہ لائن شامل کی گئی ہے
];
// انسٹالیشن کے دوران کیشنگ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// آف لائن کام کرنے کے لیے کیش سے جواب دینا
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر کیش میں ہے تو کیش سے جواب دیں
        if (response) {
          return response;
        }
        // ورنہ نیٹ ورک سے لائیں
        return fetch(event.request);
      }
    )
  );
});

// پرانے کیش کو صاف کرنا
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
    })
  );
});
