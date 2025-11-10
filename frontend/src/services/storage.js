import API_BASE from "../api";
import { getIdToken } from "./auth";

/**
 * Solicita una URL firmada para subir un archivo a Firebase Storage.
 * @param {Object} options
 * @param {string} options.contentType - MIME type del archivo a subir.
 * @returns {Promise<{ uploadUrl: string, objectPath: string, publicUrl: string, bucket: string, expiresAt: string }>}
 */
export async function requestSignedUploadUrl({ contentType, folder }) {
  if (!contentType) {
    throw new Error("contentType es obligatorio");
  }

  const token = await getIdToken();
  if (!token) {
    throw new Error("Debe iniciar sesión para cargar archivos");
  }

  const response = await fetch(`${API_BASE}/api/storage/signed-uploads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, folder }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  return response.json();
}

/**
 * Sube el archivo binario a la URL firmada emitida por el backend.
 * Devuelve la URL pública calculada y metadatos básicos.
 */
export async function uploadFileToSignedUrl({ file, signedUpload, onProgress }) {
  if (!file) {
    throw new Error("file es obligatorio");
  }
  if (!signedUpload || !signedUpload.uploadUrl) {
    throw new Error("signedUpload inválido");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUpload.uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    if (signedUpload.ownerUid) {
      xhr.setRequestHeader("x-goog-meta-ownerUid", signedUpload.ownerUid);
    }

    if (typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = (event.loaded / event.total) * 100;
        onProgress(Math.min(Math.max(percent, 0), 100));
      };
    }

    xhr.onerror = () => {
      reject(new Error("Error de red al subir el archivo"));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          objectPath: signedUpload.objectPath,
          downloadUrl: signedUpload.publicUrl,
          bucket: signedUpload.bucket,
        });
      } else {
        reject(new Error(`Error ${xhr.status}: ${xhr.responseText || "Error al subir"}`));
      }
    };

    xhr.send(file);
  });
}

