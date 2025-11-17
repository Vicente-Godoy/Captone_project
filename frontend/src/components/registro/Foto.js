// src/components/registro/Foto.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistroFlow } from "./RegistroFlow";
import API_BASE from "../../api";
import { auth } from "../../lib/firebaseClient";
import { getIdToken } from "../../services/auth";
import { toast } from "../../utils/toast";
import "./foto.css";
import { uploadAvatarImage, MAX_IMAGE_BYTES } from "../../services/storage";
import { optimizeImageFile } from "../../utils/image";
import { updateProfile } from "firebase/auth";

export default function Foto() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();

  const [preview, setPreview] = useState(registroData.foto || null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState(null);
  const uploadPromiseRef = useRef(null);

  const startAvatarUpload = async (rawFile) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setUploadingAvatar(true);
    setUploadedAvatarUrl(null);
    try {
      const optimized = await optimizeImageFile(rawFile);
      uploadPromiseRef.current = uploadAvatarImage(optimized, uid);
      const url = await uploadPromiseRef.current;
      setUploadedAvatarUrl(url);
    } catch (err) {
      console.error("Error preparando avatar:", err);
      setUploadedAvatarUrl(null);
    } finally {
      setUploadingAvatar(false);
      uploadPromiseRef.current = null;
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type?.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("La imagen supera el limite de 10MB.");
      return;
    }

    if (preview && preview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setRegistroData((prev) => ({ ...prev, foto: url }));
    startAvatarUpload(f);
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(preview);
        } catch {}
      }
    };
  }, [preview]);

  const persistAvatar = async (fotoUrlFinal, token) => {
    if (!fotoUrlFinal || !token) return;
    await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fotoUrl: fotoUrlFinal }),
    });
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { photoURL: fotoUrlFinal });
      } catch (error) {
        console.warn("No se pudo refrescar photoURL:", error);
      }
    }
    setRegistroData((prev) => ({ ...prev, foto: fotoUrlFinal }));
  };

  const finish = async () => {
    try {
      setSaving(true);
      const token = await getIdToken();
      const uid = auth.currentUser?.uid;

      if (!token || !uid) {
        toast.error("Debes iniciar sesion para publicar.");
        navigate("/");
        return;
      }

      let fotoUrlFinal = uploadedAvatarUrl;
      if (!fotoUrlFinal && file) {
        try {
          const optimized = await optimizeImageFile(file);
          fotoUrlFinal = await uploadAvatarImage(optimized, uid);
        } catch (error) {
          console.error("Upload avatar fallo:", error);
          toast.error("La publicacion seguira sin foto de perfil.");
        }
      }

      if (fotoUrlFinal) {
        await persistAvatar(fotoUrlFinal, token);
      }

      const payload = {
        title: registroData.conocimiento,
        content: registroData.descripcion || null,
        imageUrl: fotoUrlFinal || null,
        nivel: registroData.nivel || null,
        modalidad: registroData.modalidad || null,
        ciudad: registroData.ciudad || null,
        region: registroData.region || null,
        tags: registroData.etiquetas || [],
        interestTags: registroData.intereses || [],
      };

      const resPub = await fetch(`${API_BASE}/api/publications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resPub.ok) {
        const txt = await resPub.text();
        throw new Error(`Error al crear publicacion: ${txt}`);
      }

      toast.success("Perfil actualizado y publicacion creada.");
      navigate("/");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo completar el proceso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="foto-shell">
      <div className="foto-card">
        <button className="foto-back" onClick={() => navigate("/")}>
          &#8249; Volver al Home
        </button>
        <h2 className="foto-title">Sube tu foto</h2>
        <p className="foto-subtitle">
          Personaliza tu perfil con una imagen. Puedes cambiarla despues.
        </p>

        <label className="foto-input">
          <span>Elegir archivo</span>
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>

        {preview && (
          <img src={preview} alt="vista previa" className="foto-preview" />
        )}

        <button
          className="btn-pill primary"
          onClick={finish}
          disabled={saving || uploadingAvatar}
        >
          {saving ? "Guardando..." : uploadingAvatar ? "Cargando imagen..." : "Finalizar"}
        </button>
      </div>
    </div>
  );
}
