import { useEffect, useState } from "react";
import { getServices } from "../api/client";

const API_URL = "/api";


function Home() {

    const [text, setText] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answer, setAnswer] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [error, setError] = useState("");

    const [topics, setTopics] = useState([]);

    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [selectedTopicName, setSelectedTopicName] = useState("");

    const [timeLeft, setTimeLeft] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);
    const [nowTick, setNowTick] = useState(Date.now());

    const serviceId = localStorage.getItem("service_id");
    const userId = localStorage.getItem("user_id");

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


        loadTopics();

    }, [isAdmin]);


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


    return (

        <div className="container">

            <div
                style={{
                    textAlign: "center",
                    marginBottom: "24px"
                }}
            >

                <h1>
                    TestMaster
                </h1>


                <div className="user-service">
                    <span className="user-service-label">
                        Ваша служба
                    </span>

                    <span className="user-service-name">
                        {serviceName}
                    </span>
                </div>

            </div>


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

                                                return (
                                                    <button
                                                        key={topic.id}
                                                        onClick={() => {
                                                            if (topic.is_paid && !topic.has_access) {
                                                                buyTopic(topic);
                                                            } else {
                                                                chooseTopic(topic);
                                                            }
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "left"
                                                        }}
                                                    >

                                                        <div>
                                                            {topic.name}
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize: "13px",
                                                                opacity: 0.8,
                                                                marginTop: "4px"
                                                            }}
                                                        >
                                                            <span
                                                                className={
                                                                    topic.is_paid
                                                                        ? accessIsActive
                                                                            ? "topic-access topic-access--active"
                                                                            : "topic-access topic-access--expired"
                                                                        : ""
                                                                }
                                                            >
                                                                {topic.is_paid
                                                                    ? accessIsActive
                                                                        ? `Доступ активен · ${remainingLabel}`
                                                                        : `Доступ истёк · ${(Number(topic.price_kopecks || 0) / 100).toFixed(
                                                                            Number(topic.price_kopecks || 0) % 100 === 0 ? 0 : 2
                                                                        )} ₽ · Купить доступ на ${topic.access_minutes} мин.`
                                                                    : "Бесплатно · без ограничения времени"
                                                                }
                                                            </span>

                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    marginLeft: "10px",
                                                                    padding: "3px 8px",
                                                                    borderRadius: "6px",
                                                                    background: "#ecfdf3",
                                                                    color: "#15803d",
                                                                    fontWeight: "700"
                                                                }}
                                                            >
                                                                Ответов: {topic.question_count ?? 0}
                                                            </span>
                                                        </div>

                                                    </button>
                                                );
                                            })
                                        }

                                    </div>
                            }

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