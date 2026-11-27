// Safe mode: removes old caches and works as a plain pass-through (no caching), so the app always loads from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", () => {});
