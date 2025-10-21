const { db } = require('../config/firebase');

/**
 * Crea una nueva publicación.
 * DENORMALIZACIÓN: Obtiene datos del usuario y los incrusta en la publicación.
 */
const createPublication = async (req, res) => {
  try {
    const { uid } = req.user; // UID del usuario autenticado
    const { tipo, titulo, descripcion, nivel, modalidad, ciudad, region, tags } = req.body;

    if (!tipo || !titulo) {
      return res.status(400).json({ error: 'Tipo y título son obligatorios.' });
    }

    // --- Inicio de la Denormalización ---
    // 1. Obtener el documento del perfil del creador
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
        return res.status(404).json({ error: 'El usuario creador no existe.' });
    }
    const userData = userDoc.data();
    // --- Fin de la Denormalización ---

    const newPublication = {
      creatorId: uid,
      // Datos denormalizados: Copiamos los datos del autor aquí
      creatorInfo: {
        nombre: userData.nombre || 'Anónimo',
        fotoUrl: userData.fotoUrl || null
      },
      tipo,
      titulo,
      descripcion: descripcion || null,
      nivel: nivel || null,
      modalidad: modalidad || null,
      ciudad: ciudad || null,
      region: region || null,
      tags: tags || [], // Array de strings con los nombres de las habilidades
      activo: true,
      fechaCreacion: new Date(),
    };

    const docRef = await db.collection('publications').add(newPublication);
    res.status(201).json({ message: 'Publicación creada con éxito', id: docRef.id });

  } catch (error) {
    console.error("Error al crear la publicación:", error);
    res.status(500).json({ error: 'No se pudo crear la publicación.' });
  }
};

/**
 * Obtiene todas las publicaciones activas (el feed principal).
 * Es una consulta única y eficiente gracias a la denormalización.
 */
const getAllPublications = async (req, res) => {
    try {
        const snapshot = await db.collection('publications')
            .where('activo', '==', true)
            .orderBy('fechaCreacion', 'desc')
            .limit(50) // Paginación básica para no traer toda la base de datos
            .get();
        
        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const publications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(publications);

    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
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
