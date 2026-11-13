const scope = self.registration.scope;
const cachePrefix = `free-domains-offline:${scope}:`;
const cacheName = `${cachePrefix}v6`;
const page404 = new URL('404.html', scope).href;
const files = new Set([
    './', '404.html', 'data/subdomains.json', 'data/scripts.js',
    'assets/site.css', 'assets/site.js', 'assets/fonts/inter-latin.woff2',
    'assets/globe.png', 'media/desktop-computer.png',
    'favicon.ico', 'manifest.json'
].map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        await cache.addAll([...files].map(url => new Request(url, { cache: 'reload' })));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith(cachePrefix) && name !== cacheName)
            .map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

async function serve(event, cacheKey) {
    try {
        const response = await fetch(event.request);
        if (cacheKey && response.ok && !response.redirected) {
            const copy = response.clone();
            event.waitUntil(caches.open(cacheName).then(cache => cache.put(cacheKey, copy)).catch(() => {}));
        }
        return response;
    } catch {
        const cache = await caches.open(cacheName);
        if (cacheKey) return (await cache.match(cacheKey)) || Response.error();
        const missing = await cache.match(page404);
        return missing ? new Response(missing.body, {
            status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }) : Response.error();
    }
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    const path = url.origin + url.pathname;
    if (request.mode === 'navigate') {
        const home = path === scope || path === new URL('index.html', scope).href;
        event.respondWith(serve(event, home ? scope : files.has(path) ? path : null));
    } else if (files.has(path) || (request.destination === 'image' &&
        url.origin === 'https://img.shields.io' && url.pathname.startsWith('/github/'))) {
        event.respondWith(serve(event, files.has(path) ? path : request.url));
    }
});
