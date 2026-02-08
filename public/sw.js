const CACHE_NAME = "itesiwaju-v1";
const urlsToCache = ["/offline.html"];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()),
  );
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
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and other unsupported schemes
  const url = event.request.url;
  if (
    url.startsWith("chrome-extension://") ||
    url.startsWith("moz-extension://") ||
    url.startsWith("safari-extension://")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses from our origin
        if (response.status === 200 && url.startsWith(self.location.origin)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              // Silently ignore cache errors
              console.log("Cache put failed:", err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Try to get from cache first
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigation request and not in cache, show offline page
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          // For other requests, return a basic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
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
