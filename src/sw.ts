import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly, NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Ensure the SW gets the pre-cached assets injected during build
declare let self: ServiceWorkerGlobalScope;

const precacheManifest = self.__WB_MANIFEST || [];
precacheAndRoute(precacheManifest);

// Instead of caching HTML (which causes stale app shells), we force network-only for navigations.
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkOnly()
);

// Cache ONLY public educational catalog data from Supabase for offline fallback.
// Never cache sensitive endpoints (profiles, complaints, bookings, logs, achievements, etc.)
registerRoute(
  ({ url }) => {
    if (!url.origin.includes("supabase.co") || !url.pathname.startsWith("/rest/v1/")) {
      return false;
    }
    // Allowlist only public course catalog and lab datasets
    return /^\/rest\/v1\/(courses|modules|datasets)/.test(url.pathname);
  },
  new NetworkFirst({
    cacheName: "supabase-public-catalog",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
);

// Cache Google Fonts
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  }),
);

(self as any).addEventListener("install", (event: any) => {
  (self as any).skipWaiting();
});

(self as any).addEventListener("activate", (event: any) => {
  event.waitUntil((self as any).clients.claim());
});
