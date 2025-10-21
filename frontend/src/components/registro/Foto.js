// src/components/registro/Foto.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistroFlow } from "./RegistroFlow";
import API_BASE from "../../api";
import { getIdToken } from "../../services/auth";

export default function Foto() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();
  const [preview, setPreview] = useState(registroData.foto || null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setRegistroData((prev) => ({ ...prev, foto: url /* , fotoFile: f */ }));
  };

  // 👇 helper: asegura que exista /users/{uid} antes de publicar
  async function ensureProfileExists(idToken) {
    const body = {
      // usa el nombre del registro si lo tienes, o un fallback
      nombre: registroData?.nombre || "Usuario",
      // si quieres mandar foto más tarde puedes agregar fotoUrl aquí
    };

    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });

    // Aceptamos 200/201/204 como OK; si viene 401/404/500, lanzamos error para verlo
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Fallo al crear/actualizar perfil (${res.status}): ${txt}`);
    }
  }

  const finish = async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        alert("Debes iniciar sesión para publicar.");
        navigate("/"); // login
        return;
      }

      // 1) 💡 asegurar el perfil
      await ensureProfileExists(token);

      // 2) crear la publicación
      const payload = {
        tipo: "ofrezco",
        titulo: registroData.conocimiento,
        descripcion: registroData.descripcion || null,
        nivel: registroData.nivel || null,
        modalidad: registroData.modalidad || null,
        ciudad: registroData.ciudad || null,
        region: registroData.region || null,
        tags: registroData.etiquetas || [],
      };

      const res = await fetch(`${API_BASE}/api/publications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }

      alert("✅ Publicación creada");
      navigate("/"); // o a donde quieras ir
    } catch (e) {
      console.error(e);
      alert(e.message || "No se pudo crear la publicación.");
    }
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
