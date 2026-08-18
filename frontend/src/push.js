const API_URL = "/api";


function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat((4 - base64String.length % 4) % 4);

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}


export async function subscribeToPush() {

    if (!("serviceWorker" in navigator)) {
        throw new Error(
            "Service Worker не поддерживается"
        );
    }

    if (!("PushManager" in window)) {
        throw new Error(
            "PUSH-уведомления не поддерживаются"
        );
    }

    const permission =
        await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error(
            "азрешение на уведомления не предоставлено"
        );
    }


    const registration =
        await navigator.serviceWorker.ready;


    const keyResponse =
        await fetch(`${API_URL}/push/public-key`);

    if (!keyResponse.ok) {
        throw new Error(
            "е удалось получить PUSH-ключ"
        );
    }

    const keyData =
        await keyResponse.json();

    if (!keyData.public_key) {
        throw new Error(
            "PUSH-ключ не настроен"
        );
    }


    let subscription =
        await registration.pushManager.getSubscription();


    if (!subscription) {

        subscription =
            await registration.pushManager.subscribe({
                userVisibleOnly: true,

                applicationServerKey:
                    urlBase64ToUint8Array(
                        keyData.public_key
                    )
            });
    }


    const token =
        localStorage.getItem("token");

    if (!token) {
        throw new Error(
            "ользователь не авторизован"
        );
    }


    const response =
        await fetch(`${API_URL}/push/subscribe`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(
                subscription.toJSON()
            )
        });


    if (!response.ok) {

        let message =
            "е удалось сохранить PUSH-подписку";

        try {
            const data = await response.json();

            if (data.detail) {
                message = data.detail;
            }
        } catch {
        }

        throw new Error(message);
    }


    return await response.json();
}
