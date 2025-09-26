import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registro.css"; // 👈 importante

function Registro() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleNext = () => {
    // valida mínimo (opcional)
    if (!nombre || !email || !contrasena) return;
    console.log("Datos de registro:", { nombre, email, contrasena });
    navigate("/ConOfre");
  };

  return (
    <div className="register-page">
      {/* Header: logo + marca */}
      <header className="reg-header">
        {/* si tienes un SVG, reemplaza por <img src="/logo.svg" alt="SkillSwapp" /> */}
        <div className="logo-circle">SS</div>
        <h1 className="brand">SkillSwapp</h1>
      </header>

      {/* Tarjeta roja con título */}
      <section className="reg-card">
        <h2 className="reg-title">
          CREA TU
          <br />
          CUENTA!!
        </h2>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
      </section>

      {/* Botón fuera de la tarjeta (como en el mockup) */}
      <button className="btn-pill outline" onClick={handleNext}>
        SIGUIENTE
      </button>
    </div>
  );
}

export default Registro;
