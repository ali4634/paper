// کیش کا نیا اور صاف ورژن
const staticCacheName = 'paper-static-v1';

// صرف وہ فائلیں جو آپ کی ریپوزٹری میں حقیقت میں موجود ہیں
const assets = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// انسٹال ایونٹ: سروس ورکر انسٹال ہوتے وقت ان فائلوں کو کیش کرتا ہے
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets for paper app');
      return cache.addAll(assets);
    })
  );
});

// ایکٹیویٹ ایونٹ: پرانے کیش کو صاف کرتا ہے
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

// فیچ ایونٹ: آف لائن ہونے پر کیش سے جواب دیتا ہے
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // اگر فائل کیش میں ہے تو وہیں سے دے دو، ورنہ انٹرنیٹ سے لانے کی کوشش کرو
      return cacheRes || fetch(evt.request);
    })
  );
});
