import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { requestPasswordReset } from "../../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!email.trim()) {
      setMessage("Ingresa un correo valido.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setMessage("Te enviamos un correo con instrucciones para restablecer la contrasena.");
      setIsSuccess(true);
    } catch (error) {
      console.error("Error solicitando restablecimiento:", error);
      setMessage(error.message || "No se pudo enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-page">
        <header className="login-header">
          <div className="logo-circle">
            <span>SS</span>
          </div>
          <div>
            <h1 className="brand">SkillSwapp</h1>
            <p className="tagline">Recupera tu acceso</p>
          </div>
        </header>

        <div className="welcome">
          <h2>Recupera tu contrasena</h2>
          <p>Ingresa el correo asociado a tu cuenta y te enviaremos un enlace.</p>
        </div>

        <div className="card login-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-wrap" htmlFor="forgot-email">
              <span className="input-label">Correo electronico</span>
              <input
                id="forgot-email"
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            {message && (
              <p
                className="form-error"
                style={{ color: isSuccess ? "#7dffb5" : "#ff8b8b" }}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className="btn-pill primary"
              disabled={loading || !email.trim()}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            <button
              type="button"
              className="btn-pill secondary"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </form>
        </div>

        <div className="login-footer">
          <Link className="forgot" to="/">
            Recordaste tu contrasena? Inicia sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
