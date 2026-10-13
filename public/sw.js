// Chapai Mango House — service worker for Web Push.
//
// Runs in its own thread, served from the site root at /sw.js. Two
// duties:
//   1. Receive push events from the Push API and surface them as
//      OS-level notifications.
//   2. When a user clicks a notification, open the URL we attached
//      to it (or focus an existing tab on that URL).

const DEFAULT_TITLE = "Chapai Mango House";
const DEFAULT_BODY = "নতুন আপডেট!";
const DEFAULT_URL = "/";

self.addEventListener("install", (event) => {
  // Take control of pages immediately on first install.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    // Non-JSON payload — fall back to text body.
    payload = { body: event.data ? event.data.text() : DEFAULT_BODY };
  }

  const title = payload.title || DEFAULT_TITLE;
  const options = {
    body: payload.body || DEFAULT_BODY,
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    image: payload.image,
    tag: payload.tag || "chapai-mango-broadcast",
    renotify: true,
    data: { url: payload.url || DEFAULT_URL }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || DEFAULT_URL;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Reuse an existing tab on the same origin if we can.
        for (const client of clientList) {
          if ("focus" in client) {
            try {
              const url = new URL(client.url);
              if (url.origin === self.location.origin) {
                client.navigate(targetUrl);
                return client.focus();
              }
            } catch (_) {
              /* ignore parse errors */
            }
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
