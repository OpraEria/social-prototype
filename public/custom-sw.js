// Custom service worker for push notifications
self.addEventListener("push", function (event) {
  console.log("Push notification received", event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "Nytt event publisert!",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200],
      tag: data.tag || "event-notification",
      data: {
        url: data.url || "/",
        eventId: data.eventId,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Gather", options)
    );

    console.log("Push notification SHOWN");
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked", event);

  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});

// Background sync for offline support
self.addEventListener("sync", function (event) {
  if (event.tag === "sync-events") {
    event.waitUntil(syncEvents());
  }
});

async function syncEvents() {
  try {
    const cache = await caches.open("events-cache");
    const response = await fetch("/api/events");
    if (response.ok) {
      await cache.put("/api/events", response.clone());
    }
  } catch (error) {
    console.error("Failed to sync events:", error);
  }
}
