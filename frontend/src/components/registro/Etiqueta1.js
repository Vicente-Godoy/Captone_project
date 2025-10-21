// src/components/registro/Etiqueta1.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etiqueta1.css";

import { useRegistroFlow } from "./RegistroFlow";

const OPCIONES = [
  "DEPORTES", "CIENCIAS", "FITNESS", "ARTES", "MUSICA", "IDIOMAS", "FILOSOFÍA",
  "COMPUTACION", "PROGRAMACIÓN", "ESCRITURA", "COCINA", "FINANZAS", "MODA",
  "ROBÓTICA", "QUÍMICA", "HISTORIA", "MATEMÁTICAS", "LITERATURA"
];

export default function Etiqueta1() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();

  // carga inicial desde el contexto (si vuelve atrás no se pierde)
  const [seleccionadas, setSeleccionadas] = useState(
    Array.isArray(registroData.etiquetas) ? registroData.etiquetas : []
  );

  const toggle = (et) => {
    setSeleccionadas((prev) =>
      prev.includes(et) ? prev.filter((x) => x !== et) : [...prev, et]
    );
  };

  const goNext = () => {
    // si quieres forzar al menos una etiqueta, descomenta:
    // if (seleccionadas.length === 0) return;

    setRegistroData((prev) => ({ ...prev, etiquetas: seleccionadas }));
    navigate("/registro/Etiqueta2");
  };

  return (
    <div className="e1-page">
      <header className="e1-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          ‹
        </button>
        <h1 className="e1-title">DEFINE TU<br />CONOCIMIENTO</h1>
      </header>

      <main className="e1-main">
        <p className="e1-sub">
          SELECCIONA LAS ETIQUETAS QUE DESCRIBEN TU CONOCIMIENTO
        </p>

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
