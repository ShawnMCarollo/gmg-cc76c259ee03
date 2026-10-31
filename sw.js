// Golf Money Games service worker (build 6c16adff54).
// Page (index.html) is network-first so a new build shows up on the next open; falls back to cache offline.
// Other files are versioned (app.js?v=build) and served cache-first.
const CACHE = "golf-money-games-6c16adff54";
const ASSETS = ["./", "index.html", "app.js?v=6c16adff54", "manifest.json", "apple-touch-icon.png", "favicon.png",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("golf-money-games-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const isPage = (req, url) => req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (isPage(req, url) || url.pathname.endsWith("/manifest.json") || url.pathname.endsWith("/version.json")) {
    e.respondWith(fetch(req, { cache: "no-store" }).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(isPage(req, url) ? "index.html" : req, copy)); }
      return res;
    }).catch(() => caches.match(isPage(req, url) ? "index.html" : req, { ignoreSearch: true }).then((hit) => hit || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
