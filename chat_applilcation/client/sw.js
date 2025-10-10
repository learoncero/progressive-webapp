const VERSION = 1;

const ASSETS_CACHE_PREFIX = "chat-pwa-assets";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-v${VERSION}`;
const ASSET_URLS = [
  "/",
  "/index.html",
  "/app.js",
  "/js/services/installer.js",
  "/app.webmanifest",
  "/style.css",
  "/favicon.ico",
  "/images/screenshot-narrow.png",
  "/images/screenshot-wide.png",
  "/fonts/Roboto-Regular.tff",
  "/icons/maskable-icon-512x512.png",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
];

const USER_IMAGES_CACHE_PREFIX = "chat-pwa-user-images";
const USER_IMAGES_CACHE_NAME = `${USER_IMAGES_CACHE_PREFIX}-v${VERSION}`;
const USER_IMAGE_URLS = [
  "/images/users/daniel.jpg",
  "/images/users/franz.jpg",
  "/images/users/guenther.jpg",
  "/images/users/manuel.jpg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(ASSETS_CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS)),
      caches
        .open(USER_IMAGES_CACHE_NAME)
        .then((cache) => cache.addAll(USER_IMAGE_URLS))
        .catch((err) => console.error("Failed to cache user images:", err)),
    ])
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === ASSETS_CACHE_NAME || key === USER_IMAGES_CACHE_NAME) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
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
});
