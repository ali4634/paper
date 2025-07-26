// service-worker.js

const STATIC_CACHE_NAME = 'paper-app-static-v1'; // ایپ کے بنیادی ڈھانچے کے لیے کیشے
const DYNAMIC_CACHE_NAME = 'paper-app-dynamic-v1'; // متحرک مواد کے لیے کیشے

// وہ فائلیں جنہیں انسٹالیشن کے وقت فوراً کیشے کرنا ہے (ایپ شیل)
const STATIC_ASSETS = [
  '/',                // ہوم پیج
  '/index.html',      // مین ایچ ٹی ایم ایل فائل
  '/style.css',       // سی ایس ایس اسٹائل شیٹ
  '/app.js',          // مین جاوا اسکرپٹ فائل
  '/manifest.json',   // ویب ایپ مینی فیسٹ
  // اگر آپ کے پاس آف لائن فال بیک پیج ہے تو اسے بھی شامل کریں
  // '/offline.html', 
  // آئیکنز اور دیگر اثاثے
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// مرحلہ 1: سروس ورکر انسٹال کرنا
self.addEventListener('install', event => {
  console.log('[Service Worker] انسٹال ہو رہا ہے...');
  // waitUntil اس بات کو یقینی بناتا ہے کہ انسٹالیشن کا عمل
  // کیشے مکمل ہونے تک انتظار کرے
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] ایپ شیل کو کیشے کر رہا ہے');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // نئے سروس ورکر کو فوراً فعال کرنے کے لیے
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] کیشے شامل کرنے میں ناکامی:', err);
      })
  );
});

// مرحلہ 2: سروس ورکر کو ایکٹیویٹ کرنا
self.addEventListener('activate', event => {
  console.log('[Service Worker] ایکٹیویٹ ہو رہا ہے...');
  // waitUntil پرانے کیشے کو صاف کرنے کا عمل مکمل ہونے کا انتظار کرتا ہے
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
        .map(key => {
          console.log('[Service Worker] پرانا کیشے صاف کر رہا ہے:', key);
          return caches.delete(key);
        })
      );
    })
  );
  // تمام کھلے ہوئے کلائنٹس (ٹیبز) کا کنٹرول فوری طور پر حاصل کریں
  return self.clients.claim();
});

// مرحلہ 3: نیٹ ورک کی درخواستوں (Fetch Requests) کو ہینڈل کرنا
self.addEventListener('fetch', event => {
  // حکمت عملی: پہلے نیٹ ورک سے ڈیٹا لانے کی کوشش کرو، اگر ناکام ہو تو کیشے سے دکھاؤ
  
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME)
      .then(cache => {
        // 1. پہلے نیٹ ورک سے کوشش کریں
        return fetch(event.request)
          .then(networkResponse => {
            // اگر نیٹ ورک سے جواب کامیاب ہو
            if (networkResponse.ok) {
              // جواب کی ایک کاپی متحرک کیشے میں محفوظ کریں
              cache.put(event.request.url, networkResponse.clone());
            }
            // اور اصل جواب ایپ کو بھیجیں
            return networkResponse;
          })
          .catch(() => {
            // 2. اگر نیٹ ورک ناکام ہو جائے (آف لائن)
            console.log('[Service Worker] نیٹ ورک ناکام، کیشے سے تلاش کیا جا رہا ہے...');
            // تو کیشے میں اس درخواست کا جواب تلاش کریں
            return caches.match(event.request)
              .then(cachedResponse => {
                // اگر کیشے میں جواب مل جائے تو وہ واپس کریں
                // ورنہ، اگر آپ نے offline.html بنایا ہے تو وہ دکھائیں
                return cachedResponse; // || caches.match('/offline.html');
              });
          });
      })
  );
});
