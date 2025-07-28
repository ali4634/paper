 const CACHE_NAME = 'paper-app-cache-v1'; // نیا ورژن
const REPO_NAME = '/paper/'; // آپ کی ریپوزٹری کا نام

// آپ کی paper ریپوزٹری کی تمام ضروری فائلیں
const URLS_TO_CACHE = [
  REPO_NAME,
  REPO_NAME + 'index.html',
  REPO_NAME + 'manifest.json',
  REPO_NAME + 'icons/icon-192×192.png',  // <-- icons کا فولڈر شامل کیا
  REPO_NAME + 'icons/icon-512×512.png',  // <-- icons کا فولڈر شامل کیا
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache for paper app');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر کیش میں ہے تو وہیں سے دو، ورنہ نیٹ ورک سے لاؤ
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
