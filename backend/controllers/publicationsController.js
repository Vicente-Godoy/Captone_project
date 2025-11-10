const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Crea una nueva publicación.
 * DENORMALIZACIÓN: Obtiene datos del usuario y los incrusta en la publicación.
 */
const createPublication = asyncHandler(async (req, res) => {
  const { uid } = req.user; // UID del usuario autenticado
  const { title, content, imageUrl, tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags } = req.body;

  // Log del request
  console.log(`[CREATE PUBLICATION] Request from user ${uid}:`, {
    title, content, imageUrl, tipo, titulo, descripcion
  });

  // Validación: soportar tanto el formato nuevo (title, content) como el viejo (tipo, titulo)
  const finalTitle = title || titulo;
  const finalContent = content || descripcion;

  if (!finalTitle) {
    const error = new Error('Título es obligatorio.');
    error.status = 400;
    throw error;
  }

  // --- Inicio de la Denormalización ---
  // 1. Obtener el documento del perfil del creador
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    const error = new Error('El usuario creador no existe.');
    error.status = 404;
    throw error;
  }
  const userData = userDoc.data();
  console.log(`[CREATE PUBLICATION] User data retrieved:`, { nombre: userData.nombre });
  // --- Fin de la Denormalización ---

  const newPublication = {
    creatorId: uid,
    // Datos denormalizados: Copiamos los datos del autor aquí
    creatorInfo: {
      nombre: userData.nombre || 'Anónimo',
      fotoUrl: userData.fotoUrl || null
    },
    // Author data for better compatibility (new fields)
    authorUid: uid,
    authorName: userData.nombre || userData.displayName || userData.email?.split('@')[0] || 'Anónimo',
    authorPhotoURL: userData.fotoUrl || userData.photoURL || null,
    // Campos principales (soporte para ambos formatos)
    title: finalTitle,
    content: finalContent,
    imageUrl: imageUrl || null,
    // Campos legacy (mantener compatibilidad)
    tipo: tipo || 'publicacion',
    titulo: finalTitle,
    descripcion: finalContent,
    nivel: nivel || null,
    modalidad: modalidad || null,
    ciudad: ciudad || null,
    region: region || null,
    tags: tags || [],
    activo: true,
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
  };

  console.log(`[CREATE PUBLICATION] Saving to Firestore:`, {
    creatorId: newPublication.creatorId,
    title: newPublication.title,
    activo: newPublication.activo
  });

  const docRef = await db.collection('publications').add(newPublication);

  console.log(`[CREATE PUBLICATION] Success! Document ID: ${docRef.id}`);
  res.status(201).json({
    message: 'Publicación creada con éxito',
    id: docRef.id,
    title: finalTitle
  });
});

/**
 * Obtiene todas las publicaciones activas (el feed principal).
 * Es una consulta única y eficiente gracias a la denormalización.
 */
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const getAllPublications = asyncHandler(async (req, res) => {
  console.log('[GET PUBLICATIONS] Fetching active publications...');

  const rawLimit = parseInt(req.query?.limit, 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const cursorId = req.query?.cursor ? String(req.query.cursor) : null;

  let queryRef = db.collection('publications')
    .where('activo', '==', true)
    .orderBy('fechaCreacion', 'desc')
    .orderBy(admin.firestore.FieldPath.documentId(), 'desc');

  if (cursorId) {
    const cursorDoc = await db.collection('publications').doc(cursorId).get();
    if (!cursorDoc.exists) {
      const error = new Error('Cursor inválido.');
      error.status = 400;
      throw error;
    }
    const cursorFecha = cursorDoc.get('fechaCreacion');
    if (!cursorFecha) {
      const error = new Error('Cursor sin marca de tiempo.');
      error.status = 400;
      throw error;
    }
    queryRef = queryRef.startAfter(cursorFecha, cursorDoc.id);
  }

  const snapshot = await queryRef
    .limit(limit + 1) // solicitamos uno extra para detectar si hay siguiente página
    .get();

  console.log(`[GET PUBLICATIONS] Found ${snapshot.size} publications`);

  if (snapshot.empty) {
    console.log('[GET PUBLICATIONS] No publications found, returning empty array');
    res.set('Cache-Control', 'private, max-age=30');
    return res.status(200).json({ items: [], nextCursor: null });
  }

  const limitedDocs = snapshot.docs.slice(0, limit);
  const publications = limitedDocs.map(doc => {
    const data = doc.data();
    console.log(`[GET PUBLICATIONS] Publication ${doc.id}:`, {
      title: data.title || data.titulo,
      creator: data.creatorInfo?.nombre,
      activo: data.activo,
      fechaCreacion: data.fechaCreacion
    });
    return {
      id: doc.id,
      ...data
    };
  });

  const hasMore = snapshot.docs.length > limit;
  const nextCursor = hasMore ? limitedDocs[limitedDocs.length - 1].id : null;

  console.log(`[GET PUBLICATIONS] Returning ${publications.length} publications (nextCursor: ${nextCursor})`);
  res.set('Cache-Control', 'private, max-age=30');
  res.status(200).json({
    items: publications,
    nextCursor
  });
});

/**
 * Obtiene una única publicación por su ID.
 */
const getPublicationById = asyncHandler(async (req, res) => {
  const { publicationId } = req.params;
  const doc = await db.collection('publications').doc(publicationId).get();

  if (!doc.exists) {
    const error = new Error('Publicación no encontrada.');
    error.status = 404;
    throw error;
  }

  res.status(200).json({ id: doc.id, ...doc.data() });
});


module.exports = {
  createPublication,
  getAllPublications,
  getPublicationById,
};

