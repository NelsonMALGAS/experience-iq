const CACHE_NAME = "experience-iq-pages-v3";

// Pages to cache - updated to match NAV_LINKS structure
const pagesToCache = [
  "/",
  "/guest",
  "/guest/add-issue",
  "/staff",
  "/staff/issues",
  "/staff/roster",
  "/admin",
  "/admin/properties",
  "/admin/users",
  "/admin/create-roster",
];

// Install: cache pages and essential assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching pages and assets");
        return cache.addAll(pagesToCache);
      })
      .catch((error) => {
        console.error("[ServiceWorker] Cache failed:", error);
      }),
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
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Fetch: Network-first strategy for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle requests from the same origin
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Network-first for HTML pages
        if (
          event.request.headers.get("accept")?.includes("text/html") ||
          url.pathname.startsWith("/guest") ||
          url.pathname.startsWith("/staff") ||
          url.pathname.startsWith("/admin")
        ) {
          try {
            const networkResponse = await fetch(event.request);
            // Update cache with fresh response
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          } catch (error) {
            console.error(`Error: ${error}`);
            // Network failed, try cache
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              console.log(
                "[ServiceWorker] Serving from cache (offline):",
                url.pathname,
              );
              return cachedResponse;
            }
            // No cache, return offline page or error
            return new Response("Offline - Page not cached", {
              status: 503,
              statusText: "Service Unavailable",
            });
          }
        }

        // Cache-first for static assets (images, icons, fonts)
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        const networkResponse = await fetch(event.request);

        // Cache successful responses for future use
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.error("[ServiceWorker] Fetch failed:", error);
        // Return cached version if available
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Last resort error response
        return new Response("Network error", {
          status: 408,
          statusText: "Request Timeout",
        });
      }
    })(),
  );
});

// Push notifications
self.addEventListener("push", function (event) {
  console.log("[ServiceWorker] Push received");

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "New notification from ExperienceIQ",
      icon: "/pwa-icon-192.png",
      badge: "/favicon-96x96.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || "1",
        url: data.url || "/",
      },
      actions: [
        {
          action: "open",
          title: "View Details",
        },
        {
          action: "close",
          title: "Dismiss",
        },
      ],
      tag: data.tag || "default",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "ExperienceIQ", options),
    );
  }
});

// Notification click
self.addEventListener("notificationclick", function (event) {
  console.log("[ServiceWorker] Notification click received");

  event.notification.close();

  const urlToOpen =
    event.notification.data?.url ||
    (self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://experience-iq.vercel.app");

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUnhandled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Background sync (for offline form submissions)
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync:", event.tag);

  if (event.tag === "sync-issues") {
    event.waitUntil(
      // Sync pending issue submissions
      syncPendingIssues(),
    );
  }
});

// Helper function for syncing (you can implement this based on your needs)
async function syncPendingIssues() {
  // This would handle syncing any pending issue submissions
  // that were made while offline
  console.log("[ServiceWorker] Syncing pending issues...");
  // Implementation depends on your IndexedDB or localStorage structure
}

// Message handler for manual cache updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          }),
        );
      }),
    );
  }
});
