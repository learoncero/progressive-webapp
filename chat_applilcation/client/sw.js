const VERSION = 1;

const ASSETS_CACHE_PREFIX = "chat-pwa-assets";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-v${VERSION}`;
const ASSET_URLS = [
  "/",
  "/index.html",
  "/reset-last-chat.html",
  "/app.js",
  "/app.webmanifest",
  "/style.css",
  "/favicon.ico",
  "/js/services/connectionService.js",
  "/js/services/installerService.js",
  "/js/services/storageService.js",
  "/js/api/chatApi.js",
  "/ui/conversationList.js",
  "/ui/conversationView.js",
  "/images/screenshot-narrow.png",
  "/images/screenshot-wide.png",
  "/fonts/Roboto-Regular.tff",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/icons/maskable-icon-512x512.png",
  "/icons/reset-icon-96x96.png",
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

self.addEventListener("activate", (event) => {
  // cleanup old caches
  event.waitUntil(
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

  // assets from cache
  if (ASSET_URLS.includes(path)) {
    event.respondWith(
      caches
        .open(ASSETS_CACHE_NAME)
        .then((cache) =>
          cache
            .match(event.request)
            .then((cachedResponse) => cachedResponse || fetch(event.request))
        )
    );
    return;
  }

  // user images from cache
  if (USER_IMAGE_URLS.includes(path)) {
    event.respondWith(
      caches
        .open(USER_IMAGES_CACHE_NAME)
        .then((cache) =>
          cache
            .match(event.request)
            .then((cachedResponse) => cachedResponse || fetch(event.request))
        )
    );
    return;
  }

  if (path.startsWith("/conversations")) {
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
    return;
  }

  // fallback: try network first, fallback to offline response for anything else
  event.respondWith(
    fetch(event.request).catch(
      () => new Response("Offline — resource not cached", { status: 503 })
    )
  );
});
