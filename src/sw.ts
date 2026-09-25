import { precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Ensure the SW gets the pre-cached assets injected during build
declare let self: ServiceWorkerGlobalScope;

const precacheManifest = self.__WB_MANIFEST || [];
precacheAndRoute(precacheManifest);

// Handle offline fallback navigation for SPA routing
// Instead of an index.html file, we use a NetworkFirst strategy for document navigations
// If the network fails, we can fall back to the offline layout or root page if cached.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
  })
);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
  })
);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
