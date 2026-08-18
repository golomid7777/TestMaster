const CACHE_NAME = "testmaster-v1";

const FILES_TO_CACHE = [
    "/",
    "/manifest.webmanifest",
    "/icon-192.png",
    "/icon-512.png"
];


self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    );

});


self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );

});


self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Локально Service Worker нужен только для проверки PUSH.
    // Запросы Vite не перехватываем.
    if (
        url.hostname === "127.0.0.1" ||
        url.hostname === "localhost"
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(async () => {
            const cached = await caches.match(event.request);

            if (cached) {
                return cached;
            }

            return new Response(
                "Offline",
                {
                    status: 503,
                    statusText: "Offline"
                }
            );
        })
    );
});


self.addEventListener("push", (event) => {

    let data = {
        title: "TestMaster",
        body: "В TestMaster появился новый тест.",
        url: "/"
    };

    if (event.data) {
        try {
            data = {
                ...data,
                ...event.data.json()
            };
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: {
            url: data.url || "/"
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || "TestMaster",
            options
        )
    );

});


self.addEventListener("notificationclick", (event) => {

    event.notification.close();

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {

            for (const client of clientList) {

                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );

});