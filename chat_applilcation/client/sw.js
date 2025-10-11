import {
  saveConversations,
  getConversationsByUsername,
  saveMessages,
  getMessagesByConversationId,
} from "./js/services/dbService.js";

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
  const url = new URL(event.request.url);
  const path = url.pathname;

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

  if (path === "/conversations" && event.request.method === "GET") {
    const userParam = url.searchParams.get("user");

    if (userParam) {
      event.respondWith(
        (async () => {
          try {
            // network first
            const networkResponse = await fetch(event.request);
            const data = await networkResponse.clone().json();

            // lazily store fetched conversations
            try {
              await saveConversations(data);
            } catch (dbError) {
              console.error(
                "Failed to save conversations to IndexedDB:",
                dbError
              );
            }
            return networkResponse;
          } catch (err) {
            console.warn("Network failed, trying offline fallback");
            // Offline fallback: read from IndexedDB
            const cached = await getConversationsByUsername(userParam);
            if (cached && cached.length > 0) {
              return new Response(JSON.stringify(cached), {
                headers: { "Content-Type": "application/json" },
              });
            }
            return new Response(
              JSON.stringify({
                error: "Offline: no cached conversations found",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        })()
      );
      return;
    }
  }

  if (
    path.startsWith("/conversations/") &&
    path.endsWith("/messages") &&
    event.request.method === "GET"
  ) {
    const conversationId = path.match(/^\/conversations\/(\d+)\/messages$/)[1];

    event.respondWith(
      (async () => {
        try {
          // network first
          const networkResponse = await fetch(event.request);
          const messages = await networkResponse.clone().json();

          // lazily store fetched messages
          try {
            await saveMessages(conversationId, messages);
          } catch (dbError) {
            console.error("Failed to save messages to IndexedDB:", dbError);
          }
          return networkResponse;
        } catch (err) {
          // Offline fallback: read from IndexedDB
          console.warn(
            "Network failed, loading cached messages for conversation",
            conversationId
          );
          const cachedMessages = await getMessagesByConversationId(
            conversationId
          );
          return new Response(JSON.stringify(cachedMessages), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      })()
    );
    return;
  }

  // fallback: try network first, fallback to offline response for anything else
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return JSON error for API requests, plain text for others
      if (path.startsWith("/conversations") || path.startsWith("/users")) {
        return new Response(
          JSON.stringify({ error: "Offline — resource not cached" }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response("Offline — resource not cached", { status: 503 });
    })
  );
});
