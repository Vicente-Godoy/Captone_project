import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistroFlow } from "./RegistroFlow";
// import axios from "axios"; // <- cuando conecten backend real

export default function Foto() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();
  const [preview, setPreview] = useState(registroData.foto || null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    // Por ahora guardamos solo la URL temporal; cuando conecten backend,
    // guarden el File en otro campo (p.ej. fotoFile) para subirlo.
    setRegistroData((prev) => ({ ...prev, foto: url /* , fotoFile: f */ }));
  };

  const finish = async () => {
    // 👉 Aquí está listo el objeto final:
    console.log("🚀 Registro listo para enviar:", registroData);

    // Ejemplo de cómo sería el submit real (cuando esté lista la API):
    // try {
    //   // 1) POST /api/auth/register con { nombre, email, password }
    //   // 2) login a Firebase → idToken
    //   // 3) PUT /api/users/me con el resto del perfil (usar idToken en Authorization)
    //   // 4) subir foto si corresponde (multipart o storage)
    //   alert("Cuenta creada (simulado). Ahora irías al login.");
    // } catch (e) {
    //   console.error(e);
    //   alert("Error al registrar.");
    //   return;
    // }

    // Por ahora solo volvemos al inicio.
    navigate("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sube tu foto</h2>

      <input type="file" accept="image/*" onChange={handleFile} />

      {preview && (
        <img
          src={preview}
          alt="vista previa"
          style={{ display: "block", width: 180, marginTop: 20, borderRadius: 8 }}
        />
      )}

      <button className="btn-pill danger" style={{ marginTop: 20 }} onClick={finish}>
        FINALIZAR
      </button>
    </div>
  );
}
