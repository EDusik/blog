const CACHE = "blog-offline-v2";
/** Same-origin fetches cannot hang the tab indefinitely behind the SW. */
const SW_FETCH_TIMEOUT_MS = 28_000;

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

function fetchWithDeadline(request) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return fetch(request, { signal: AbortSignal.timeout(SW_FETCH_TIMEOUT_MS) });
  }
  return fetch(request);
}

async function cacheFirst(request, cache) {
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetchWithDeadline(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function networkFirst(request, cache) {
  try {
    const res = await fetchWithDeadline(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch {
    let hit = await cache.match(request);
    if (hit) return hit;
    hit = await cache.match(request.url);
    if (hit) return hit;
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  // Full navigations bypass the SW so a slow/hung server response is not stuck behind our handler.
  if (request.mode === "navigate") return;

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
