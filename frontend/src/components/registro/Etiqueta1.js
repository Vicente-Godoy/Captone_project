import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etiqueta1.css";

function Etiqueta1({ registroData, setRegistroData }) {
  const navigate = useNavigate();
  const etiquetas = ["DEPORTES","CIENCIAS","FITNESS","ARTES","MUSICA","IDIOMAS","FILOSOFÍA","COMPUTACION","PROGRAMACIÓN","ESCRITURA","COCINA","FINANZAS","MODA","ROBÓTICA","QUÍMICA","HISTORIA","MATEMÁTICAS","LITERATURA","+"];

  const [seleccionadas, setSeleccionadas] = useState(registroData.etiquetas || []);

  const toggleEtiqueta = (etiqueta) => {
    if (etiqueta === "+") return;
    setSeleccionadas(prev => prev.includes(etiqueta) ? prev.filter(e => e!==etiqueta) : [...prev, etiqueta]);
  };

  const goNext = () => {
    setRegistroData(prev => ({ ...prev, etiquetas: seleccionadas }));
    navigate("/Foto");
  };

  return (
    <div className="e1-page">
      <header className="e1-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1 className="e1-title">DEFINE TU<br/>CONOCIMIENTO</h1>
      </header>

      <main className="e1-main">
        <p className="e1-sub">DEFINE TU CONOCIMIENTO ENTRE LAS SIGUIENTES ETIQUETAS</p>

        <div className="chips-grid">
          {etiquetas.map(et => (
            <button key={et} type="button" onClick={() => toggleEtiqueta(et)} className={seleccionadas.includes(et) ? "chip selected" : "chip"}>
              {et}
            </button>
          ))}
        </div>

        <button className="btn-pill danger" onClick={goNext}>SIGUIENTE</button>
      </main>
    </div>
  );
}

export default Etiqueta1;