/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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

// Map tiles — cache first
registerRoute(
  ({ url }) => url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// Supabase API — network first
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 5 })],
    networkTimeoutSeconds: 5,
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
