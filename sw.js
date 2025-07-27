 const staticCacheName = 'paper-app-static-v1';

// آپ کی تمام ضروری فائلیں
const assets = [
  '/paper/',
  '/paper/index.html',
  '/paper/manifest.json',
  '/paper/icons/icon-192.png',
  '/paper/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js'
];

// انسٹال ایونٹ
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets for paper app');
      return cache.addAll(assets);
    })
  );
});

// ایکٹیویٹ ایونٹ
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// فیچ ایونٹ
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});۔
