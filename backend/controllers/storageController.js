const crypto = require('crypto');
const { bucket } = require('../config/firebase');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const ALLOWED_FOLDERS = new Set(['posts', 'avatars', 'temp']);

const SIGNED_URL_TTL_SECONDS = Number(process.env.STORAGE_SIGNED_URL_TTL_SECONDS || 15 * 60);

/**
 * Genera una URL firmada temporal para subir un archivo directamente a Firebase Storage (GCS).
 * Seguridad aplicada:
 * - Solo usuarios autenticados (middleware) pueden solicitarla.
 * - Se restringe el MIME type permitido.
 * - La URL expira rápidamente (15 min por defecto).
 */
const getSignedUploadUrl = async (req, res) => {
  try {
    const { uid } = req.user || {};
    const { contentType, folder } = req.body || {};

    if (!uid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!contentType || typeof contentType !== 'string') {
      return res.status(400).json({ error: 'contentType es obligatorio' });
    }

    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return res.status(415).json({
        error: `Tipo de archivo no permitido. Permitidos: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`
      });
    }

    const extension = contentType.split('/')[1];
    const targetFolder = (typeof folder === 'string' && ALLOWED_FOLDERS.has(folder.toLowerCase()))
      ? folder.toLowerCase()
      : 'posts';
    const objectPath = [
      'uploads',
      targetFolder,
      uid,
      `${Date.now()}-${crypto.randomUUID()}.${extension}`
    ].join('/');

    const file = bucket.file(objectPath);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
      contentType,
      extensionHeaders: {
        'x-goog-meta-ownerUid': uid
      }
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`;

    return res.status(200).json({
      uploadUrl,
      objectPath,
      publicUrl,
      bucket: bucket.name,
      ownerUid: uid,
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString()
    });
  } catch (error) {
    console.error('[STORAGE] Error generando URL firmada:', error);
    return res.status(500).json({ error: 'No se pudo generar la URL de carga' });
  }
};

module.exports = {
  getSignedUploadUrl
};

