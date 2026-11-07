/* =====================================================================
   Cheerful Heart Adventures — service worker (offline play)
   • Every page, script, style and picture is saved on install, so the whole
     game works with no internet after the first visit.
   • Pages: try the network first (to get updates), fall back to the saved copy.
   • Everything else: the saved copy right away, refreshed in the background.
   • Fonts and the 3D library are part of the game (vendor/), so nothing is
     loaded from other websites. No data is ever sent anywhere.
   Bump VERSION whenever files change so devices pick up the new copies.
   ===================================================================== */
const VERSION = 'ch-v4-2026-11-07';
const CORE = `${VERSION}-core`;

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
  'img/icons/apple-touch-icon.png', 'img/icons/favicon-48.png',
  'vendor/three/three.min.js', 'vendor/fonts/fonts.css',
  'vendor/fonts/fredoka-latin.woff2', 'vendor/fonts/fredoka-latin-ext.woff2',
  'vendor/fonts/lilita-one-latin.woff2', 'vendor/fonts/lilita-one-latin-ext.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const core = await caches.open(CORE);
    await core.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
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
  const hit = await cache.match(req, { ignoreSearch: true });
  const refresh = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
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
  }   // other websites are never contacted by the game
});
