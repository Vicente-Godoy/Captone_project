import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registro.css";

function Registro({ registroData, setRegistroData }) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(registroData.nombre || "");
  const [email, setEmail] = useState(registroData.email || "");
  const [contrasena, setContrasena] = useState(registroData.contrasena || "");

  const handleNext = () => {
    if (!nombre || !email || !contrasena) return;
    setRegistroData(prev => ({ ...prev, nombre, email, contrasena }));
    navigate("/ConOfre");
  };

  return (
    <div className="register-page">
      {/* Header */}
      <header className="reg-header">
        <div className="logo-circle">SS</div>
        <h1 className="brand">SkillSwapp</h1>
      </header>

      <section className="reg-card">
        <h2 className="reg-title">CREA TU<br/>CUENTA!!</h2>

        <div className="form-grid">
          <input type="text" placeholder="Name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        </div>
      </section>

      <button className="btn-pill outline" onClick={handleNext}>SIGUIENTE</button>
    </div>
  );
}

export default Registro;