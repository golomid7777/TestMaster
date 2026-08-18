import { useEffect, useState } from "react";
import { getServices } from "../api/client";
import { subscribeToPush } from "../push";

const API_URL = "/api";



function TopicIcon({ name }) {
    const normalized = (name || "").toLowerCase();

    const commonProps = {
        viewBox: "0 0 48 48",
        width: 46,
        height: 46,
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true"
    };

    if (normalized.includes("гостеприим")) {
        return (
            <svg {...commonProps} className="topic-icon-svg topic-icon-svg--hospitality">
                <path d="M12 33h24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M15 30c0-8 4-14 9-14s9 6 9 14H15Z" fill="currentColor" opacity=".9" />
                <path d="M24 12v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="24" cy="10" r="2.2" fill="currentColor" />
                <path d="M10 36h28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
        );
    }

    if (normalized === "озп" || normalized.includes("озп")) {
        return (
            <svg {...commonProps} className="topic-icon-svg topic-icon-svg--security">
                <path d="M24 8 34 12v8c0 8-4.8 14-10 18-5.2-4-10-10-10-18v-8L24 8Z" fill="currentColor" opacity=".95" />
                <path d="M14 16 7 14l4 6 5 2M34 16l7-2-4 6-5 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m24 15.5 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7 2.1-4.3Z" fill="#fff" />
            </svg>
        );
    }

    if (normalized.includes("сиз")) {
        return (
            <svg {...commonProps} className="topic-icon-svg topic-icon-svg--ppe">
                <path d="M7 11c6-1 11 1 17 5v23c-6-4-11-6-17-5V11Z" fill="currentColor" opacity=".16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M41 11c-6-1-11 1-17 5v23c6-4 11-6 17-5V11Z" fill="currentColor" opacity=".12" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M31 18 36 20v5c0 4-2.2 7-5 9-2.8-2-5-5-5-9v-5l5-2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
                <path d="m28.5 25 1.8 1.8 3.6-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (normalized.includes("опасн")) {
        return (
            <svg {...commonProps} className="topic-icon-svg topic-icon-svg--danger">
                <path d="M24 5 43 24 24 43 5 24 24 5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M24 13c2.5 5-1 6.5 1.5 10 1.7 2.4 4.8 3.5 4.8 7.3 0 4.2-2.8 7-6.3 7s-6.3-2.8-6.3-7c0-3.6 2.4-5.8 4.4-8.3.9 2.6 2.1 3.6 3.1 4.2-.3-4.5-3.1-6.9-1.2-13.2Z" fill="currentColor" />
            </svg>
        );
    }

    if (normalized.includes("живот")) {
        return (
            <svg {...commonProps} className="topic-icon-svg topic-icon-svg--animals">
                <path d="M29 9h9l5 3.2-4.5 2.1H31l-5.5 4.4h-3l3.2-5.4-3.2-4.8h3l3.5.5Z" fill="#169bd5" />
                <path d="M8.5 34c0-5.6 3.3-9.7 7.6-9.7s7.6 4.1 7.6 9.7v4H8.5v-4Z" fill="#3f6fa4" />
                <circle cx="16.1" cy="20.7" r="4.3" fill="#3f6fa4" />
                <path d="m12.8 18.2-2.2-3.5M19.4 18.2l2.2-3.5" stroke="#3f6fa4" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M25 35c0-4.3 2.7-7.3 6.1-7.3s6.1 3 6.1 7.3v3H25v-3Z" fill="#f2a516" />
                <circle cx="31.1" cy="24.5" r="3.4" fill="#f2a516" />
                <path d="m28.5 22.2-1.3-3.3M33.7 22.2l1.3-3.3" stroke="#f2a516" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg {...commonProps} className="topic-icon-svg topic-icon-svg--airport">
            <path d="M8 37h14M11 37V20h9v17M13 20l2-8h3l2 8M14 25h5M14 30h5" stroke="#2774b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 13h11l5 3-5 2h-8l-5 4h-3l3-5-3-5h3l2 1Z" fill="#169bd5" />
            <path d="M27 37h13V27H27v10Z" fill="#78b8d8" stroke="#2774b8" strokeWidth="2" strokeLinejoin="round" />
            <path d="M24 37h19" stroke="#2774b8" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16.5" cy="10" r="1.5" fill="#f5a623" />
        </svg>
    );
}

function Home() {

    const [text, setText] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answer, setAnswer] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [error, setError] = useState("");
    const [paymentReturn, setPaymentReturn] = useState(false);
    const [topics, setTopics] = useState([]);

    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [selectedTopicName, setSelectedTopicName] = useState("");

    const [timeLeft, setTimeLeft] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);
    const [nowTick, setNowTick] = useState(Date.now());

    const serviceId = localStorage.getItem("service_id");
    const userId = localStorage.getItem("user_id");

    const [pushStatus, setPushStatus] = useState("");
    const [screenProtected, setScreenProtected] = useState(false);

    const isAdmin =
        localStorage.getItem("is_admin") === "true";

    const [serviceName, setServiceName] = useState(
        isAdmin ? "Администратор" : "Загрузка..."
    );



    function formatTime(seconds) {

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;


        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    }


    useEffect(() => {

        async function loadServiceName() {

            if (isAdmin) {
                setServiceName("Администратор");
                return;
            }

            try {

                const services = await getServices();

                const service = services.find(
                    item =>
                        String(item.id) === String(serviceId)
                );

                setServiceName(
                    service
                        ? service.name
                        : "Служба не определена"
                );

            } catch {

                setServiceName(
                    "Служба не определена"
                );

            }
        }


        loadServiceName();

    }, [serviceId, isAdmin]);


    useEffect(() => {

        async function loadTopics() {

            if (isAdmin) {
                return;
            }

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/questions/topics`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Ошибка загрузки тем");
                }

                const data = await response.json();

                setTopics(data);


                // Восстанавливаем выбранную тему после F5

                const savedTopicId =
                    localStorage.getItem("selected_topic_id");

                if (savedTopicId) {

                    const savedTopic = data.find(
                        topic =>
                            String(topic.id) ===
                            String(savedTopicId)
                    );

                    if (
                        savedTopic &&
                        (
                            !savedTopic.is_paid ||
                            savedTopic.has_access
                        )
                    ) {

                        setSelectedTopicId(savedTopic.id);
                        setSelectedTopicName(savedTopic.name);

                    } else {

                        localStorage.removeItem(
                            "selected_topic_id"
                        );

                        localStorage.removeItem(
                            "selected_topic_name"
                        );

                    }
                }

            } catch (err) {

                setError(err.message);

            }
        }


        const params = new URLSearchParams(window.location.search);
        const returnedFromPayment =
            params.get("payment") === "return";

        loadTopics();

        if (returnedFromPayment) {

            setPaymentReturn(true);

            const retry1 = setTimeout(loadTopics, 1500);
            const retry2 = setTimeout(loadTopics, 3000);
            const retry3 = setTimeout(loadTopics, 5000);

            window.history.replaceState(
                {},
                "",
                window.location.pathname
            );


            return () => {
                clearTimeout(retry1);
                clearTimeout(retry2);
                clearTimeout(retry3);
            };
        }

    }, [isAdmin]);

    useEffect(() => {
        if (!paymentReturn) {
            return;
        }

        const timer = setTimeout(() => {
            setPaymentReturn(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [paymentReturn]);

    useEffect(() => {

        if (!selectedTopicId) {
            return;
        }

        const selectedTopic = topics.find(
            topic => String(topic.id) === String(selectedTopicId)
        );

        if (!selectedTopic || !selectedTopic.is_paid) {
            setTimeLeft(0);
            setTimerExpired(false);
            return;
        }

        const expiresAt = selectedTopic.access_expires_at;

        if (!expiresAt) {
            setTimeLeft(0);
            setTimerExpired(true);
            return;
        }

        function updateTimer() {

            const endTime = new Date(expiresAt + "Z").getTime();

            const remaining = Math.max(
                0,
                Math.floor((endTime - Date.now()) / 1000)
            );

            setTimeLeft(remaining);

            if (remaining <= 0) {
                setTimerExpired(true);
            } else {
                setTimerExpired(false);
            }
        }

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);

    }, [selectedTopicId, topics]);

    async function buyTopic(topic) {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/payments/create/${topic.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Не удалось создать платёж"
                );
            }

            if (!data.confirmation_url) {
                throw new Error(
                    "ЮKassa не вернула ссылку на оплату"
                );
            }

            window.location.href = data.confirmation_url;

        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setNowTick(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function chooseTopic(topic) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/questions/topics/${topic.id}/start`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                let message = "Не удалось открыть тему";

                try {
                    const errorData = await response.json();

                    if (response.status === 402) {
                        message = "Для этой темы требуется оплата";
                    } else if (typeof errorData.detail === "string") {
                        message = errorData.detail;
                    }
                } catch {
                    // Оставляем стандартное сообщение.
                }

                throw new Error(message);
            }

            const data = await response.json();

            localStorage.setItem(
                "selected_topic_id",
                String(topic.id)
            );

            localStorage.setItem(
                "selected_topic_name",
                topic.name
            );

            setSelectedTopicId(topic.id);
            setSelectedTopicName(topic.name);

            if (data.expires_at) {
                const endTime =
                    new Date(data.expires_at + "Z").getTime();

                setTimeLeft(
                    Math.max(
                        0,
                        Math.floor(
                            (endTime - Date.now()) / 1000
                        )
                    )
                );
            } else {
                // Бесплатная тема — без таймера.
                setTimeLeft(0);
            }

            setTimerExpired(false);

            setText("");
            setQuestions([]);
            setAnswer("");
            setSelectedQuestion("");
            setError("");

        } catch (err) {

            setError(err.message);

        }
    }


    function changeTopic() {

        localStorage.removeItem(
            "selected_topic_id"
        );

        localStorage.removeItem(
            "selected_topic_name"
        );


        setSelectedTopicId("");
        setSelectedTopicName("");

        setTimeLeft(0);
        setTimerExpired(false);

        setText("");
        setQuestions([]);
        setAnswer("");
        setSelectedQuestion("");
        setError("");
    }


    async function search(e) {

        const value = e.target.value;

        setText(value);
        setAnswer("");
        setSelectedQuestion("");
        setError("");


        if (timerExpired) {

            setQuestions([]);

            setError(
                "Срок доступа к теме истёк"
            );

            return;
        }


        if (value.length < 2) {

            setQuestions([]);

            return;
        }


        if (!selectedTopicId) {

            setError(
                "Сначала выберите тему"
            );

            return;
        }


        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/questions/suggest?q=${encodeURIComponent(value)}&topic_id=${selectedTopicId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Ошибка поиска"
                );

            }


            const data =
                await response.json();


            if (timerExpired) {
                return;
            }


            setQuestions(data);


        } catch (err) {

            setError(err.message);

        }
    }


    async function getAnswer(id, question) {

        if (timerExpired) {

            setError(
                "Срок доступа к теме истёк"
            );

            return;
        }


        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/questions/${id}?topic_id=${selectedTopicId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Ошибка получения ответа"
                );

            }


            const data =
                await response.json();


            if (timerExpired) {
                return;
            }


            setSelectedQuestion(question);
            setAnswer(data.answer);
            setQuestions([]);


        } catch (err) {

            setError(err.message);

        }
    }


    function resetSearch() {

        if (timerExpired) {
            return;
        }

        setText("");
        setQuestions([]);
        setAnswer("");
        setSelectedQuestion("");
        setError("");
    }


    useEffect(() => {
        const testIsOpen =
            Boolean(selectedTopicId) &&
            !timerExpired &&
            !isAdmin;

        if (!testIsOpen) {
            setScreenProtected(false);
            return;
        }

        const blockEvent = (event) => {
            event.preventDefault();
        };

        const blockCopyShortcut = (event) => {
            const key = event.key.toLowerCase();

            if (
                (event.ctrlKey || event.metaKey) &&
                ["c", "x", "a", "p", "s"].includes(key)
            ) {
                event.preventDefault();
            }

            if (event.key === "PrintScreen") {
                event.preventDefault();
                setScreenProtected(true);
            }
        };

        const handleVisibility = () => {
            if (document.hidden) {
                setScreenProtected(true);
                setAnswer("");
                setSelectedQuestion("");
                setQuestions([]);
            }
        };

        const handleBlur = () => {
            setScreenProtected(true);
            setAnswer("");
            setSelectedQuestion("");
            setQuestions([]);
        };

        document.addEventListener("copy", blockEvent);
        document.addEventListener("cut", blockEvent);
        document.addEventListener("contextmenu", blockEvent);
        document.addEventListener("selectstart", blockEvent);
        document.addEventListener("keydown", blockCopyShortcut);
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("copy", blockEvent);
            document.removeEventListener("cut", blockEvent);
            document.removeEventListener("contextmenu", blockEvent);
            document.removeEventListener("selectstart", blockEvent);
            document.removeEventListener("keydown", blockCopyShortcut);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
        };
    }, [selectedTopicId, timerExpired, isAdmin]);


    async function enablePush() {
        try {
            setPushStatus("Подключаем уведомления...");

            await subscribeToPush();

            setPushStatus("Уведомления включены");
        } catch (err) {
            setPushStatus(
                err.message || "Не удалось включить уведомления"
            );
        }
    }

    return (

        <div
            className={`container ${selectedTopicId && !isAdmin ? "test-protected" : ""}`}
            onDragStart={(e) => {
                if (selectedTopicId && !isAdmin) {
                    e.preventDefault();
                }
            }}
        >

            {screenProtected && selectedTopicId && !isAdmin && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px"
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "440px",
                            textAlign: "center",
                            padding: "28px",
                            border: "1px solid #dbe3ea",
                            borderRadius: "18px",
                            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)"
                        }}
                    >
                        <div
                            style={{
                                fontSize: "22px",
                                fontWeight: "800",
                                marginBottom: "10px"
                            }}
                        >
                            Защищённый режим
                        </div>

                        <div
                            style={{
                                color: "#64748b",
                                lineHeight: "1.5",
                                marginBottom: "20px"
                            }}
                        >
                            Содержимое теста скрыто после переключения окна или вкладки.
                        </div>

                        <button
                            type="button"
                            onClick={() => setScreenProtected(false)}
                        >
                            Продолжить тест
                        </button>
                    </div>
                </div>
            )}

            <section className="home-hero">
                <div className="home-hero__photo" aria-hidden="true" />

                <div className="home-hero__content">
                    <div className="home-hero__brand">TestMaster</div>

                    <div className="home-hero__subtitle">
                        Быстрый поиск правильных ответов
                    </div>

                    <div className="home-hero__service">
                        <span>Ваша служба</span>
                        <strong>{serviceName}</strong>
                    </div>
                </div>

                <div className="home-hero__features">
                    <div className="home-hero__feature">
                        <span className="home-hero__feature-icon">⚡</span>
                        <span><strong>Мгновенный поиск</strong><small>по ключевым словам</small></span>
                    </div>
                    <div className="home-hero__feature">
                        <span className="home-hero__feature-icon">◎</span>
                        <span><strong>Точные ответы</strong><small>только по теме</small></span>
                    </div>
                    <div className="home-hero__feature">
                        <span className="home-hero__feature-icon">✓</span>
                        <span><strong>Актуальные данные</strong><small>обновляются регулярно</small></span>
                    </div>
                    <div className="home-hero__feature">
                        <span className="home-hero__feature-icon">◷</span>
                        <span><strong>Экономия времени</strong><small>готовьтесь эффективнее</small></span>
                    </div>
                </div>
            </section>

            {!isAdmin && (
                <div className="push-notification-block">
                    <button
                        type="button"
                        className="push-enable-button"
                        onClick={enablePush}
                    >
                        <span className="push-enable-button__bell" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
                                    stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 21h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span>Включить уведомления</span>
                    </button>

                    {pushStatus && (
                        <div className={pushStatus === "Уведомления включены"
                            ? "push-status push-status--success"
                            : "push-status"}>
                            {pushStatus === "Уведомления включены" && (
                                <span className="push-success-icon">✓</span>
                            )}
                            {pushStatus}
                        </div>
                    )}
                </div>
            )}

            {paymentReturn && (
                <div className="payment-success">
                    ✓ Оплата прошла успешно. Доступ активирован.
                </div>
            )}

            {
                isAdmin
                    ?

                    <div
                        style={{
                            textAlign: "center"
                        }}
                    >

                        <p>
                            Используйте админ-панель
                            для управления службами,
                            темами и вопросами.
                        </p>

                    </div>

                    :

                    !selectedTopicId
                        ?

                        <>

                            <h2>
                                Выберите тему теста
                            </h2>


                            {
                                topics.length === 0
                                    ?

                                    <p
                                        style={{
                                            textAlign: "center"
                                        }}
                                    >
                                        Для вашей службы пока нет тем
                                    </p>

                                    :

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}
                                    >

                                        {
                                            topics.map(topic => {

                                                const expiresAt = topic.access_expires_at
                                                    ? new Date(topic.access_expires_at + "Z").getTime()
                                                    : null;

                                                const remainingMs = expiresAt
                                                    ? Math.max(0, expiresAt - nowTick)
                                                    : 0;

                                                const remainingMinutes = Math.floor(
                                                    remainingMs / 60000
                                                );

                                                const remainingSeconds = Math.floor(
                                                    (remainingMs % 60000) / 1000
                                                );

                                                const remainingLabel =
                                                    `${String(remainingMinutes).padStart(2, "0")}:` +
                                                    `${String(remainingSeconds).padStart(2, "0")}`;

                                                const accessIsActive =
                                                    topic.has_access &&
                                                    remainingMs > 0;

                                                const priceRubles =
                                                    Number(topic.price_kopecks || 0) / 100;

                                                const priceLabel =
                                                    priceRubles.toFixed(
                                                        Number(topic.price_kopecks || 0) % 100 === 0 ? 0 : 2
                                                    );

                                                const openTopic = () => {
                                                    if (topic.is_paid && !topic.has_access) {
                                                        buyTopic(topic);
                                                    } else {
                                                        chooseTopic(topic);
                                                    }
                                                };

                                                return (
                                                    <article
                                                        className={`topic-card ${accessIsActive ? "topic-card--active" : ""}`}
                                                        key={topic.id}
                                                    >
                                                        <div
                                                            className={`topic-card__icon ${
                                                                (topic.name || "").toLowerCase().includes("гостеприим")
                                                                    ? "topic-card__icon--hospitality"
                                                                    : (topic.name || "").toLowerCase().includes("озп")
                                                                        ? "topic-card__icon--security"
                                                                        : (topic.name || "").toLowerCase().includes("сиз")
                                                                            ? "topic-card__icon--ppe"
                                                                            : (topic.name || "").toLowerCase().includes("опасн")
                                                                                ? "topic-card__icon--danger"
                                                                                : (topic.name || "").toLowerCase().includes("живот")
                                                                                    ? "topic-card__icon--animals"
                                                                                    : "topic-card__icon--airport"
                                                            }`}
                                                        >
                                                            <TopicIcon name={topic.name} />
                                                        </div>

                                                        <div className="topic-card__content">
                                                            <div className="topic-card__title">
                                                                {topic.name}
                                                            </div>

                                                            <div className="topic-card__meta">
                                                                <span
                                                                    className={
                                                                        topic.is_paid
                                                                            ? accessIsActive
                                                                                ? "topic-access topic-access--active"
                                                                                : "topic-access topic-access--idle"
                                                                            : "topic-access topic-access--free"
                                                                    }
                                                                >
                                                                    {topic.is_paid
                                                                        ? accessIsActive
                                                                            ? `Доступ активен · ${remainingLabel}`
                                                                            : `Не активировано · ${priceLabel} ₽ · ${topic.access_minutes} мин.`
                                                                        : "Бесплатно · без ограничения времени"
                                                                    }
                                                                </span>

                                                                <span className="topic-answer-count">
                                                                    Ответов: {topic.question_count ?? 0}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="topic-card__action">
                                                            {topic.is_paid && accessIsActive ? (
                                                                <button
                                                                    type="button"
                                                                    className="topic-start-button topic-start-button--active"
                                                                    onClick={openTopic}
                                                                >
                                                                    Продолжить тест
                                                                </button>
                                                            ) : topic.is_paid ? (
                                                                <button
                                                                    type="button"
                                                                    className="topic-start-button"
                                                                    onClick={openTopic}
                                                                >
                                                                    Купить доступ
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="topic-start-button"
                                                                    onClick={openTopic}
                                                                >
                                                                    Начать тест
                                                                </button>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            })
                                        }

                                    </div>
                            }

                            <div className="topics-info-panel">
                                <div className="topics-info-panel__content">
                                    <div className="topics-info-panel__icon">i</div>
                                    <div>
                                        <strong>Важно знать</strong>
                                        <p>
                                            Время доступа к платным темам начинает отсчитываться
                                            после активации теста.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="airport-photo"
                                    aria-hidden="true"
                                />
                            </div>

                        </>

                        :

                        <>

                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "20px"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "14px",
                                        color: "#64748b",
                                        marginBottom: "6px"
                                    }}
                                >
                                    Тема
                                </div>


                                <div
                                    style={{
                                        fontWeight: "700",
                                        fontSize: "18px"
                                    }}
                                >
                                    {selectedTopicName}
                                </div>


                                {
                                    topics.find(
                                        topic => String(topic.id) === String(selectedTopicId)
                                    )?.is_paid
                                        ? <>
                                            <div
                                                style={{
                                                    marginTop: "14px",
                                                    fontSize: "26px",
                                                    fontWeight: "800",
                                                    color:
                                                        timerExpired
                                                            ? "#dc2626"
                                                            : "#2563eb"
                                                }}
                                            >
                                                {timerExpired ? "00:00" : formatTime(timeLeft)}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#64748b",
                                                    marginTop: "4px"
                                                }}
                                            >
                                                Осталось оплаченного времени
                                            </div>
                                        </>
                                        : <div
                                            style={{
                                                marginTop: "12px",
                                                fontSize: "14px",
                                                color: "#15803d",
                                                fontWeight: "700"
                                            }}
                                        >
                                            Бесплатный доступ · без таймера
                                        </div>
                                }


                                <button
                                    className="change-topic-button"
                                    onClick={changeTopic}
                                >
                                    Выбрать другую тему
                                </button>

                            </div>


                            {
                                timerExpired
                                    ?

                                    <div
                                        style={{
                                            marginTop: "20px",
                                            padding: "20px",
                                            background: "#fef2f2",
                                            border: "2px solid #dc2626",
                                            borderRadius: "14px",
                                            textAlign: "center"
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize: "22px",
                                                fontWeight: "700",
                                                color: "#dc2626",
                                                marginBottom: "8px"
                                            }}
                                        >
                                            Срок доступа истёк
                                        </div>


                                        <div>
                                            Оплаченное время доступа к этой теме закончилось.
                                        </div>

                                    </div>

                                    :

                                    <>

                                        <div className="question-search-section">
                                            <h2>Найдите вопрос</h2>
                                            <p className="question-search-hint">
                                                Введите несколько слов из вопроса
                                            </p>

                                            <input
                                                className="question-search-input"
                                                value={text}
                                                onChange={search}
                                                placeholder="Введите часть вопроса..."
                                                autoComplete="off"
                                            />
                                        </div>


                                        {
                                            error &&

                                            <p
                                                style={{
                                                    color: "#dc2626",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {error}
                                            </p>
                                        }


                                        {
                                            questions.length > 0 &&

                                            <div
                                                style={{
                                                    marginTop: "14px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "8px"
                                                }}
                                            >

                                                {
                                                    questions.map(q => (

                                                        <button
                                                            className="question-result-button"
                                                            key={q.id}
                                                            onClick={() =>
                                                                getAnswer(
                                                                    q.id,
                                                                    q.question
                                                                )
                                                            }
                                                        >
                                                            <span>{q.question}</span>
                                                            <span className="question-result-arrow">›</span>
                                                        </button>

                                                    ))
                                                }

                                            </div>
                                        }


                                        {
                                            answer &&

                                            <div
                                                style={{
                                                    marginTop: "24px",
                                                    padding: "20px",
                                                    border: "2px solid #16a34a",
                                                    borderRadius: "14px",
                                                    background: "#f0fdf4"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "700",
                                                        color: "#166534",
                                                        marginBottom: "8px"
                                                    }}
                                                >
                                                    ВОПРОС
                                                </div>


                                                <div
                                                    style={{
                                                        fontSize: "18px",
                                                        lineHeight: "1.4",
                                                        marginBottom: "20px"
                                                    }}
                                                >
                                                    {selectedQuestion}
                                                </div>


                                                <div
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "700",
                                                        color: "#166534",
                                                        marginBottom: "8px"
                                                    }}
                                                >
                                                    ✓ ПРАВИЛЬНЫЙ ОТВЕТ
                                                </div>


                                                <div
                                                    style={{
                                                        fontSize: "26px",
                                                        fontWeight: "700",
                                                        marginBottom: "20px"
                                                    }}
                                                >
                                                    {answer}
                                                </div>


                                                <button
                                                    className="new-search-button"
                                                    onClick={resetSearch}
                                                >
                                                    Новый поиск
                                                </button>

                                            </div>
                                        }

                                    </>
                            }

                        </>
            }

        </div>

    );
}


export default Home;