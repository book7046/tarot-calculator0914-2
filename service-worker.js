/* Improved SW: external CDN + fonts runtime caching; navigationPreload enabled */
const CACHE_NAME = "tarot-offline-v20250914094515";
const PRECACHE_URLS = [
  "./README-local-testing.md",
  "./README_GHPAGES.md",
  "./README_THEME.md",
  "./assets/README_RWS_IMAGES.txt",
  "./assets/cards/00.jpg",
  "./assets/cards/01.jpg",
  "./assets/cards/02.jpg",
  "./assets/cards/03.jpg",
  "./assets/cards/04.jpg",
  "./assets/cards/05.jpg",
  "./assets/cards/06.jpg",
  "./assets/cards/07.jpg",
  "./assets/cards/08.jpg",
  "./assets/cards/09.jpg",
  "./assets/cards/10.jpg",
  "./assets/cards/11.jpg",
  "./assets/cards/12.jpg",
  "./assets/cards/13.jpg",
  "./assets/cards/14.jpg",
  "./assets/cards/15.jpg",
  "./assets/cards/16.jpg",
  "./assets/cards/17.jpg",
  "./assets/cards/18.jpg",
  "./assets/cards/19.jpg",
  "./assets/cards/20.jpg",
  "./assets/cards/21.jpg",
  "./assets/cards/22.jpg",
  "./assets/cards/23.jpg",
  "./assets/cards/24.jpg",
  "./assets/cards/25.jpg",
  "./assets/cards/26.jpg",
  "./assets/cards/27.jpg",
  "./assets/cards/28.jpg",
  "./assets/cards/29.jpg",
  "./assets/cards/30.jpg",
  "./assets/cards/31.jpg",
  "./assets/cards/32.jpg",
  "./assets/cards/33.jpg",
  "./assets/cards/34.jpg",
  "./assets/cards/35.jpg",
  "./assets/cards/36.jpg",
  "./assets/cards/37.jpg",
  "./assets/cards/38.jpg",
  "./assets/cards/39.jpg",
  "./assets/cards/40.jpg",
  "./assets/cards/41.jpg",
  "./assets/cards/42.jpg",
  "./assets/cards/43.jpg",
  "./assets/cards/44.jpg",
  "./assets/cards/45.jpg",
  "./assets/cards/46.jpg",
  "./assets/cards/47.jpg",
  "./assets/cards/48.jpg",
  "./assets/cards/49.jpg",
  "./assets/cards/50.jpg",
  "./assets/cards/51.jpg",
  "./assets/cards/52.jpg",
  "./assets/cards/53.jpg",
  "./assets/cards/54.jpg",
  "./assets/cards/55.jpg",
  "./assets/cards/56.jpg",
  "./assets/cards/57.jpg",
  "./assets/cards/58.jpg",
  "./assets/cards/59.jpg",
  "./assets/cards/60.jpg",
  "./assets/cards/61.jpg",
  "./assets/cards/62.jpg",
  "./assets/cards/63.jpg",
  "./assets/cards/64.jpg",
  "./assets/cards/65.jpg",
  "./assets/cards/66.jpg",
  "./assets/cards/67.jpg",
  "./assets/cards/68.jpg",
  "./assets/cards/69.jpg",
  "./assets/cards/70.jpg",
  "./assets/cards/71.jpg",
  "./assets/cards/72.jpg",
  "./assets/cards/73.jpg",
  "./assets/cards/74.jpg",
  "./assets/cards/75.jpg",
  "./assets/cards/76.jpg",
  "./assets/cards/77.jpg",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png",
  "./assets/icons/safari-pinned-tab.svg",
  "./cards_index_map.csv",
  "./index.html",
  "./offline.html",
  "./service-worker.js",
  "./theme.css",
  "./theme_force.css",
  "./theme_ultra.css",
  "./assets/js/tarot-data.js",
  "./assets/js/app.js"
];

// External assets we want to pre-cache on first install (if online)
const EXTERNAL_PRECACHE = [
  "https://cdn.tailwindcss.com"
];

// During install: pre-cache app shell + external CDN (if available)
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(PRECACHE_URLS.concat(EXTERNAL_PRECACHE));
    } catch (e) {
      // ignore install-time network failures
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : undefined));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch(e){}
    }
  })());
  self.clients.claim();
});

// Helper: runtime cache for external hosts (cache-first + background refresh)
async function externalCacheHandler(request) {
  const cache = await caches.open("externals-" + CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request).then(res => { if (res && res.ok) cache.put(request, res.clone()); }).catch(()=>{});
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === 'opaque')) {
      cache.put(request, res.clone());
    } 
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Handle external CDNs (Tailwind) and Google Fonts
  if (url.origin === "https://cdn.tailwindcss.com" || url.host.endsWith("fonts.googleapis.com") || url.host.endsWith("fonts.gstatic.com")) {
    event.respondWith(externalCacheHandler(req));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (req.method === 'GET' && url.origin === location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      if (req.mode === 'navigate') {
        const fallback = await caches.match('./offline.html') || await caches.match('./index.html');
        if (fallback) return fallback;
      }
      return new Response('You are offline.', { status: 503, statusText: 'Offline' });
    }
  })());
});
