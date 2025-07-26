// service-worker.js

// ورژن نمبر بڑھانا ہمیشہ ایک اچھا عمل ہے جب آپ sw.js میں تبدیلی کریں
const CACHE_NAME = 'paper-marking-app-cache-v3'; 

// وہ بنیادی فائلیں جنہیں انسٹالیشن کے وقت کیشے کرنا ضروری ہے
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js'
];

// --- انسٹالیشن کا مرحلہ ---
// سروس ورکر انسٹال ہوتا ہے اور بنیادی اثاثوں کو کیشے کرتا ہے
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // نیا سروس ورکر فوراً ایکٹیویٹ ہو جائے گا
  );
});

// --- ایکٹیویشن کا مرحلہ ---
// پرانے اور غیر ضروری کیشے کو صاف کرتا ہے
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // تمام کھلے ٹیبز کا کنٹرول سنبھالتا ہے
  );
});

// --- فیچ (Fetch) کا مرحلہ (بہتر حکمت عملی) ---
// ہر نیٹ ورک درخواست کو ہینڈل کرتا ہے
self.addEventListener('fetch', event => {
  // صرف GET درخواستوں کو ہینڈل کریں
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // 1. پہلے نیٹ ورک سے تازہ ترین ڈیٹا لانے کی کوشش کریں
    fetch(event.request)
      .then(networkResponse => {
        // اگر نیٹ ورک سے جواب کامیاب ہو
        // اس کی ایک کاپی کیشے میں محفوظ کریں اور اصل جواب ایپ کو بھیجیں
        return caches.open(CACHE_NAME).then(cache => {
          // صرف کامیاب جوابات کو کیشے کریں
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // 2. اگر نیٹ ورک ناکام ہو جائے (صارف آف لائن ہے)
        // تو کیشے میں اس درخواست کا جواب تلاش کریں
        console.log('Network request failed. Serving from cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});
