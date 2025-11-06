// Custom service worker for push notifications
self.addEventListener("push", function (event) {
  console.log("Push notification received", event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Parsed notification data:", data);

      // Generate unique tag to prevent Chrome from collapsing notifications
      const uniqueTag = data.tag
        ? `${data.tag}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : `notification-${Date.now()}`;

      const options = {
        body: data.body || "Nytt event publisert!",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [200, 100, 200],
        tag: uniqueTag,
        requireInteraction: false, // Allow auto-dismiss
        renotify: true, // Force notification even if tag exists
        data: {
          url: data.url || "/",
          eventId: data.eventId,
        },
      };

      console.log("About to show notification with options:", options);

      event.waitUntil(
        self.registration.showNotification(data.title || "Gather", options)
          .then((result) => {
            console.log("✅ Notification shown successfully!", result);
            console.log("Notification permission:", Notification.permission);
            return self.registration.getNotifications();
          })
          .then((notifications) => {
            console.log("Active notifications count:", notifications.length);
            console.log("Active notifications:", notifications);
          })
          .catch((error) => {
            console.error("❌ Failed to show notification:", error);
            console.error("Error details:", {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
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
