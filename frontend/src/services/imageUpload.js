// src/services/imageUpload.js
import { useState } from 'react';
import { storage, auth } from "../lib/firebaseClient";
import { ref, deleteObject } from "firebase/storage";
import { toast } from "../utils/toast";
import { requestSignedUploadUrl, uploadFileToSignedUrl } from "./storage";

/**
 * Optimiza una imagen antes de subirla
 * @param {File} file - Archivo de imagen
 * @param {Object} options - Opciones de optimización
 * @returns {Promise<Blob>} - Imagen optimizada
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener aspecto ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al optimizar imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una imagen a Firebase Storage con optimización
 * @param {File} file - Archivo de imagen
 * @param {string} path - Ruta en Storage (ej: 'posts', 'avatars', 'publications')
 * @param {Function} onProgress - Callback para progreso de subida
 * @returns {Promise<string>} - URL de la imagen subida
 */
export async function uploadImage(file, path = 'posts', onProgress = null) {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Debes estar autenticado para subir imágenes');
  }

  try {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato no soportado. Usa imágenes JPG, PNG o WEBP.');
    }

    // Validar tamaño (20MB máximo antes de optimización)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('La imagen es muy grande (máximo 20MB)');
    }

    const normalizedFolder = typeof path === 'string'
      ? path.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : 'posts';

    const targetFolder = normalizedFolder && normalizedFolder.length > 0 ? normalizedFolder : 'posts';

    const signedUpload = await requestSignedUploadUrl({
      contentType: file.type,
      folder: targetFolder
    });

    const { downloadUrl } = await uploadFileToSignedUrl({
      file,
      signedUpload,
      onProgress,
    });

    console.log('Imagen subida exitosamente');
    toast.success('Imagen subida exitosamente');
    return downloadUrl;

  } catch (error) {
    console.error('Error en uploadImage:', error);
    toast.error(error.message);
    throw error;
  }
}

/**
 * Elimina una imagen de Firebase Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  try {
    // Extraer path de la URL
    const path = imageUrl.split('/o/')[1]?.split('?')[0];
    
    if (!path) {
      throw new Error('URL de imagen inválida');
    }

    const decodedPath = decodeURIComponent(path);
    const imageRef = ref(storage, decodedPath);
    
    await deleteObject(imageRef);
    console.log('Imagen eliminada exitosamente');
    toast.success('Imagen eliminada');
    
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    toast.error('Error al eliminar imagen');
    throw error;
  }
}

/**
 * Hook React para manejar subida de imágenes
 */
export function useImageUpload(path = 'posts') {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await uploadImage(file, path, setProgress);
      setImageUrl(url);
      return url;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setImageUrl(null);
    setError(null);
  };

  return {
    upload,
    uploading,
    progress,
    imageUrl,
    error,
    reset
  };
}

