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

    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );

});