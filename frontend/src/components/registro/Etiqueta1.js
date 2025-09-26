import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etiqueta1.css";

function Etiqueta1() {
  const navigate = useNavigate();

  const etiquetas = [
    "DEPORTES", "CIENCIAS", "FITNESS", "ARTES", "MUSICA",
    "IDIOMAS", "FILOSOFÍA", "COMPUTACION", "PROGRAMACIÓN", "ESCRITURA",
    "COCINA", "FINANZAS", "MODA", "ROBÓTICA", "QUÍMICA",
    "HISTORIA", "MATEMÁTICAS", "LITERATURA", "+"
  ];

  const [seleccionadas, setSeleccionadas] = useState([]);

  const toggleEtiqueta = (etiqueta) => {
    if (etiqueta === "+") {
      // aquí podrías abrir un modal para agregar una nueva etiqueta
      return;
    }
    setSeleccionadas((prev) =>
      prev.includes(etiqueta)
        ? prev.filter((e) => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  const goNext = () => {
    console.log("Etiquetas seleccionadas:", seleccionadas);
    navigate("/Etiqueta2"); // 👈 respeta el casing del Router
  };

  return (
    <div className="e1-page">
      {/* Header rojo con flecha y título */}
      <header className="e1-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
        <h1 className="e1-title">DEFINE TU<br />CONOCIMIENTO</h1>
      </header>

      <main className="e1-main">
        <p className="e1-sub">DEFINE TU CONOCIMIENTO ENTRE LAS SIGUIENTES ETIQUETAS</p>

        <div className="chips-grid">
          {etiquetas.map((et) => {
            const selected = seleccionadas.includes(et);
            const isPlus = et === "+";
            return (
              <button
                key={et}
                type="button"
                onClick={() => toggleEtiqueta(et)}
                className={[
                  "chip",
                  selected ? "selected" : "",
                  isPlus ? "plus" : ""
                ].join(" ").trim()}
              >
                {et}
              </button>
            );
          })}
        </div>

        <button className="btn-pill danger" onClick={goNext}>SIGUIENTE</button>
      </main>
    </div>
  );
}

export default Etiqueta1;
