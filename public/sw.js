const CACHE_NAME = "project-legacy-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", () => {
  return;
});

self.addEventListener("push", (event) => {
  let payload = {
    body: "Du har en ny oppdatering i Project Legacy.",
    tag: "project-legacy",
    title: "Project Legacy",
    url: "/",
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      badge: "/icons/icon-192.png",
      body: payload.body,
      data: {
        url: payload.url || "/",
      },
      icon: "/icons/icon-192.png",
      tag: payload.tag,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url === targetUrl.href);

      if (matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(targetUrl.href);
    })
  );
});
