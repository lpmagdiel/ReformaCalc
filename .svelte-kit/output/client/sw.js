/*
 * Service Worker de ReformaCalc.
 *
 * Estrategia:
 *  - PRECACHE: la carcasa de la app (`/`) y el manifest al instalarse.
 *  - Navegación: network-first. Sirve la página más reciente del servidor y
 *    la guarda en caché para poder volver a ella sin conexión.
 *  - Assets de SvelteKit (`/app/immutable/*`, manifest, ...): cache-first con
 *    relleno de red. Los ficheros hasheados son inmutables, por lo que es seguro
 *    cachearlos.
 *
 * Robustez: ningún handler de `respondWith` debe rechazar. Todos los caminos
 * terminan en `catch` para que una red caída o una promesa de caché con errores
 * nunca rompa una petición del navegador.
 */

const CACHE = 'reformacalc-v2';
const PRECACHE = ['/', '/manifest.webmanifest'];
const OFFLINE_SHELL = '/';

/** Guarda una respuesta en caché sin lanzar errores (best effort). */
function cachePut(cache, key, response) {
  try {
    cache.put(key, response);
  } catch {
    /* silencioso: el cacheo es opcional */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => self.skipWaiting())
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Solo GET y mismo origen.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: network-first, fallback a la carcasa cacheada (offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE).then((cache) => cachePut(cache, OFFLINE_SHELL, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_SHELL))
    );
    return;
  }

  // Assets y otras peticiones de mismo origen: cache-first, fill en red.
  event.respondWith(
    caches
      .match(request, { ignoreSearch: true })
      .then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE).then((cache) => cachePut(cache, request.url, response.clone()));
          }
          return response;
        });
      })
      .catch(() => fetch(request))
  );
});