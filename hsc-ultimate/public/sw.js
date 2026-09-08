// HSC Ultimate service worker — public-shell offline support only.
// Authenticated/personalized HTML is never written to Cache Storage.

const CACHE_VERSION = "hsc-ultimate-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PUBLIC_PAGES_CACHE = `${CACHE_VERSION}-public-pages`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png"];
const PUBLIC_CACHEABLE_PATHS = new Set([
  "/",
  "/privacy",
  "/terms",
  "/account-deletion",
]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApiOrAuthRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.includes("/callback/")
  );
}

function mayCachePublicPage(request, response) {
  if (!PUBLIC_CACHEABLE_PATHS.has(new URL(request.url).pathname)) return false;
  if (!response.ok || response.type !== "basic") return false;
  const policy = response.headers.get("cache-control")?.toLowerCase() ?? "";
  return !policy.includes("no-store") && !policy.includes("private");
}

function safeInternalPath(raw) {
  try {
    const url = new URL(typeof raw === "string" ? raw : "/dashboard", self.location.origin);
    if (url.origin !== self.location.origin) return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (isApiOrAuthRequest(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (mayCachePublicPage(request, response)) {
            const clone = response.clone();
            event.waitUntil(
              caches.open(PUBLIC_PAGES_CACHE).then((cache) => cache.put(request, clone))
            );
          }
          return response;
        })
        .catch(async () => {
          // Only explicitly public pages may use their cached HTML. A protected
          // route always gets the generic offline page, never another account's UI.
          if (PUBLIC_CACHEABLE_PATHS.has(url.pathname)) {
            const cached = await caches.match(request);
            if (cached) return cached;
          }
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)));
          }
          return response;
        });
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "HSC Ultimate", body: "নতুন নোটিফিকেশন এসেছে" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    // Keep the neutral fallback notification.
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: safeInternalPath(data.link) },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeInternalPath(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
