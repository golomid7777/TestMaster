import { useEffect, useMemo, useState } from "react";

const API_URL = "/api";


function Admin() {

    const [services, setServices] = useState([]);
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [paymentSearch, setPaymentSearch] = useState("");
    const [newServiceName, setNewServiceName] = useState("");
    const [activeSection, setActiveSection] = useState("overview");

    const [serviceId, setServiceId] = useState("");
    const [topicName, setTopicName] = useState("");
    const [topicPriceRubles, setTopicPriceRubles] = useState(0);
    const [topicAccessMinutes, setTopicAccessMinutes] = useState(0);

    const [questionServiceId, setQuestionServiceId] = useState("");
    const [questionTopicId, setQuestionTopicId] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [answerText, setAnswerText] = useState("");
    const [keywords, setKeywords] = useState("");

    const [message, setMessage] = useState("");
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [questionFilterServiceId, setQuestionFilterServiceId] = useState("");
    const [questionFilterTopicId, setQuestionFilterTopicId] = useState("");
    const [questionSearch, setQuestionSearch] = useState("");
    const [importFile, setImportFile] = useState(null);
    const [importResult, setImportResult] = useState(null);
    useEffect(() => {
        loadServices();
        loadTopics();
        loadUsers();
        loadQuestions();
        loadPayments();
    }, []);


    const questionTopics = useMemo(() => {


        return topics.filter(
            topic =>
                String(topic.service_id) ===
                String(questionServiceId)
        );

    }, [topics, questionServiceId]);

    const filteredQuestions = questions.filter(question => {

        if (
            questionFilterServiceId &&
            String(question.service_id) !==
            String(questionFilterServiceId)
        ) {
            return false;
        }

        if (
            questionFilterTopicId &&
            String(question.topic_id) !==
            String(questionFilterTopicId)
        ) {
            return false;
        }

        const search = questionSearch
            .trim()
            .toLowerCase();

        if (search) {

            const questionText =
                (question.question || "").toLowerCase();

            const keywordsText =
                (question.keywords || "").toLowerCase();

            const answerText =
                (question.answer || "").toLowerCase();

            if (
                !questionText.includes(search) &&
                !keywordsText.includes(search) &&
                !answerText.includes(search)
            ) {
                return false;
            }
        }

        return true;
    });

    const filteredPayments = payments.filter(payment => {

        if (
            paymentStatusFilter !== "all" &&
            payment.status !== paymentStatusFilter
        ) {
            return false;
        }

        const search = paymentSearch
            .trim()
            .toLowerCase();

        if (search) {

            const haystack = [
                payment.user_name,
                payment.user_email,
                payment.topic_name,
                payment.yookassa_payment_id
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (!haystack.includes(search)) {
                return false;
            }
        }

        return true;
    });


    function authHeaders(json = false) {

        const token = localStorage.getItem("token");

        const headers = {
            Authorization: `Bearer ${token}`
        };

        if (json) {
            headers["Content-Type"] = "application/json";
        }

        return headers;
    }


    async function readError(response, fallback) {

        try {
            const data = await response.json();
            return data.detail || fallback;
        } catch {
            return fallback;
        }
    }


    async function loadServices() {

        try {

            const response = await fetch(
                `${API_URL}/admin/services`,
                {
                    headers: authHeaders()
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось загрузить службы"
                    )
                );
                return;
            }

            setServices(
                await response.json()
            );

        } catch {

            setMessage("Ошибка соединения с сервером");

        }
    }


    async function loadTopics() {

        try {

            const response = await fetch(
                `${API_URL}/admin/topics`,
                {
                    headers: authHeaders()
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось загрузить темы"
                    )
                );
                return;
            }

            setTopics(
                await response.json()
            );

        } catch {

            setMessage("Ошибка соединения с сервером");

        }
    }


    async function loadUsers() {

        try {

            const response = await fetch(
                `${API_URL}/admin/users`,
                {
                    headers: authHeaders()
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось загрузить пользователей"
                    )
                );
                return;
            }

            setUsers(
                await response.json()
            );

        } catch {

            setMessage("Ошибка соединения с сервером");

        }
    }

    async function loadPayments() {

        try {

            const response = await fetch(
                `${API_URL}/admin/payments`,
                {
                    headers: authHeaders()
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось загрузить платежи"
                    )
                );
                return;
            }

            setPayments(
                await response.json()
            );

        } catch {

            setMessage("Ошибка соединения с сервером");

        }
    }

    async function loadQuestions() {

        try {

            const response = await fetch(
                `${API_URL}/admin/questions`,
                {
                    headers: authHeaders()
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось загрузить вопросы"
                    )
                );
                return;
            }

            setQuestions(
                await response.json()
            );

        } catch {

            setMessage("Ошибка соединения с сервером");

        }
    }


    async function addService(e) {

        e.preventDefault();

        const name = newServiceName.trim();

        if (!name) {
            setMessage("Введите название службы");
            return;
        }

        const response = await fetch(
            `${API_URL}/admin/services`,
            {
                method: "POST",
                headers: authHeaders(true),

                body: JSON.stringify({
                    name: name
                })
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось добавить службу"
                )
            );

            return;
        }

        setNewServiceName("");
        setMessage("Служба добавлена");

        await loadServices();
    }


    async function deleteService(service) {

        const confirmed = window.confirm(
            `Удалить службу "${service.name}"?`
        );

        if (!confirmed) {
            return;
        }

        const response = await fetch(
            `${API_URL}/admin/services/${service.id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось удалить службу"
                )
            );

            return;
        }

        setMessage("Служба удалена");

        await loadServices();
        await loadTopics();
        await loadUsers();
        await loadQuestions();
    }

    function startEditTopic(topic) {

        setActiveSection("topics");
        setEditingTopicId(topic.id);
        setServiceId(String(topic.service_id));
        setTopicName(topic.name);
        setTopicPriceRubles(
            Number(topic.price_kopecks || 0) / 100
        );
        setTopicAccessMinutes(
            Number(topic.access_minutes || 0)
        );

        setMessage("Редактирование темы");
    }

    async function addTopic(e) {

        e.preventDefault();

        if (!serviceId) {
            setMessage("Выберите службу");
            return;
        }

        const name = topicName.trim();

        if (!name) {
            setMessage("Введите название темы");
            return;
        }

        const priceRubles = Number(topicPriceRubles);
        const accessMinutes = Number(topicAccessMinutes);

        if (!Number.isFinite(priceRubles) || priceRubles < 0) {
            setMessage("Цена темы не может быть отрицательной");
            return;
        }

        if (priceRubles > 0 && accessMinutes < 1) {
            setMessage("Для платной темы укажите срок доступа в минутах");
            return;
        }

        const priceKopecks = Math.round(priceRubles * 100);

        const url = editingTopicId
            ? `${API_URL}/admin/topics/${editingTopicId}`
            : `${API_URL}/admin/topics`;

        const method = editingTopicId
            ? "PUT"
            : "POST";

        const body = editingTopicId
            ? {
                name: name,
                time_limit_minutes: 30,
                price_kopecks: priceKopecks,
                access_minutes: priceKopecks > 0
                    ? accessMinutes
                    : 0
            }
            : {
                name: name,
                service_id: Number(serviceId),
                time_limit_minutes: 30,
                price_kopecks: priceKopecks,
                access_minutes: priceKopecks > 0
                    ? accessMinutes
                    : 0
            };

        const response = await fetch(
            url,
            {
                method: method,
                headers: authHeaders(true),
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось сохранить тему"
                )
            );

            return;
        }

        const wasEditing = Boolean(editingTopicId);

        setTopicName("");
        setTopicPriceRubles(0);
        setTopicAccessMinutes(0);
        setEditingTopicId(null);

        setMessage(
            wasEditing
                ? "Тема обновлена"
                : "Тема добавлена"
        );

        await loadTopics();

        if (!wasEditing) {
            const service = services.find(
                item => Number(item.id) === Number(serviceId)
            );

            const newTopic = {
                name: name,
                service_id: Number(serviceId),
                service_name: service?.name || "выбранной службы"
            };

            const confirmed = window.confirm(
                `Тема "${name}" добавлена.\n\nОтправить PUSH пользователям службы "${newTopic.service_name}"?`
            );

            if (confirmed) {
                await sendTopicPush(newTopic, false);
            }
        }
    }

    async function sendTopicPush(topic, askConfirm = true) {
        if (askConfirm) {
            const confirmed = window.confirm(
                `Отправить пользователям службы "${topic.service_name}" уведомление о теме "${topic.name}"?`
            );

            if (!confirmed) {
                return;
            }
        }

        try {
            setMessage("Отправляем PUSH...");

            const response = await fetch(
                `${API_URL}/push/notify-service/${topic.service_id}`,
                {
                    method: "POST",
                    headers: authHeaders(true),
                    body: JSON.stringify({
                        title: "Новая тема в TestMaster",
                        body: `Добавлена новая тема: ${topic.name}`,
                        url: "/"
                    })
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось отправить PUSH"
                    )
                );
                return;
            }

            const result = await response.json();

            setMessage(
                `PUSH отправлен: ${result.sent}, ошибок: ${result.failed}`
            );

        } catch (error) {
            console.error("Push error:", error);

            setMessage(
                "Ошибка соединения при отправке PUSH"
            );
        }
    }

    async function deleteTopic(topic) {

        const confirmed = window.confirm(
            `Удалить тему "${topic.name}"?`
        );

        if (!confirmed) {
            return;
        }

        const response = await fetch(
            `${API_URL}/admin/topics/${topic.id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось удалить тему"
                )
            );

            return;
        }

        setMessage("Тема удалена");

        await loadTopics();
        await loadQuestions();
    }

    function startEditQuestion(question) {

        setActiveSection("questions");
        setEditingQuestionId(question.id);

        setQuestionServiceId(
            String(question.service_id)
        );

        setQuestionTopicId(
            String(question.topic_id)
        );

        setQuestionText(question.question);
        setAnswerText(question.answer);
        setKeywords(question.keywords || "");

        setMessage("Редактирование вопроса");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function exportQuestions() {

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/questions/export`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                setMessage(
                    await readError(
                        response,
                        "Не удалось экспортировать вопросы"
                    )
                );
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "TestMaster_questions.xlsx";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setMessage("Вопросы экспортированы в Excel");

        } catch {
            setMessage("Ошибка соединения с сервером");
        }
    }


    async function importQuestions() {

        if (!importFile) {
            setMessage("Выберите Excel-файл");
            return;
        }

        if (!importFile.name.toLowerCase().endsWith(".xlsx")) {
            setMessage("Нужен файл формата .xlsx");
            return;
        }

        const formData = new FormData();

        formData.append(
            "file",
            importFile
        );

        try {

            const token = localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/admin/questions/import`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );


            const data = await response.json();

            if (!response.ok) {

                setMessage(
                    data.detail ||
                    "Ошибка импорта вопросов"
                );

                return;
            }

            setMessage(
                `Импорт завершён. Добавлено: ${data.imported}, пропущено: ${data.skipped_count}`
            );

            setImportResult(data);

            setImportFile(null);

            await loadQuestions();

        } catch {

            setMessage(
                "Ошибка соединения с сервером"
            );

        }
    }

    async function addQuestion(e) {

        e.preventDefault();

        if (!questionServiceId) {
            setMessage("Выберите службу для вопроса");
            return;
        }

        if (!questionTopicId) {
            setMessage("Выберите тему");
            return;
        }

        if (!questionText.trim()) {
            setMessage("Введите вопрос");
            return;
        }

        if (!answerText.trim()) {
            setMessage("Введите правильный ответ");
            return;
        }

        const url = editingQuestionId
            ? `${API_URL}/admin/questions/${editingQuestionId}`
            : `${API_URL}/admin/questions`;

        const method = editingQuestionId
            ? "PUT"
            : "POST";

        const response = await fetch(
            url,
            {
                method: method,
                headers: authHeaders(true),

                body: JSON.stringify({
                    service_id: Number(questionServiceId),
                    topic_id: Number(questionTopicId),
                    question: questionText.trim(),
                    answer: answerText.trim(),
                    keywords: keywords.trim() || null
                })
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось добавить вопрос"
                )
            );

            return;
        }

        setQuestionText("");
        setAnswerText("");
        setKeywords("");

        setEditingQuestionId(null);
        setMessage(
            editingQuestionId
                ? "Вопрос обновлён"
                : "Вопрос добавлен"
        );

        await loadQuestions();
    }


    async function deleteQuestion(question) {

        const confirmed = window.confirm(
            `Удалить вопрос "${question.question}"?`
        );

        if (!confirmed) {
            return;
        }

        const response = await fetch(
            `${API_URL}/admin/questions/${question.id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось удалить вопрос"
                )
            );

            return;
        }

        setMessage("Вопрос удалён");

        await loadQuestions();
    }


    async function changeUserService(userId, newServiceId) {

        const response = await fetch(
            `${API_URL}/admin/users/${userId}/service`,
            {
                method: "PUT",
                headers: authHeaders(true),

                body: JSON.stringify({
                    service_id: Number(newServiceId)
                })
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось изменить службу пользователя"
                )
            );

            return;
        }

        setMessage("Служба пользователя изменена");

        await loadUsers();
    }


    async function deleteUser(user) {

        const confirmed = window.confirm(
            `Удалить пользователя "${user.email}"?`
        );

        if (!confirmed) {
            return;
        }

        const response = await fetch(
            `${API_URL}/admin/users/${user.id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        if (!response.ok) {

            setMessage(
                await readError(
                    response,
                    "Не удалось удалить пользователя"
                )
            );

            return;
        }

        setMessage("Пользователь удалён");

        await loadUsers();
    }


    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <div className="admin-logo-mark">T</div>
                    <div>
                        <strong>TestMaster</strong>
                        <span>Админ-панель</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {[
                        ["overview", "Сводка"],
                        ["services", "Службы"],
                        ["topics", "Темы"],
                        ["questions", "Вопросы"],
                        ["users", "Пользователи"],
                        ["payments", "Платежи"]
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            className={activeSection === key ? "active" : ""}
                            onClick={() => {
                                setActiveSection(key);
                                setMessage("");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="admin-workspace">
                <header className="admin-topbar">
                    <div>
                        <div className="eyebrow admin-eyebrow">Управление системой</div>
                        <h1>
                            {{
                                overview: "Админ-панель",
                                services: "Службы",
                                topics: "Темы",
                                questions: "Вопросы",
                                users: "Пользователи",
                                payments: "Платежи"
                            }[activeSection]}
                        </h1>
                        <p>
                            {{
                                overview: "Сводная информация по TestMaster.",
                                services: "Управление службами пользователей.",
                                topics: "Настройка тем, стоимости, доступа и PUSH-уведомлений.",
                                questions: "Управление базой вопросов, ответов и Excel.",
                                users: "Управление пользователями и их службами.",
                                payments: "История и состояние платежей."
                            }[activeSection]}
                        </p>
                    </div>
                    <div className="admin-badge">Администратор</div>
                </header>

                {activeSection === "overview" && (
                <section className="stats-grid">
                    <div className="stat-card">
                        <span>Службы</span>
                        <strong>{services.length}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Темы</span>
                        <strong>{topics.length}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Вопросы</span>
                        <strong>{questions.length}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Пользователи</span>
                        <strong>{users.length}</strong>
                    </div>
                </section>
                )}

                {message && <div className="admin-message">{message}</div>}

                {activeSection === "services" && (
                <section className="admin-section" id="services">
                    <div className="section-heading">
                        <div><span className="section-kicker">Структура</span><h2>Службы</h2></div>
                    </div>
                    <form className="compact-form" onSubmit={addService}>
                        <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Название службы" />
                        <button type="submit">Добавить службу</button>
                    </form>
                    <div className="data-list">
                        {services.map(service => (
                            <div className="data-row" key={service.id}>
                                <div><strong>{service.name}</strong></div>
                                <button className="btn-danger" type="button" onClick={() => deleteService(service)}>Удалить</button>
                            </div>
                        ))}
                    </div>
                </section>
                )}

                {activeSection === "topics" && (
                <section className="admin-section" id="topics">
                    <div className="section-heading">
                        <div><span className="section-kicker">Настройка тестов</span><h2>Темы</h2></div>
                    </div>
                    <form className="topic-form" onSubmit={addTopic}>
                        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} disabled={Boolean(editingTopicId)}>
                            <option value="">Выберите службу</option>
                            {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                        </select>

                        <input
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            placeholder="Название темы"
                        />

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={topicPriceRubles}
                            onChange={(e) => setTopicPriceRubles(e.target.value)}
                            placeholder="Цена, ₽"
                            title="0 ₽ — тема бесплатная"
                        />

                        <input
                            type="number"
                            min="0"
                            value={topicAccessMinutes}
                            onChange={(e) => setTopicAccessMinutes(e.target.value)}
                            placeholder="Доступ, мин"
                            disabled={Number(topicPriceRubles) <= 0}
                            title="На сколько минут открывается тема после оплаты"
                        />

                        <button type="submit">
                            {editingTopicId ? "Сохранить" : "Добавить тему"}
                        </button>
                    </form>
                    <div className="data-list">
                        {topics.map(topic => (
                            <div className="data-row topic-row" key={topic.id}>
                                <div>
                                    <strong>{topic.name}</strong>
                                    <span>
                                        {topic.service_name} ·{" "}
                                        {Number(topic.price_kopecks || 0) > 0
                                            ? `${(Number(topic.price_kopecks) / 100).toFixed(
                                                Number(topic.price_kopecks) % 100 === 0 ? 0 : 2
                                            )} ₽ · доступ ${topic.access_minutes} мин.`
                                            : "бесплатно"
                                        }
                                    </span>
                                </div>
                                <div className="row-actions">

                                    <button
                                        className="btn-secondary"
                                        type="button"
                                        onClick={() => sendTopicPush(topic)}
                                    >
                                        Отправить PUSH
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        type="button"
                                        onClick={() => startEditTopic(topic)}
                                    >
                                        Редактировать
                                    </button>

                                    <button
                                        className="btn-danger"
                                        type="button"
                                        onClick={() => deleteTopic(topic)}
                                    >
                                        Удалить
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                )}

                {activeSection === "questions" && (
                <section className="admin-section" id="questions">
                    <div className="section-heading">
                        <div><span className="section-kicker">База знаний</span><h2>Вопросы</h2></div>
                        <div className="section-count">{filteredQuestions.length} из {questions.length}</div>
                    </div>

                    <div className="excel-panel">
                        <div>
                            <strong>Excel</strong>
                            <span>Массовый импорт и резервная копия базы вопросов</span>
                        </div>
                        <div className="excel-actions">
                            <a className="btn-secondary link-button" href="/templates/TestMaster_шаблон_импорта_вопросов.xlsx" download>Скачать шаблон</a>
                            <label className="file-control">
                                <span>{importFile ? importFile.name : "Выбрать .xlsx"}</span>
                                <input type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files[0] || null)} />
                            </label>
                            <button type="button" onClick={importQuestions}>Импортировать</button>
                            <button className="btn-secondary" type="button" onClick={exportQuestions}>Экспортировать</button>
                        </div>
                        {importResult && (
                            <div className="import-result">
                                <strong>Импорт завершён</strong>
                                <span>Добавлено: {importResult.imported}</span>
                                <span>Пропущено: {importResult.skipped_count}</span>
                                {importResult.skipped?.map((item, index) => (
                                    <small key={index}>Строка {item.row}: {item.reason}</small>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="subcard">
                        <h3>{editingQuestionId ? "Редактирование вопроса" : "Добавить вопрос"}</h3>
                        <form className="question-form" onSubmit={addQuestion}>
                            <div className="two-columns">
                                <select value={questionServiceId} onChange={(e) => { setQuestionServiceId(e.target.value); setQuestionTopicId(""); }}>
                                    <option value="">Выберите службу</option>
                                    {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                                </select>
                                <select value={questionTopicId} onChange={(e) => setQuestionTopicId(e.target.value)} disabled={!questionServiceId}>
                                    <option value="">Выберите тему</option>
                                    {questionTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                                </select>
                            </div>
                            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Текст вопроса" />
                            <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Правильный ответ" />
                            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ключевые слова через запятую" />
                            <button type="submit">{editingQuestionId ? "Сохранить изменения" : "Добавить вопрос"}</button>
                        </form>
                    </div>

                    <div className="filter-bar">
                        <input type="search" value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} placeholder="Поиск по вопросу, ответу или ключевым словам" />
                        <select value={questionFilterServiceId} onChange={(e) => { setQuestionFilterServiceId(e.target.value); setQuestionFilterTopicId(""); }}>
                            <option value="">Все службы</option>
                            {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                        </select>
                        <select value={questionFilterTopicId} onChange={(e) => setQuestionFilterTopicId(e.target.value)} disabled={!questionFilterServiceId}>
                            <option value="">Все темы</option>
                            {topics.filter(topic => !questionFilterServiceId || String(topic.service_id) === String(questionFilterServiceId)).map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                        </select>
                    </div>

                    <div className="question-list">
                        {questions.length === 0 ? <div className="empty-state">Вопросов пока нет</div> :
                            filteredQuestions.length === 0 ? <div className="empty-state">По выбранному фильтру вопросов нет</div> :
                                filteredQuestions.map(question => (
                                    <article className="question-card" key={question.id}>
                                        <div className="question-meta">{question.service_name} <span>→</span> {question.topic_name}</div>
                                        <h3>{question.question}</h3>
                                        <div className="answer-line"><span>Ответ</span><strong>{question.answer}</strong></div>
                                        {question.keywords && <div className="keywords">{question.keywords}</div>}
                                        <div className="row-actions">
                                            <button className="btn-secondary" type="button" onClick={() => startEditQuestion(question)}>Редактировать</button>
                                            <button className="btn-danger" type="button" onClick={() => deleteQuestion(question)}>Удалить</button>
                                        </div>
                                    </article>
                                ))}
                    </div>
                </section>
                )}

                {activeSection === "users" && (
                <section className="admin-section" id="users">
                    <div className="section-heading">
                        <div><span className="section-kicker">Доступ</span><h2>Пользователи</h2></div>
                    </div>
                    <div className="users-grid">
                        {users.map(user => (
                            <div className="user-card" key={user.id}>
                                <div className="user-avatar">{(user.name || user.email || "?").charAt(0).toUpperCase()}</div>
                                <div className="user-info">
                                    <strong>{user.name}</strong>
                                    <span>{user.email}</span>
                                </div>
                                {user.is_admin ? (
                                    <span className="role-badge">Администратор</span>
                                ) : (
                                    <div className="user-controls">
                                        <select value={user.service_id || ""} onChange={(e) => changeUserService(user.id, e.target.value)}>
                                            <option value="">Выберите службу</option>
                                            {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                                        </select>
                                        <button className="btn-danger" type="button" onClick={() => deleteUser(user)}>Удалить</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
                )}

                {activeSection === "payments" && (
                <section className="admin-section" id="payments">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">Финансы</span>
                            <h2>Платежи</h2>
                        </div>
                        <div className="section-count">
                            {filteredPayments.length} из {payments.length}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginBottom: "18px",
                            alignItems: "center"
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Поиск по пользователю, теме или ID..."
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                            style={{
                                flex: "1",
                                minWidth: "260px",
                                padding: "10px 12px"
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => setPaymentStatusFilter("all")}
                            disabled={paymentStatusFilter === "all"}
                        >
                            Все ({payments.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setPaymentStatusFilter("succeeded")}
                            disabled={paymentStatusFilter === "succeeded"}
                        >
                            Успешные ({payments.filter(p => p.status === "succeeded").length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setPaymentStatusFilter("pending")}
                            disabled={paymentStatusFilter === "pending"}
                        >
                            Ожидают ({payments.filter(p => p.status === "pending").length})
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "1000px"
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: "10px" }}>ID</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Пользователь</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Тема</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Сумма</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Статус</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Доступ</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Дата оплаты</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>ЮKassa ID</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                padding: "20px",
                                                textAlign: "center",
                                                color: "#64748b"
                                            }}
                                        >
                                            Платежей пока нет
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map(payment => (
                                        <tr
                                            key={payment.id}
                                            style={{
                                                borderTop: "1px solid #e2e8f0"
                                            }}
                                        >
                                            <td style={{ padding: "10px" }}>
                                                {payment.id}
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                <div style={{ fontWeight: "700" }}>
                                                    {payment.user_name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#64748b"
                                                    }}
                                                >
                                                    {payment.user_email}
                                                </div>
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                {payment.topic_name}
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                {(Number(payment.amount_kopecks || 0) / 100).toFixed(2)} ₽
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                <span
                                                    style={{
                                                        fontWeight: "700",
                                                        color:
                                                            payment.status === "succeeded"
                                                                ? "#15803d"
                                                                : payment.status === "pending"
                                                                    ? "#b45309"
                                                                    : "#b91c1c"
                                                    }}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                {payment.access_minutes} мин.
                                            </td>

                                            <td style={{ padding: "10px" }}>
                                                {payment.paid_at
                                                    ? new Date(payment.paid_at + "Z").toLocaleString("ru-RU")
                                                    : "—"}
                                            </td>

                                            <td
                                                style={{
                                                    padding: "10px",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                {payment.yookassa_payment_id || "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

            </main >
        </div >
    );
}

export default Admin;
