// Instant-open service worker: the app opens from the phone's cache immediately (even while the free server is asleep)
// and updates itself quietly in the background.
const C = "lc-v3";
const SHELL = ["/", "/index.html", "/app.js", "/chat.js", "/style.css", "/manifest.webmanifest",
  "/data/theory.json", "/data/practice_q.json", "/data/programs.json", "/data/interview_q.json", "/data/interview_a.json", "/data/college.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(C).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/") || u.searchParams.has("wake")) return;
  // cache first, then refresh in the background (stale-while-revalidate)
  e.respondWith(caches.open(C).then(async (cache) => {
    const hit = await cache.match(r, { ignoreSearch: true });
    const net = fetch(r).then((res) => { if (res && res.ok) cache.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (await cache.match("/index.html")) || new Response("Offline", { status: 503 });
  }));
});
