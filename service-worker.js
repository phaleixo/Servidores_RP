const CACHE_NAME = "ifsuldeminas-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/js/main.js",
  "/src/img/logo.png",
  "/src/img/icon-512x512.png",
  '/termos.html',
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
