// 📖 GraceVoice Service Worker

const CACHE_NAME = "gracevoice-cache-v3";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/reader.html",
  "/settings.html",
  "/bookmarks.html",
  "/notes.html",
  "/receive-christ.html",
  "/prayer-wall.html"
];

// ✅ Install: Cache static app shell
self.addEventListener("install", (event) => {
  console.log("[GraceVoice SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[GraceVoice SW] Caching static shell...");
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// 🔁 Activate: Remove outdated cache versions
self.addEventListener("activate", (event) => {
  console.log("[GraceVoice SW] Activating...");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[GraceVoice SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🌐 Fetch: Serve static or dynamic content
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 📘 Dynamic caching for scripture API
  if (url.pathname.startsWith("/api/fetch-script.js")) {
    event.respondWith(
      caches.open("gracevoice-dynamic").then((cache) =>
        fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            return cache.match(event.request) ||
              new Response("⚠️ You're offline and this scripture was never read.");
          })
      )
    );
    return;
  }

  // 🧱 Static shell fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) =>
      cachedResponse || fetch(event.request).catch(() =>
        new Response("⚠️ You're offline and the requested file is not cached.")
      )
    )
  );
});
