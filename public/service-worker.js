// The Create React App build registered this file. Phones that still have it keep serving the old app from its
// cache, and the old app never registers the new /sw.js. This version takes over, removes itself and reloads the
// open windows, so they load the new app, which registers /sw.js. Keep it deployed until no phone can still have
// the old worker: a few months after the 2026-11 deploy.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.map((client) => client.navigate(client.url)));
    })()
  );
});
