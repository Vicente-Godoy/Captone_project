// src/services/storage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebaseClient";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

const sanitizeName = (name = "") =>
  name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/_{2,}/g, "_");

const ensureSize = (file) => {
  if (!file) {
    throw new Error("No hay archivo para cargar");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera el límite de 10MB");
  }
};

const resolveContentType = (file) =>
  file?.type && file.type.startsWith("image/") ? file.type : "image/jpeg";

const uploadToFolder = async (folder, file, uid) => {
  ensureSize(file);
  if (!uid) throw new Error("UID requerido para generar la ruta de Storage");

  const timestamp = Date.now();
  const sanitizedName = sanitizeName(file.name || `image-${timestamp}.jpg`);
  const storagePath = `uploads/${folder}/${uid}/${timestamp}-${sanitizedName}`;
  const fileRef = ref(storage, storagePath);
  const metadata = {
    cacheControl: "public,max-age=3600",
    contentType: resolveContentType(file),
  };

  await uploadBytes(fileRef, file, metadata);
  return getDownloadURL(fileRef);
};

export const uploadPublicationImage = (file, uid) =>
  uploadToFolder("posts", file, uid);

export const uploadAvatarImage = (file, uid) =>
  uploadToFolder("avatars", file, uid);

export const isValidImageSize = (file) => {
  if (!file) return false;
  return file.size <= MAX_IMAGE_BYTES;
};
