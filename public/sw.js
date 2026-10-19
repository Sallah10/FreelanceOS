// FreelanceOS does not use a service worker. This file only exists so stale
// registrations from older builds find it, unregister themselves, and stop
// throwing 404s in the console.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(
        self.registration.unregister().then(() => self.clients.matchAll())
    );
});
