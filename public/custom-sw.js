// Custom service worker for push notifications
self.addEventListener("push", function (event) {
  console.log("Push notification received", event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Parsed notification data:", data);

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

      console.log("About to show notification with options:", options);

      event.waitUntil(
        self.registration.showNotification(data.title || "Gather", options)
          .then(() => {
            console.log("✅ Notification shown successfully!");
          })
          .catch((error) => {
            console.error("❌ Failed to show notification:", error);
          })
      );
    } catch (error) {
      console.error("❌ Error parsing push data:", error);
      console.log("Raw push data:", event.data.text());

      // Show a fallback notification
      event.waitUntil(
        self.registration.showNotification("Gather", {
          body: "Du har en ny notifikasjon",
          icon: "/icon-192x192.png",
        })
      );
    }
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
