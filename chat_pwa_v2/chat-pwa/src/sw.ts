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

self.skipWaiting();
clientsClaim();
