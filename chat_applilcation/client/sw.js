const VERSION = 2;
const ASSETS_CACHE_PREFIX = "chat-pwa";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-v${VERSION}`;
const ASSET_URLS = [
  "/",
  "/index.html",
  "/app.js",
  "/installer.js",
  "/app.webmanifest",
  "/style.css",
  "/favicon.ico",
  "/images/background.jpg",
  "/images/screenshot.png",
  "/images/screenshot-wide.png",
  "/images/users/daniel.jpg",
  "/images/users/franz.jpg",
  "/images/users/guenther.jpg",
  "/images/users/manuel.jpg",
  "/fonts/Roboto-Regular.tff",
  "/icons/maskable-icon-512x512.png",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(ASSETS_CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS))
  );
});

self.addEventListener("fetch", function (event) {
  const path = new URL(event.request.url).pathname;
  if (ASSET_URLS.includes(path)) {
    event.respondWith(
      caches.open(ASSETS_CACHE_NAME).then((cache) => cache.match(event.request))
    );
  }

  if (path.endsWith("/conversations")) {
    event.respondWith(
      caches.open(ASSETS_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        return fetch(event.request)
          .then((resp) => {
            if (resp.ok) cache.put(event.request, resp.clone());
            return resp;
          })
          .catch(
            () =>
              cached ||
              new Response("Offline — no cached conversations", { status: 503 })
          );
      })
    );
  }

  if (event.request.url.endsWith("test2.txt")) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        return caches.match(event.request);
      })
    );
  }
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === ASSETS_CACHE_NAME) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
});
