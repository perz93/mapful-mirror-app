/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Workbox standard setup
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();
self.skipWaiting();

// SPA navigation fallback — serve index.html for all navigation requests
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/~oauth/],
});
registerRoute(navigationRoute);

// ============================================
// Runtime caching
// ============================================

// Map tiles — cache first (30 days)
registerRoute(
  ({ url }) => url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Unsplash images — cache first (7 days, up to 200 images)
registerRoute(
  ({ url }) => url.hostname.includes('images.unsplash.com'),
  new CacheFirst({
    cacheName: 'unsplash-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Supabase Storage images — cache first (7 days)
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && (url.pathname.includes('/storage/') || url.pathname.includes('/object/')),
  new CacheFirst({
    cacheName: 'supabase-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Any other external images (generic image cache)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Supabase API — stale-while-revalidate (serve cached then update in background)
// Much better for 4G: user sees data instantly, fresh data loads silently
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/'),
  new StaleWhileRevalidate({
    cacheName: 'supabase-api',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 30 }), // 30min cache
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Google Fonts — cache first
registerRoute(
  ({ url }) => url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com'),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ============================================
// Push notifications (merged from push-sw.js)
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image || undefined,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    renotify: true,
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title || 'VIBE', options);
      const allNotifications = await self.registration.getNotifications();
      if ('setAppBadge' in navigator) {
        try { await (navigator as any).setAppBadge(allNotifications.length + 1); } catch {}
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const remaining = await self.registration.getNotifications();
      if ('setAppBadge' in navigator) {
        try {
          if (remaining.length === 0) await (navigator as any).clearAppBadge();
          else await (navigator as any).setAppBadge(remaining.length);
        } catch {}
      }
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          (client as WindowClient).navigate(url);
          return (client as WindowClient).focus();
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(
    (async () => {
      const remaining = await self.registration.getNotifications();
      if ('setAppBadge' in navigator) {
        try {
          if (remaining.length === 0) await (navigator as any).clearAppBadge();
          else await (navigator as any).setAppBadge(remaining.length);
        } catch {}
      }
    })()
  );
});
