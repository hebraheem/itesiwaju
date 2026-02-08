const CACHE_NAME = "itesiwaju-v1";
const urlsToCache = ["/", "/offline"];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match("/offline");
        });
      }),
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Itesiwaju Notification";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.url || "/",
    tag: data.tag || "notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement your sync logic here
  console.log("Background sync triggered");
}

// For member-specific actions:
//
//   await notifyUser(ctx, {
//     userId: memberId,
//     title: "Status Updated",
//     message: "Your status has been changed",
//     type: "member",
//     actionUrl: "/dashboard/profile"
//   });
//
// For event actions (notify all members):
//
// await notifyAllMembers(ctx, {
//   title: "New Event",
//   message: "A new event has been created",
//   type: "event",
//   actionUrl: `/dashboard/events/${eventId}`,
//   excludeUserId: creatorId
// });
