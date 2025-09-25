import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Etiqueta1() {
  const navigate = useNavigate();

  // Lista de etiquetas
  const etiquetas = [
    "DEPORTES", "CIENCIAS", "FITNESS", "Filosofía", "IDIOMAS", 
    "COMPUTACION", "MUSICA", "Programación", "ARTES", "Escritura",
    "Historia", "Química", "Robótica", "moda", "Finanzas", 
    "Cocina", "Filosofía", "Literatura", "Matemáticas"
  ];

  // Estado para las etiquetas seleccionadas
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Función para seleccionar/deseleccionar
  const toggleEtiqueta = (etiqueta) => {
    if (seleccionadas.includes(etiqueta)) {
      setSeleccionadas(seleccionadas.filter((e) => e !== etiqueta));
    } else {
      setSeleccionadas([...seleccionadas, etiqueta]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>DEFINE TU CONOCIMIENTO</h2>
      DEFINE TU CONOCIMIENTO ENTRE LAS SIGUIENTES ETIQUETAS
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {etiquetas.map((etiqueta) => (
          <button
            key={etiqueta}
            onClick={() => toggleEtiqueta(etiqueta)}
            style={{
              padding: "8px 12px",
              borderRadius: 20,
              border: seleccionadas.includes(etiqueta) ? "2px solid #007bff" : "1px solid #ccc",
              backgroundColor: seleccionadas.includes(etiqueta) ? "#cce5ff" : "#f8f9fa",
              cursor: "pointer",
            }}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          console.log("Etiquetas seleccionadas:", seleccionadas);
          navigate("/etiqueta2");
        }}
      >
        Siguiente
      </button>
    </div>
  );
}

export default Etiqueta1;