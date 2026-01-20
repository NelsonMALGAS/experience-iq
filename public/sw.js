const CACHE_NAME = "service-resolve-pages-v1";

// Pages to cache (update as you add more)
const pagesToCache = [
  "/",
  "/guest",
  "/staff/dashboard",
  "/manager/dashboard",
  "/admin/overview",
  "/admin/properties",
  "/admin/users",
];

// Install: cache only pages
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching pages");
      return cache.addAll(pagesToCache);
    })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve cached pages first, then network
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache pages from your origin
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// Push notifications
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon1.png",
      badge: "/icon1.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click
self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();

  const url =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://service-resolve.vercel.app";

  event.waitUntil(clients.openWindow(url));
});
