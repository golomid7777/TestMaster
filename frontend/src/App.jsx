import { useState } from "react";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";



const API_URL = "/api";

function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (result.error) setError(result.error);
            else setMessage(result.message || "Ссылка для восстановления отправлена.");
        } catch {
            setError("Не удалось связаться с сервером.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="form-eyebrow">Восстановление пароля</div>
            <h2>{message ? "Проверьте почту" : "Забыли пароль?"}</h2>

            {message ? (
                <>
                    <p className="form-subtitle">{message}</p>
                    <button className="btn-primary btn-block" type="button" onClick={onBack}>
                        Вернуться ко входу
                    </button>
                </>
            ) : (
                <>
                    <p className="form-subtitle">Введите email, указанный при регистрации.</p>
                    <form className="register-form" onSubmit={submit}>
                        <label className="field-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            autoFocus
                        />
                        {error && <p className="message">{error}</p>}
                        <button className="btn-primary btn-block" type="submit" disabled={loading}>
                            {loading ? "Отправляем..." : "Отправить ссылку"}
                        </button>
                        <button className="forgot-password-link" type="button" onClick={onBack}>
                            ← Вернуться ко входу
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}


function ResetPassword({ token, onSuccess }) {
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setMessage("");

        if (password.length < 8) {
            setMessage("Пароль должен содержать не менее 8 символов");
            return;
        }

        if (password !== repeatPassword) {
            setMessage("Пароли не совпадают");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token,
                    new_password: password
                })
            });

            const result = await response.json();

            if (result.error) {
                setMessage(result.error);
                return;
            }

            onSuccess();

        } catch {
            setMessage("Не удалось связаться с сервером");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="form-eyebrow">Восстановление пароля</div>
            <h2>Создайте новый пароль</h2>
            <p className="form-subtitle">
                Придумайте новый пароль и повторите его ещё раз.
            </p>

            <form className="register-form" onSubmit={submit}>
                <label className="field-label">Новый пароль</label>

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Новый пароль"
                        minLength="8"
                        required
                    />

                    <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showPassword ? "◉" : "◎"}
                    </button>
                </div>

                <label className="field-label">Повторите пароль</label>

                <div className="password-field">
                    <input
                        type={showRepeatPassword ? "text" : "password"}
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        placeholder="Повторите пароль"
                        minLength="8"
                        required
                    />

                    <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        aria-label={showRepeatPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showRepeatPassword ? "◉" : "◎"}
                    </button>
                </div>

                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}

                <button
                    className="btn-primary btn-block"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Сохраняем..." : "Сохранить новый пароль"}
                </button>
            </form>
        </div>
    );
}

function InfoPage({ title, children, onBack }) {
    return (
        <div className="info-page">
            <div className="info-page__card">
                <button
                    className="btn-link info-page__back"
                    type="button"
                    onClick={onBack}
                >
                    ← Назад
                </button>

                <div className="form-eyebrow">TestMaster</div>
                <h1>{title}</h1>

                <div className="info-page__content">
                    {children}
                </div>
            </div>
        </div>
    );
}

