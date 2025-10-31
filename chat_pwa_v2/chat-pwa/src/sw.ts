/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

// precache all static files (App Shell)
precacheAndRoute(self.__WB_MANIFEST);

// clean old caches
cleanupOutdatedCaches();

let allowlist: RegExp[] | undefined;
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV) allowlist = [/^\/$/];

// ===== STEP 3: Cache navigation requests (index.html) =====
// Makes the app work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

// ===== STEP 4: Cache API calls with NetworkFirst strategy =====
// Try network first, fall back to cache if offline
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/users") ||
    url.pathname.startsWith("/conversations"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache successful responses
      }),
      new ExpirationPlugin({
        maxEntries: 50, // Max 50 API responses cached
        maxAgeSeconds: 5 * 60, // Cache for 5 minutes
      }),
    ],
  })
);

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : "no payload";

  // Show notification with custom title for app updates
  const title = "App Update Available";

  const options = {
    body: data,
    requireInteraction: true, // Notification stays until user interacts
    actions: [
      {
        action: "refresh",
        title: "Refresh Now",
      },
      {
        action: "dismiss",
        title: "Later",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "refresh") {
    // Reload all clients (open tabs)
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
    );
  }
});

self.skipWaiting();
clientsClaim();
