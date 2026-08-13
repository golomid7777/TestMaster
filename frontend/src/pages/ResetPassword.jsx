import { useState } from "react";

const API_URL = "http://127.0.0.1:8001";

function ResetPassword({ token, onDone }) {
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Пароль должен содержать не менее 8 символов.");
            return;
        }

        if (password !== repeatPassword) {
            setError("Пароли не совпадают.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    new_password: password
                })
            });

            const result = await response.json();

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                window.history.replaceState({}, "", window.location.pathname);
            }
        } catch {
            setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="form-eyebrow">Новый пароль</div>
            <h2>{success ? "Пароль изменён" : "Создайте новый пароль"}</h2>

            {success ? (
                <div className="auth-success">
                    <div className="auth-status-icon">✓</div>
                    <strong>Готово</strong>
                    <p>Новый пароль сохранён. Теперь вы можете войти в TestMaster.</p>
                    <button className="btn-primary btn-block" type="button" onClick={onDone}>
                        Войти в TestMaster
                    </button>
                </div>
            ) : (
                <>
                    <p className="form-subtitle">
                        Придумайте новый пароль длиной не менее 8 символов.
                    </p>

                    <form className="register-form" onSubmit={submit}>
                        <label className="field-label">Новый пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Новый пароль"
                            minLength="8"
                            required
                            autoFocus
                        />

                        <label className="field-label">Повторите пароль</label>
                        <input
                            type="password"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            placeholder="Повторите пароль"
                            minLength="8"
                            required
                        />

                        {error && <p className="message message--error">{error}</p>}

                        <button className="btn-primary btn-block" type="submit" disabled={loading}>
                            {loading ? "Сохраняем..." : "Сохранить новый пароль"}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default ResetPassword;