function App() {

    const resetToken = new URLSearchParams(
        window.location.search
    ).get("reset_token");

    const [page, setPage] = useState(
        resetToken
            ? "reset-password"
            : localStorage.getItem("token")
                ? "home"
                : "login"
    );

    const [isAdmin, setIsAdmin] = useState(
        localStorage.getItem("is_admin") === "true"
    );


    function loginSuccess() {

        setIsAdmin(
            localStorage.getItem("is_admin") === "true"
        );

        setPage("home");
    }


    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("service_id");
        localStorage.removeItem("is_admin");

        setIsAdmin(false);
        setPage("login");
    }


    return (
        <div className="app-shell">
            {Boolean(localStorage.getItem("token")) && page === "home" && (
                <header className="site-header">
                    <div className="site-header__inner">
                        <button className="brand-button" type="button" onClick={() => setPage("home")}>
                            <span className="brand-mark">T</span>
                            <span className="brand-name">TestMaster</span>
                        </button>
                        <div className="header-actions">
                            {isAdmin && (
                                <button className="btn-ghost" type="button" onClick={() => setPage("admin")}>
                                    Админ-панель
                                </button>
                            )}
                            <button className="btn-secondary" type="button" onClick={logout}>Выйти</button>
                        </div>
                    </div>
                </header>
            )}

            <main className={`app-content app-content--${page}`}>
                {page === "login" && (
                    <div className="auth-layout">
                        <section className="auth-intro">
                            <div className="auth-brand"><span className="brand-mark brand-mark--large">T</span>TestMaster</div>
                            <h1>Нужный ответ.<br />Без лишнего поиска.</h1>
                            <p>Рабочий инструмент для быстрого поиска ответов по базе вашей службы.</p>
                            <div className="benefit-list">
                                <div><span>01</span><p><strong>Быстрый поиск</strong>Введите часть вопроса и выберите совпадение.</p></div>
                                <div><span>02</span><p><strong>Только ваши тесты</strong>Темы и вопросы привязаны к выбранной службе.</p></div>
                                <div><span>03</span><p><strong>Контроль времени</strong>Таймер теста всегда остаётся под контролем.</p></div>
                            </div>
                        </section>
                        <section className="auth-panel">
                            <Login onLogin={loginSuccess} onForgotPassword={() => setPage("forgot-password")} />
                            <div className="auth-switch">
                                <span>Нет аккаунта?</span>
                                <button className="btn-link" onClick={() => setPage("register")}>Зарегистрироваться</button>
                            </div>
                        </section>
                    </div>
                )}


                {page === "forgot-password" && (
                    <div className="auth-layout auth-layout--register">
                        <section className="auth-intro">
                            <div className="auth-brand"><span className="brand-mark brand-mark--large">T</span>TestMaster</div>
                            <h1>Восстановление доступа</h1>
                            <p>Укажите email своего аккаунта. TestMaster отправит ссылку для создания нового пароля.</p>
                            <div className="auth-note">Ссылка для восстановления действует 30 минут.</div>
                        </section>
                        <section className="auth-panel">
                            <ForgotPassword onBack={() => setPage("login")} />
                        </section>
                    </div>
                )}


                {page === "reset-password" && (
                    <div className="auth-layout auth-layout--register">
                        <section className="auth-intro">
                            <div className="auth-brand">
                                <span className="brand-mark brand-mark--large">T</span>
                                TestMaster
                            </div>

                            <h1>Новый пароль</h1>

                            <p>
                                Задайте новый пароль для своего аккаунта.
                                После сохранения войдите с ним в TestMaster.
                            </p>

                            <div className="auth-note">
                                Ссылка восстановления действует 30 минут и после смены пароля больше не используется.
                            </div>
                        </section>

                        <section className="auth-panel">
                            <ResetPassword
                                token={resetToken}
                                onSuccess={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user_id");
                                    localStorage.removeItem("service_id");
                                    localStorage.removeItem("is_admin");

                                    window.history.replaceState(
                                        {},
                                        "",
                                        window.location.pathname
                                    );

                                    setIsAdmin(false);
                                    setPage("login");
                                }}
                            />
                        </section>
                    </div>
                )}

                {page === "home" && <Home />}

                {page === "admin" && <Admin />}
                {page === "support" && (
                    <InfoPage
                        title="Поддержка"
                        onBack={() =>
                            setPage(localStorage.getItem("token") ? "home" : "login")
                        }
                    >
                        <p>
                            Если у вас возникли вопросы по работе TestMaster,
                            регистрации, доступу к темам или восстановлению аккаунта,
                            свяжитесь с поддержкой.
                        </p>

                        <h2>Электронная почта</h2>

                        <p>
                            <a href="mailto:golomid777@yandex.ru">
                                golomid777@yandex.ru
                            </a>
                        </p>

                        <p>
                            При обращении укажите email вашего аккаунта и кратко
                            опишите возникшую проблему.
                        </p>
                    </InfoPage>
                )}

                {page === "privacy" && (
                    <InfoPage
                        title="Политика конфиденциальности"
                        onBack={() =>
                            setPage(localStorage.getItem("token") ? "home" : "login")
                        }
                    >
                        <p>
                            TestMaster обрабатывает данные, необходимые для регистрации,
                            авторизации и предоставления пользователю доступа к функциям
                            сервиса.
                        </p>

                        <h2>Какие данные используются</h2>

                        <p>
                            При регистрации могут обрабатываться имя пользователя,
                            адрес электронной почты, выбранная служба и техническая
                            информация, необходимая для работы аккаунта.
                        </p>

                        <h2>Для чего используются данные</h2>

                        <p>
                            Данные используются для создания и защиты аккаунта,
                            восстановления доступа, предоставления доступных пользователю
                            тем и работы функций TestMaster.
                        </p>

                        <h2>Передача данных</h2>

                        <p>
                            Персональные данные не передаются третьим лицам без
                            необходимости, кроме случаев, связанных с исполнением
                            законодательства или работой подключённых сервисов,
                            необходимых для предоставления услуг.
                        </p>

                        <h2>Безопасность</h2>

                        <p>
                            TestMaster применяет технические меры для защиты пользовательских
                            данных и ограничения несанкционированного доступа к аккаунтам.
                        </p>

                        <h2>Связь</h2>

                        <p>
                            По вопросам обработки данных можно обратиться по адресу
                            {" "}
                            <a href="mailto:golomid777@yandex.ru">
                                golomid777@yandex.ru
                            </a>.
                        </p>
                    </InfoPage>
                )}

                {page === "terms" && (
                    <InfoPage
                        title="Пользовательское соглашение"
                        onBack={() =>
                            setPage(localStorage.getItem("token") ? "home" : "login")
                        }
                    >
                        <p>
                            Используя TestMaster, пользователь соглашается соблюдать
                            настоящее соглашение и использовать сервис только законным
                            способом.
                        </p>

                        <h2>Назначение сервиса</h2>

                        <p>
                            TestMaster предоставляет пользователю возможность поиска
                            информации и правильных ответов в доступной ему базе вопросов.
                        </p>

                        <h2>Аккаунт</h2>

                        <p>
                            Пользователь отвечает за сохранность данных своего аккаунта
                            и не должен передавать пароль посторонним лицам.
                        </p>

                        <h2>Доступ к материалам</h2>

                        <p>
                            Доступность тем определяется выбранной службой пользователя
                            и установленными для каждой темы условиями доступа.
                        </p>

                        <h2>Платные темы</h2>

                        <p>
                            Для отдельных тем может устанавливаться платный доступ.
                            Цена и продолжительность доступа отображаются пользователю
                            до совершения оплаты.
                        </p>

                        <h2>Изменения сервиса</h2>

                        <p>
                            Функциональность TestMaster, состав материалов и условия
                            предоставления отдельных функций могут обновляться.
                        </p>
                    </InfoPage>
                )}

                {page === "payment" && (
                    <InfoPage
                        title="Оплата и доступ"
                        onBack={() =>
                            setPage(localStorage.getItem("token") ? "home" : "login")
                        }
                    >
                        <p>
                            Некоторые темы TestMaster могут предоставляться на платной основе.
                        </p>

                        <h2>Стоимость</h2>

                        <p>
                            Стоимость доступа устанавливается отдельно для каждой темы
                            и отображается до перехода к оплате.
                        </p>

                        <h2>Срок доступа</h2>

                        <p>
                            Продолжительность доступа также устанавливается отдельно
                            для каждой темы и показывается пользователю до оплаты.
                        </p>

                        <h2>Начало доступа</h2>

                        <p>
                            Отсчёт оплаченного времени начинается только после того,
                            как платёжная система подтвердит успешную оплату.
                        </p>

                        <h2>Неуспешная оплата</h2>

                        <p>
                            Если платёж не был подтверждён платёжной системой,
                            платный доступ к теме не активируется.
                        </p>

                        <h2>Повторная оплата</h2>

                        <p>
                            TestMaster не выполняет автоматические регулярные списания,
                            если такая возможность отдельно не указана пользователю
                            перед оплатой.
                        </p>

                        <h2>Проблемы с доступом</h2>

                        <p>
                            Если оплата прошла, но доступ не появился, обратитесь
                            в поддержку и укажите email аккаунта и сведения о платеже.
                        </p>
                    </InfoPage>
                )}


                {page === "register" && (
                    <div className="auth-layout auth-layout--register">
                        <section className="auth-intro">
                            <div className="auth-brand"><span className="brand-mark brand-mark--large">T</span>TestMaster</div>
                            <h1>Создайте аккаунт</h1>
                            <p>Выберите свою службу — после входа TestMaster покажет только доступные вам темы и вопросы.</p>
                            <div className="auth-note">Аккаунт создаётся один раз. Службу позднее может изменить администратор.</div>
                        </section>
                        <section className="auth-panel">
                            <Register />
                            <div className="auth-switch">
                                <span>Уже зарегистрированы?</span>
                                <button className="btn-link" onClick={() => setPage("login")}>Войти</button>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {page !== "admin" && (
                <footer className="site-footer">
                    <div className="site-footer__inner">
                        <div><strong>TestMaster</strong><span>© 2026 TestMaster. Все права защищены.</span></div>
                        <div className="site-footer__links">
                            <button type="button" onClick={() => setPage("support")}>
                                Поддержка
                            </button>

                            <button type="button" onClick={() => setPage("privacy")}>
                                Политика конфиденциальности
                            </button>

                            <button type="button" onClick={() => setPage("terms")}>
                                Пользовательское соглашение
                            </button>

                            <button type="button" onClick={() => setPage("payment")}>
                                Оплата и доступ
                            </button>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default App;
