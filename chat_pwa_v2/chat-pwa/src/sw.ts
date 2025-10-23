/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

// ===== STEP 1: Precache all static files (App Shell) =====
// This caches: HTML, CSS, JS, images, fonts automatically from globPatterns
precacheAndRoute(self.__WB_MANIFEST);

// ===== STEP 2: Clean old caches =====
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
    url.pathname.startsWith("/conversations") ||
    url.pathname.includes("/messages"),
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

// ===== STEP 5: Cache images with CacheFirst strategy =====
// Serve from cache first, network if not cached
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

self.skipWaiting();
clientsClaim();
