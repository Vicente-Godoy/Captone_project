// src/components/registro/ConOfre.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./conofre.css";

// 👇 usamos el contexto del flujo de registro
import { useRegistroFlow } from "./RegistroFlow";

export default function ConOfre() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();

  // Estado local inicializado desde el contexto
  const [conocimiento, setConocimiento] = useState(registroData.conocimiento || "");
  const [descripcion, setDescripcion] = useState(registroData.descripcion || "");

  const goNext = () => {
    if (!conocimiento || !descripcion) return;

    // Guardamos en el contexto del wizard
    setRegistroData((prev) => ({
      ...prev,
      conocimiento,
      descripcion,
    }));

    // Siguiente paso del flujo (ruta absoluta dentro de /registro)
    navigate("/registro/Etiqueta1");
  };

  return (
    <div className="co-page">
      <header className="co-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="co-title">¿QUÉ LE OFRECES A<br />SKILLSWAPP?</h1>
      </header>

      <main className="co-main">
        <label className="co-label">PÓNLE UN NOMBRE A TU CONOCIMIENTO</label>
        <input
          className="co-input"
          placeholder="Nombre del conocimiento"
          value={conocimiento}
          onChange={(e) => setConocimiento(e.target.value)}
        />

        <label className="co-label">DESCRIBE TU CONOCIMIENTO</label>
        <textarea
          className="co-textarea"
          placeholder="Descripción del conocimiento"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button className="btn-pill danger" onClick={goNext}>
          SIGUIENTE
        </button>
      </main>
    </div>
  );
}
