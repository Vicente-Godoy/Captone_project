// src/components/registro/Foto.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistroFlow } from "./RegistroFlow";
import API_BASE from "../../api";
import { auth, storage } from "../../lib/firebaseClient";
import { getIdToken } from "../../services/auth";
import { toast } from "../../utils/toast";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function Foto() {
  const navigate = useNavigate();
  const { registroData, setRegistroData } = useRegistroFlow();

  const [preview, setPreview] = useState(registroData.foto || null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type?.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("La imagen supera los 5MB.");
      return;
    }

    // Liberar previo objectURL si existía
    if (preview && preview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setRegistroData((prev) => ({ ...prev, foto: url }));
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

  const uploadAvatarAndGetUrl = (uid, f) =>
    new Promise((resolve, reject) => {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const avatarRef = ref(storage, `users/${uid}/avatar_${Date.now()}.${ext}`);
      const metadata = { contentType: f.type || "image/jpeg" };
      const task = uploadBytesResumable(avatarRef, f, metadata);

      task.on(
        "state_changed",
        () => {},
        (err) => reject(err),
        async () => {
          try {
            const url = await getDownloadURL(avatarRef);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

  const finish = async () => {
    try {
      setSaving(true);
      const token = await getIdToken();
      const uid = auth.currentUser?.uid;

      if (!token || !uid) {
        toast.error("Debes iniciar sesión para publicar.");
        navigate("/");
        return;
      }

      // 1) Subir foto y actualizar perfil (si el usuario eligió archivo)
      let fotoUrlFinal = null;
      if (file) {
        try {
          fotoUrlFinal = await uploadAvatarAndGetUrl(uid, file);

          const resProfile = await fetch(`${API_BASE}/api/users/me`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fotoUrl: fotoUrlFinal }),
          });

          if (!resProfile.ok) {
            const txt = await resProfile.text();
            console.warn("Actualizar perfil falló:", txt);
          }
          // Guardar URL final en el flujo
          setRegistroData((prev) => ({ ...prev, foto: fotoUrlFinal }));
        } catch (e) {
          console.error("Upload avatar falló:", e);
          toast.error(
            "La publicación continuará, pero la foto de perfil no se pudo subir (revisa bloqueadores/antivirus/VPN)."
          );
        }
      }

      // 2) Crear publicación en backend (formato unificado)
      const payload = {
        title: registroData.conocimiento,
        content: registroData.descripcion || null,
        imageUrl: fotoUrlFinal || null,
        nivel: registroData.nivel || null,
        modalidad: registroData.modalidad || null,
        ciudad: registroData.ciudad || null,
        region: registroData.region || null,
        tags: registroData.etiquetas || [],
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
        throw new Error(`Error al crear publicación: ${txt}`);
      }

      toast.success("Perfil actualizado y publicación creada.");
      navigate("/");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo completar el proceso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          ← Volver al Home
        </button>
        <h2>Sube tu foto</h2>
      </div>

      <input type="file" accept="image/*" onChange={handleFile} />

      {preview && (
        <img
          src={preview}
          alt="vista previa"
          style={{ display: "block", width: 180, marginTop: 20, borderRadius: 8 }}
        />
      )}

      <button
        className="btn-pill danger"
        style={{ marginTop: 20 }}
        onClick={finish}
        disabled={saving}
      >
        {saving ? "Guardando..." : "FINALIZAR"}
      </button>
    </div>
  );
}

