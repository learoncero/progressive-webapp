const VERSION = 2;
const ASSETS_CACHE_PREFIX = "pwa2";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-v${VERSION}`;
const ASSET_URLS = ["/test2.txt", "/test3.txt", "/test5.txt", "/test6.txt"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS))
  );
});

// self.addEventListener("install", (event) => {
//   console.log("Installing...");
//   event.waitUntil(
//     caches.open("pwa2-v1").then((cache) => {
//       cache.add("index.html");
//       cache.add("test2.txt");
//       cache.add("test3.txt");
//       cache.add("test6.txt");
//       cache.addAll(["/", "/app.js", "/favicon.ico"]);
//     })
//   );
// });

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async function () {
      const keys = await caches.keys();
      return Promise.all(
        keys.map((key) => {
          if (
            key.startsWith(ASSETS_CACHE_PREFIX) &&
            key !== ASSETS_CACHE_NAME
          ) {
            return caches.delete(key);
          }
        })
      );
    })()
  );
});

// self.addEventListener("activate", (event) => {
//   console.log("Activate SW...");
//   //event.waitUntil(…);
// });

self.addEventListener("fetch", (event) => {
  // caches.open("pwa2-v1").then((cache) => {
  //   cache.match(event.request).then((response) => {
  //     if (response) {
  //       console.log(response.url + " from Cache");
  //     } else {
  //       console.log(event.request.url + " is not cached!");
  //     }
  //   });
  // });

  if (event.request.url.endsWith("test1.txt")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Network request failed");
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

  if (event.request.url.endsWith("test3.txt")) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  }

  if (event.request.url.endsWith("test4.txt")) {
    const { request } = event;
    event.respondWith(
      (async function () {
        const cache = await caches.open("pwa2-v1");
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })()
    );
  }

  if (event.request.url.endsWith("test5.txt")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            return caches.open("pwa2-v1").then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            console.log("Network request failed");
          });
        return cachedResponse || networkFetch;
      })
    );
  }

  if (event.request.url.endsWith("test6.txt")) {
    event.respondWith(caches.match(event.request));
  }
});
