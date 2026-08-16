import { useState } from "react";

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

            if (result.error) {
                setError(result.error);
            } else {
                setMessage(
                    result.message ||
                    "Если такой email зарегистрирован, на него отправлена ссылка для восстановления пароля."
                );
            }
        } catch {
            setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="form-eyebrow">Восстановление доступа</div>
            <h2>Забыли пароль?</h2>
            <p className="form-subtitle">
                Введите email, указанный при регистрации. Мы отправим ссылку для создания нового пароля.
            </p>

            {message ? (
                <div className="auth-success">
                    <div className="auth-status-icon">✓</div>
                    <strong>Проверьте почту</strong>
                    <p>{message}</p>
                    <button className="btn-secondary btn-block" type="button" onClick={onBack}>
                        Вернуться ко входу
                    </button>
                </div>
            ) : (
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

                    {error && <p className="message message--error">{error}</p>}

                    <button className="btn-primary btn-block" type="submit" disabled={loading}>
                        {loading ? "Отправляем..." : "Отправить ссылку"}
                    </button>

                    <button className="forgot-password-link forgot-password-link--back" type="button" onClick={onBack}>
                        ← Вернуться ко входу
                    </button>
                </form>
            )}
        </div>
    );
}

export default ForgotPassword;
