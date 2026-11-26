// Learn C service worker: caches the app shell, works offline for pages already opened.
const C = "lc-v2", SHELL = ["/", "/index.html", "/style.css", "/app.js", "/icon.svg", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(C).then((x) => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then((m) => m || (e.request.mode === "navigate" ? caches.match("/index.html") : Response.error()))));
});
