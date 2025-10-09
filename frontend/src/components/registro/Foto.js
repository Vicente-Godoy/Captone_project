import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Foto() {
  const navigate = useNavigate();
  const [imagen, setImagen] = useState(null);

  // Maneja la selección de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(URL.createObjectURL(file));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sube tu foto</h2>

      {/* Selector de archivo */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Vista previa de la imagen */}
      {imagen && (
        <div style={{ marginTop: 20 }}>
          <p>Vista previa:</p>
          <img src={imagen} alt="Vista previa" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      )}

      {/* Botón Finalizar que lleva al Login */}
      <button
        style={{ marginTop: 20 }}
        onClick={() => {
          console.log("Imagen seleccionada:", imagen);
          // Aquí puedes guardar la imagen o cualquier dato final
          navigate("/"); // Redirige al login
        }}
      >
        Finalizar
      </button>
    </div>
  );
}

export default Foto;