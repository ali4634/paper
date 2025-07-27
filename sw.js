// کیش کا نیا ورژن تاکہ براؤزر اسے اپ ڈیٹ کرے
const staticCacheName = 'paper-static-v2';

// آپ کی GitHub Pages ریپوزٹری کے لیے درست اور مکمل پاتھ
const assets = [
  '/paper/',
  '/paper/index.html',
  '/paper/manifest.json',
  '/paper/icons/icon-192.png',
  '/paper/icons/icon-512.png'
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

// فیچ ایونٹ (یہ اب ریفریش کو بھی ہینڈل کرے گا)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});
