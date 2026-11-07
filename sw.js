/* =====================================================================
   Cheerful Heart Adventures — service worker (offline play)
   • Every page, script, style and picture is saved on install, so the whole
     game works with no internet after the first visit.
   • Pages: try the network first (to get updates), fall back to the saved copy.
   • Everything else: the saved copy right away, refreshed in the background.
   • The 3D library (Star Map) and the web fonts are saved the first time
     they load. No data is ever sent anywhere — this file only caches files.
   Bump VERSION whenever files change so devices pick up the new copies.
   ===================================================================== */
const VERSION = 'ch-v2-2026-11-07';
const CORE = `${VERSION}-core`, EXT = `${VERSION}-ext`;

const FILES = [
  './', 'index.html', 'grownups.html', 'manifest.webmanifest',
  'star-map.html', 'shapes.html', 'patterns.html', 'treasure.html', 'cookies.html', 'bridge.html',
  'sorting.html', 'clock.html', 'market.html', 'hide-seek.html', 'garden.html', 'race.html',
  'shared.js', 'css/theme.css',
  'core/config.js', 'core/store.js', 'core/voice.js', 'core/ui.js', 'core/avatars.js',
  'core/break.js', 'core/profile-form.js', 'core/pwa.js',
  'img/ali.webp', 'img/wynea.webp', 'img/matthew.webp',
  'img/ali-full.webp', 'img/wynea-full.webp', 'img/matthew-full.webp',
  'img/icons/icon-192.png', 'img/icons/icon-512.png', 'img/icons/icon-maskable-512.png',
  'img/icons/apple-touch-icon.png', 'img/icons/favicon-48.png'
];
/* saved on install too, but a failure here must not stop the install */
const OPTIONAL = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Lilita+One&display=swap'
];
const EXT_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const core = await caches.open(CORE);
    await core.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
    const ext = await caches.open(EXT);
    await Promise.all(OPTIONAL.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && ext.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ch-') && !k.startsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function fromNetworkThenCache(req) {
  const cache = await caches.open(CORE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || Response.error();
  }
}
async function fromCacheThenRefresh(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req, { ignoreSearch: name === CORE });
  const refresh = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await refresh) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.includes('/tests/')) return;                 // test pages always live
    if (req.mode === 'navigate') e.respondWith(fromNetworkThenCache(req));
    else e.respondWith(fromCacheThenRefresh(req, CORE));
  } else if (EXT_HOSTS.includes(url.hostname)) {
    e.respondWith(fromCacheThenRefresh(req, EXT));
  }
});
