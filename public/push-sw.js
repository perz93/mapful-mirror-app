// Push Notification Service Worker
// This runs separately from the PWA service worker

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image || undefined,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    renotify: true,
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    (async () => {
      // Show notification
      await self.registration.showNotification(data.title || 'Mapful', options);

      // Update badge count
      const allNotifications = await self.registration.getNotifications();
      if ('setAppBadge' in self.navigator) {
        try {
          await self.navigator.setAppBadge(allNotifications.length + 1);
        } catch (e) {
          // Badge API not available in all contexts
        }
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      // Clear badge on click
      const remaining = await self.registration.getNotifications();
      if ('setAppBadge' in self.navigator) {
        try {
          if (remaining.length === 0) {
            await self.navigator.clearAppBadge();
          } else {
            await self.navigator.setAppBadge(remaining.length);
          }
        } catch (e) {}
      }

      // Navigate to the event page
      const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })()
  );
});

// Clear badge when all notifications are dismissed
self.addEventListener('notificationclose', (event) => {
  event.waitUntil(
    (async () => {
      const remaining = await self.registration.getNotifications();
      if ('setAppBadge' in self.navigator) {
        try {
          if (remaining.length === 0) {
            await self.navigator.clearAppBadge();
          } else {
            await self.navigator.setAppBadge(remaining.length);
          }
        } catch (e) {}
      }
    })()
  );
});
