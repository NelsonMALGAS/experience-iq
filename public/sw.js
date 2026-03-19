const CACHE_NAME = "experience-iq-pages-v6.0.1";

const STATIC_PAGES = [
  "/",
  "/guest",
  "/guest/add-issue",
  "/staff",
  "/staff/issues",
  "/staff/roster",
  "/staff/my-performance",
  "/admin",
  "/admin/properties",
  "/admin/collaborators",
  "/admin/invitations",
  "/admin/staff-verification",
  "/admin/insights",
  "/admin/create-roster",
  "/owner",
];

// ─── Safe Cache Helper ────────────────────────────────────────────────────────
// Skips 206 Partial, opaque (0), and error responses so cache.put() never throws.
async function safeCachePut(cache, request, response) {
  if (!response) return;

  // Skip range / partial-content responses (causes TypeError on cache.put)
  if (response.status === 206) return;

  // Skip opaque cross-origin responses (status 0)
  if (response.status === 0) return;

  // Skip any non-success response
  if (!response.ok) return;

  // Skip if the original request was a range request
  if (request.headers && request.headers.get("range")) return;

  try {
    await cache.put(request, response);
  } catch (err) {
    // Silently swallow — e.g. QuotaExceededError or remaining edge cases
    console.warn("[SW] cache.put skipped:", request.url, "—", err.message);
  }
}

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Install — cache:", CACHE_NAME);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // Cache pages one-by-one so a single failure doesn't abort everything
        for (const page of STATIC_PAGES) {
          try {
            await cache.add(page);
          } catch (err) {
            console.warn("[SW] Failed to pre-cache:", page, err.message);
          }
        }
      })
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate — clearing old caches");

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", key);
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept same-origin GET requests
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js internals, HMR, or Vercel infra
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/_vercel") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Skip range requests entirely — let the browser handle them natively
  if (request.headers.get("range")) return;

  const isHTMLRequest =
    request.headers.get("accept")?.includes("text/html") ||
    STATIC_PAGES.some(
      (p) => url.pathname === p || url.pathname.startsWith(p + "/"),
    );

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/static/") ||
    /\.(js|css|woff2?|ttf|otf|ico|png|jpg|jpeg|svg|webp|gif)$/.test(
      url.pathname,
    );

  event.respondWith(
    (async () => {
      // ── HTML pages: Network-first, fall back to cache ──────────────────────
      if (isHTMLRequest) {
        try {
          const networkResponse = await fetch(request);

          // Only cache clean 200 responses
          const cache = await caches.open(CACHE_NAME);
          await safeCachePut(cache, request, networkResponse.clone());

          return networkResponse;
        } catch {
          console.log(
            "[SW] Network failed for HTML, trying cache:",
            url.pathname,
          );

          const cached = await caches.match(request);
          if (cached) return cached;

          // Last resort: serve the root cached page
          const fallback = await caches.match("/");
          if (fallback) return fallback;

          return buildOfflineResponse();
        }
      }

      // ── Static assets: Cache-first, fall back to network ──────────────────
      if (isStaticAsset) {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await safeCachePut(cache, request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          console.warn(
            "[SW] Static asset fetch failed:",
            url.pathname,
            err.message,
          );
          return new Response("Asset unavailable offline", { status: 503 });
        }
      }

      // ── Everything else: Network-only ─────────────────────────────────────
      try {
        return await fetch(request);
      } catch {
        return new Response("Network error", { status: 503 });
      }
    })(),
  );
});

// ─── Offline HTML fallback ────────────────────────────────────────────────────
function buildOfflineResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline — ExperienceIQ</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: system-ui, sans-serif;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f172a;
        color: #f8fafc;
        text-align: center;
        padding: 24px;
      }
      h1 { font-size: 1.5rem; margin-bottom: 8px; }
      p  { color: #94a3b8; margin-bottom: 24px; }
      button {
        padding: 10px 24px;
        background: #f59e0b;
        color: #000;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div>
      <h1>You're offline</h1>
      <p>Check your connection and try again.</p>
      <button onclick="window.location.reload()">Retry</button>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || "ExperienceIQ", {
      body: data.body || "You have a new notification.",
      icon: "/pwa-icon-192.png",
      badge: "/favicon-96x96.png",
      vibrate: [100, 50, 100],
      tag: data.tag || "default",
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || "/",
        dateOfArrival: Date.now(),
        primaryKey: data.id || "1",
      },
      actions: [
        { action: "open", title: "View Details" },
        { action: "close", title: "Dismiss" },
      ],
    }),
  );
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen =
    event.notification.data?.url ||
    (self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://experienceiqplatform.com");

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-issues") {
    event.waitUntil(syncPendingIssues());
  }
});

async function syncPendingIssues() {
  console.log("[SW] Syncing pending issues...");
  // Implement IndexedDB read + POST to your API here when ready
}

// ─── Message Handler ──────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    );
  }
});
