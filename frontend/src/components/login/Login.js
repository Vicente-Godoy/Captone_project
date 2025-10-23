// src/components/login/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { loginWithPassword } from "../../services/auth"; // solo login

function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!user || !pass) {
      setErr("Ingresa email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      // 🔐 Login real (Firebase). Guarda idToken en localStorage (lo hace el service)
      await loginWithPassword(user, pass);

      onLogin?.(true);
      // Navigate to Home after login (not to wizard)
      navigate("/");
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header / logo + marca */}
      <header className="login-header">
        <div className="logo-circle">SS</div>
        <h1 className="brand">SkillSwapp</h1>
      </header>

      {/* Texto bienvenida */}
      <div className="welcome">
        <h2>
          BIENVENIDO A
          <br />
          SKILLSWAPP
        </h2>
      </div>

      {/* Tarjeta roja */}
      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-wrap">
            <span className="icon" aria-hidden>
              👤
            </span>
            <input
              type="email"
              placeholder="Email"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-wrap">
            <span className="icon" aria-hidden>
              🔒
            </span>
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && (
            <p style={{ color: "#d33", marginTop: 8, minHeight: 18 }}>{err}</p>
          )}

          <button
            type="submit"
            className="btn-pill primary"
            disabled={loading || !user || !pass}
          >
            {loading ? "Ingresando..." : "INGRESAR"}
          </button>

          {/* Solo redirige al wizard de registro */}
          <button
            type="button"
            className="btn-pill secondary"
            onClick={() => navigate("/registro")}
            disabled={loading}
          >
            REGÍSTRATE
          </button>
        </form>
      </div>

      <a className="forgot" href="#recuperar">
        RECUPERA TU CONTRASEÑA
      </a>
    </div>
  );
}

export default Login;
