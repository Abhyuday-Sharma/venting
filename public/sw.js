const CACHE_NAME = 'venting-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch listener to pass PWA installability requirements.
  // We can expand this later with actual offline caching strategies if needed.
});
