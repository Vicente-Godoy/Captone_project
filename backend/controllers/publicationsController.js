const { db } = require('../config/firebase');

/**
 * Crea una nueva publicación.
 * DENORMALIZACIÓN: Obtiene datos del usuario y los incrusta en la publicación.
 */
const createPublication = async (req, res) => {
  try {
    const { uid } = req.user; // UID del usuario autenticado
    const { title, content, imageUrl, tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags } = req.body;

    // Log del request
    console.log(`📝 [CREATE PUBLICATION] Request from user ${uid}:`, {
      title, content, imageUrl, tipo, titulo, descripcion
    });

    // Validación: soportar tanto el formato nuevo (title, content) como el viejo (tipo, titulo)
    const finalTitle = title || titulo;
    const finalContent = content || descripcion;

    if (!finalTitle) {
      console.log('❌ [CREATE PUBLICATION] Missing title');
      return res.status(400).json({ error: 'Título es obligatorio.' });
    }

    // --- Inicio de la Denormalización ---
    // 1. Obtener el documento del perfil del creador
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.log(`❌ [CREATE PUBLICATION] User ${uid} not found in Firestore`);
      return res.status(404).json({ error: 'El usuario creador no existe.' });
    }
    const userData = userDoc.data();
    console.log(`✅ [CREATE PUBLICATION] User data retrieved:`, { nombre: userData.nombre });
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
      fechaCreacion: new Date(), // TODO: Cambiar a serverTimestamp() cuando esté disponible
    };

    console.log(`💾 [CREATE PUBLICATION] Saving to Firestore:`, {
      creatorId: newPublication.creatorId,
      title: newPublication.title,
      activo: newPublication.activo
    });

    const docRef = await db.collection('publications').add(newPublication);

    console.log(`✅ [CREATE PUBLICATION] Success! Document ID: ${docRef.id}`);
    res.status(201).json({
      message: 'Publicación creada con éxito',
      id: docRef.id,
      title: finalTitle
    });

  } catch (error) {
    console.error("❌ [CREATE PUBLICATION] Error:", error);
    res.status(500).json({ error: 'No se pudo crear la publicación.' });
  }
};

/**
 * Obtiene todas las publicaciones activas (el feed principal).
 * Es una consulta única y eficiente gracias a la denormalización.
 */
const getAllPublications = async (req, res) => {
  try {
    console.log('📖 [GET PUBLICATIONS] Fetching active publications...');

    const snapshot = await db.collection('publications')
      .where('activo', '==', true)
      .orderBy('fechaCreacion', 'desc')
      .limit(50) // Paginación básica para no traer toda la base de datos
      .get();

    console.log(`📊 [GET PUBLICATIONS] Found ${snapshot.size} publications`);

    if (snapshot.empty) {
      console.log('📭 [GET PUBLICATIONS] No publications found, returning empty array');
      return res.status(200).json([]);
    }

    const publications = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`📄 [GET PUBLICATIONS] Publication ${doc.id}:`, {
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

    console.log(`✅ [GET PUBLICATIONS] Returning ${publications.length} publications`);
    res.status(200).json(publications);

  } catch (error) {
    console.error("❌ [GET PUBLICATIONS] Error:", error);
    res.status(500).json({ error: 'No se pudieron obtener las publicaciones.' });
  }
};

/**
 * Obtiene una única publicación por su ID.
 */
const getPublicationById = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const doc = await db.collection('publications').doc(publicationId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    console.error("Error al obtener publicación por ID:", error);
    res.status(500).json({ error: 'No se pudo obtener la publicación.' });
  }
};


module.exports = {
  createPublication,
  getAllPublications,
  getPublicationById,
};
