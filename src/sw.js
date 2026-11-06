import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Every in-app navigation gets the cached app shell, so the app opens offline.
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith(".png"),
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// A clock-out reminder (API ADR 0004), sent as Declarative Web Push: iOS 18.4+ shows it without this worker,
// everywhere else it's shown here. Chrome insists every push shows something, so a payload it can't read still does.
self.addEventListener("push", (event) => {
  let notification;
  try {
    notification = event.data?.json().notification;
  } catch {
    notification = undefined;
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notification?.title ?? "Checkin", {
        body: notification?.body,
        icon: "/icon-192.png",
        data: { url: notification?.navigate ?? "/" },
      }),
      // A reminder means a check-in is still open; the app clears the badge once it closes.
      self.navigator.setAppBadge?.(1).catch(() => {}),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) await open.focus();
      else await self.clients.openWindow(event.notification.data?.url ?? "/");
    })()
  );
});
