// src/components/registro/Etiqueta2.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etiqueta2.css";
import { useRegistroFlow } from "./RegistroFlow";

const OPCIONES = [
  "DEPORTES", "CIENCIAS", "FITNESS", "ARTES", "MUSICA", "IDIOMAS", "FILOSOFÍA",
  "COMPUTACION", "PROGRAMACIÓN", "ESCRITURA", "COCINA", "FINANZAS", "MODA",
  "ROBÓTICA", "QUÍMICA", "HISTORIA", "MATEMÁTICAS", "LITERATURA"
];

export default function Etiqueta2() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();

  const [seleccionadas, setSeleccionadas] = useState(
    Array.isArray(registroData.intereses) ? registroData.intereses : []
  );

  const toggle = (et) => {
    setSeleccionadas((prev) =>
      prev.includes(et) ? prev.filter((x) => x !== et) : [...prev, et]
    );
  };

  const goNext = () => {
    // Si quieres forzar al menos una selección, descomenta:
    // if (seleccionadas.length === 0) return;

    setRegistroData((prev) => ({ ...prev, intereses: seleccionadas }));
    navigate("/registro/Foto");
  };

  return (
    <div className="e2-page">
      <header className="e2-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          ‹
        </button>
        <h1 className="e2-title">¿QUÉ TEMAS<br />TE INTERESAN?</h1>
      </header>

      <main className="e2-main">
        <p className="e2-sub">PUEDES MARCAR MÁS DE UNA OPCIÓN</p>

        <div className="chips-grid">
          {OPCIONES.map((et) => (
            <button
              key={et}
              type="button"
              onClick={() => toggle(et)}
              className={["chip", seleccionadas.includes(et) ? "selected" : ""]
                .join(" ")
                .trim()}
            >
              {et}
            </button>
          ))}
        </div>

        <button className="btn-pill danger" onClick={goNext}>
          SIGUIENTE
        </button>
      </main>
    </div>
  );
}
