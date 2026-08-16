import { useEffect, useMemo, useState } from "react";

const API_URL = "/api";


function Admin() {

    const [services, setServices] = useState([]);
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);

    const [newServiceName, setNewServiceName] = useState("");

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
                    "Не удалось добавить тему"
                )
            );

            return;
        }

        setTopicName("");
        setTopicPriceRubles(0);
        setTopicAccessMinutes(0);
        setEditingTopicId(null);

        setMessage(
            editingTopicId
                ? "Тема обновлена"
                : "Тема добавлена"
        );

        await loadTopics();
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
                    <a href="#overview">Сводка</a>
                    <a href="#services">Службы</a>
                    <a href="#topics">Темы</a>
                    <a href="#questions">Вопросы</a>
                    <a href="#users">Пользователи</a>
                </nav>
            </aside>

            <main className="admin-workspace">
                <header className="admin-topbar" id="overview">
                    <div>
                        <div className="eyebrow admin-eyebrow">Управление системой</div>
                        <h1>Админ-панель</h1>
                        <p>Управляйте структурой TestMaster и базой вопросов.</p>
                    </div>
                    <div className="admin-badge">Администратор</div>
                </header>

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

                {message && <div className="admin-message">{message}</div>}

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
                                    <button className="btn-secondary" type="button" onClick={() => startEditTopic(topic)}>Редактировать</button>
                                    <button className="btn-danger" type="button" onClick={() => deleteTopic(topic)}>Удалить</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
            </main>
        </div>
    );
}

export default Admin;
