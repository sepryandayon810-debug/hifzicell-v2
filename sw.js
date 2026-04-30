/**
 * ==================================================================
 * FILE    : sw.js
 * FUNGSI  : Service Worker untuk caching & offline support
 *           Cache halaman utama dan assets agar bisa dibuka offline
 * ==================================================================
 */

const CACHE_NAME = "webpos-v3-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/login.html",
  "/register.html",
  "/css/themes/themes.css",
  "/js/core/firebase-config.js",
  "/js/core/utils.js",
  "/js/modules/auth.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        // Kalau offline dan request ke HTML, tampilkan index
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});
