import { useState } from "react";

import {
    loginUser
} from "../api/client";


function Login({ onLogin, onForgotPassword }) {

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    function change(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }


    async function submit(e) {

        e.preventDefault();

        const result = await loginUser(form);


        if (result.token) {

            localStorage.setItem(
                "token",
                result.token
            );

            localStorage.setItem(
                "service_id",
                result.service_id
            );

            localStorage.setItem(
                "user_id",
                result.user_id
            );

            localStorage.setItem(
                "is_admin",
                String(result.is_admin)
            );

            setMessage(
                "Вход выполнен"
            );

            if (onLogin) {
                onLogin();
            }

        } else {

            setMessage(
                result.error || "Ошибка входа"
            );
        }
    }


    return (

        <div className="container">

            <div className="form-eyebrow">Добро пожаловать</div>
            <h2>Вход в систему</h2>
            <p className="form-subtitle">Введите данные своего аккаунта</p>

            <form
                className="register-form"
                onSubmit={submit}
            >

                <label className="field-label">Email</label>
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={change}
                    required
                />

                <label className="field-label">Пароль</label>
                <div className="password-field">
                    <input
                        name="password"
                        placeholder="Пароль"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={change}
                        required
                    />
                    <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5.5 9 5.5a16 16 0 01-3 3.7M6.6 6.6C4.3 8.1 3 9.5 3 9.5S6.5 15 12 15c1 0 2-.2 2.9-.5" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                                <circle cx="12" cy="12" r="2.5" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="login-password-actions">
                    <button
                        className="forgot-password-link"
                        type="button"
                        onClick={onForgotPassword}
                    >
                        Забыли пароль?
                    </button>
                </div>

                <button className="btn-primary btn-block" type="submit">
                    Войти
                </button>

            </form>

            {
                message &&
                <p className="message">
                    {message}
                </p>
            }

        </div>

    );
}


export default Login;