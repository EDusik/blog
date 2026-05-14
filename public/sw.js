const CACHE = "blog-offline-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key === CACHE ? Promise.resolve() : caches.delete(key)))
      );
      await self.clients.claim();
    })()
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isGoogleFontHost(hostname) {
  return hostname === "fonts.googleapis.com" || hostname === "fonts.gstatic.com";
}

async function cacheFirst(request, cache) {
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, cache) {
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!isSameOrigin(url) && !isGoogleFontHost(url.hostname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (url.pathname.startsWith("/_next/static")) {
        return cacheFirst(request, cache);
      }
      if (isGoogleFontHost(url.hostname)) {
        return networkFirst(request, cache);
      }
      if (isSameOrigin(url)) {
        return networkFirst(request, cache);
      }
      return fetch(request);
    })()
  );
});
