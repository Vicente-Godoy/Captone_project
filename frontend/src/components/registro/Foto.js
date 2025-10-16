import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Foto({ registroData, setRegistroData }) {
  const navigate = useNavigate();
  const [imagen, setImagen] = useState(registroData.foto || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagen(url);
      setRegistroData(prev => ({ ...prev, foto: url }));
    }
  };

  const handleFinish = async () => {
    try {
      await axios.post("/api/perfiles", registroData);
      navigate("/"); // Redirige al home o login
    } catch (err) {
      console.error(err);
      alert("Error al crear el perfil");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sube tu foto</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imagen && <img src={imagen} alt="Vista previa" style={{ maxWidth: "100%", marginTop: 20 }} />}
      <button style={{ marginTop: 20 }} onClick={handleFinish}>FINALIZAR</button>
    </div>
  );
}

export default Foto;