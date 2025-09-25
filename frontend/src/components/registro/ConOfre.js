import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ConOfre() {
  const navigate = useNavigate();

  // Estados para los cuadros de texto
  const [cuadro1, setCuadro1] = useState("");
  const [cuadro2, setCuadro2] = useState("");

  return (
    <div style={{ padding: 20 }}>
      {/* Título principal fijo */}
      <h2 style={{ fontSize: "1.5em", marginBottom: 20 }}>
        QUE LE OFRECES A SKILLSWAPP?
      </h2>

      {/* Cuadro 1 con título fijo */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: 5 }}>
          PONLE UN NOMBRE A TU CONOCIMIENTO
        </label>
        <textarea
          placeholder="Nombre del conocimiento"
          value={cuadro1}
          onChange={(e) => setCuadro1(e.target.value)}
          style={{ width: "100%", height: 80 }}
        />
      </div>

      {/* Cuadro 2 con título fijo */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: 5 }}>
          DESCRIBE TU CONOCIMIENTO
        </label>
        <textarea
          placeholder="Descripción del conocimiento"
          value={cuadro2}
          onChange={(e) => setCuadro2(e.target.value)}
          style={{ width: "100%", height: 80 }}
        />
      </div>

      {/* Botón para avanzar */}
      <button
        onClick={() => {
          console.log("ConOfre datos:", { cuadro1, cuadro2 });
          navigate("/etiqueta1");
        }}
      >
        Siguiente
      </button>
    </div>
  );
}

export default ConOfre;