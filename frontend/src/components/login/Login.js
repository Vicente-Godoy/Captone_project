// src/components/login/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { loginWithPassword, loginWithGoogle } from "../../services/auth";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Ingresa correo y contrasena.");
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword(email.trim(), password);
      onLogin?.(true);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo iniciar sesion.");
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
            <p className="tagline">Intercambia habilidades, crea conexiones</p>
          </div>
        </header>

        <div className="welcome">
          <h2>Bienvenido</h2>
          <p>Inicia sesion para continuar</p>
        </div>

        <div className="card login-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-wrap" htmlFor="login-email">
              <span className="input-label">Correo electronico</span>
              <input
                id="login-email"
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="input-wrap" htmlFor="login-pass">
              <span className="input-label">Contrasena</span>
              <input
                id="login-pass"
                type="password"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn-pill primary"
              disabled={loading || !email || !password}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <button
              type="button"
              className="btn-pill google"
              onClick={async () => {
                setError("");
                try {
                  setLoading(true);
                  await loginWithGoogle();
                  onLogin?.(true);
                  navigate("/");
                } catch (err) {
                  console.error(err);
                  setError(err.message || "No se pudo iniciar sesion con Google.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Continuar con Google"}
            </button>

            <button
              type="button"
              className="btn-pill secondary"
              onClick={() => navigate("/registro")}
              disabled={loading}
            >
              Crear cuenta
            </button>
          </form>
        </div>

        <div className="login-footer">
          <Link className="forgot" to="/recuperar">
            Recupera tu contrasena
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
