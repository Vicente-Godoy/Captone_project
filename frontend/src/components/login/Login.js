import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // 👈 importante

function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && pass) onLogin(true);
  };

  return (
    <div className="login-page">
      {/* Header / logo + marca */}
      <header className="login-header">
        {/* Si tienes un logo, cámbialo por <img src="/tu/logo.svg" alt="SkillSwapp" /> */}
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
            <span className="icon" aria-hidden>👤</span>
            <input
              type="email"
              placeholder="Email"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <span className="icon" aria-hidden>🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-pill primary">INGRESAR</button>
          <button
            type="button"
            className="btn-pill secondary"
            onClick={() => navigate("/registro")}
          >
            REGÍSTRATE
          </button>
        </form>
      </div>

      {/* Link de acción secundaria */}
      <a className="forgot" href="#recuperar">RECUPERA TU CONTRASEÑA</a>
    </div>
  );
}

export default Login;
