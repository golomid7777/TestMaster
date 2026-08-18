import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";


createRoot(
    document.getElementById("root")
).render(

    <StrictMode>

        <App />

    </StrictMode>

);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then(() => {
                console.log(
                    "TestMaster Service Worker зарегистрирован"
                );
            })
            .catch((error) => {
                console.error(
                    "Ошибка Service Worker:",
                    error
                );
            });
    });
}