// 运行时自推导 basePath（GitHub Pages 项目页为 /<repo>），无需构建期注入。
const BASE = (() => {
  const p = self.location.pathname; // e.g. /zen-pond/sw.js
  const i = p.lastIndexOf("/sw.js");
  return i > 0 ? p.slice(0, i) : ""; // "" 或 "/zen-pond"
})();

const CACHE = "zen-water-v1";
const PRECACHE = [
  `${BASE}/`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/vendor/liquid1.min.js`,
  `${BASE}/icons/icon.svg`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
  `${BASE}/icons/icon-maskable-512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isStatic =
    path.startsWith(`${BASE}/_next/static`) ||
    path.startsWith(`${BASE}/vendor`) ||
    path.startsWith(`${BASE}/audio`) ||
    path.startsWith(`${BASE}/icons`) ||
    path === `${BASE}/manifest.webmanifest` ||
    path.startsWith("/_next/static") ||
    path.startsWith("/vendor") ||
    path.startsWith("/audio") ||
    path.startsWith("/icons") ||
    path === "/manifest.webmanifest";

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  if (req.mode === "navigation") {
    event.respondWith(fetch(req).catch(() => caches.match(`${BASE}/`)));
    return;
  }

  event.respondWith(fetch(req));
});
