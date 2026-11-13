// Offline support: always try the network first (so updates show immediately),
// and fall back to the last saved copy when the connection drops.
const CACHE = "yenton-v6";
const CORE = [
  "index.html", "shop.html", "deals.html", "directory.html", "how-it-works.html",
  "packages.html", "advertise.html", "contact.html", "find.html", "report.html", "faq.html", "terms.html", "privacy.html", "poster.html",
  "styles.css", "i18n.js", "data.js", "sheet.js", "layout.js", "app.js",
  "assets/yenton-poster.webp", "assets/mascot-face.jpg", "assets/icon-192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
