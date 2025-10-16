import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./conofre.css";

function ConOfre({ registroData, setRegistroData }) {
  const navigate = useNavigate();
  const [cuadro1, setCuadro1] = useState(registroData.conocimiento || "");
  const [cuadro2, setCuadro2] = useState(registroData.descripcion || "");

  const goNext = () => {
    setRegistroData(prev => ({ ...prev, conocimiento: cuadro1, descripcion: cuadro2 }));
    navigate("/Etiqueta1");
  };

  return (
    <div className="co-page">
      <header className="co-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1 className="co-title">QUE LE OFRECES A<br/>SKILLSWAPP?</h1>
      </header>

      <main className="co-main">
        <label className="co-label">PONLE UN NOMBRE A TU CONOCIMIENTO</label>
        <input className="co-input" placeholder="Nombre del conocimiento" value={cuadro1} onChange={(e) => setCuadro1(e.target.value)} />

        <label className="co-label">DESCRIBE TU CONOCIMIENTO</label>
        <textarea className="co-textarea" placeholder="Descripción del conocimiento" value={cuadro2} onChange={(e) => setCuadro2(e.target.value)} />

        <button className="btn-pill danger" onClick={goNext}>SIGUIENTE</button>
      </main>
    </div>
  );
}

export default ConOfre;