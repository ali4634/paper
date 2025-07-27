// پیپر ایپ کے لیے کیش کا نیا نام اور ورژن
const staticCacheName = 'paper-app-static-v4'; // ورژن بدل دیا ہے

// آپ کی paper ریپوزٹری کی تمام ضروری فائلیں (بیرونی اسکرپٹ کے ساتھ)
const assets = [
  '/paper/',
  '/paper/index.html',
  '/paper/manifest.json',
  '/paper/icons/icon-192.png',
  '/paper/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js'
];

// انسٹال ایونٹ: سروس ورکر انسٹال ہوتے وقت ان فائلوں کو کیش کرتا ہے
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching assets for paper app');
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
