/* Service Worker de A posto.
   - Las páginas se piden siempre a la red (contenido al día); sin conexión se muestra una página de aviso.
   - Solo se guardan en caché archivos estáticos públicos. Nunca datos personales, sesiones ni respuestas de /api. */
const VERSION = "aposto-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/logo-aposto.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.endsWith(".apk")) return;

  // Páginas: red primero; sin conexión, la página de aviso.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Archivos estáticos con nombre único o iconos: caché primero, y se guardan al pedirlos.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname === "/logo-aposto.svg") {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
});
