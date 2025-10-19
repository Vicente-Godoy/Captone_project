// Importamos la instancia de la base de datos
const { db } = require('../config/firebase');

/**
 * Obtiene el perfil completo del usuario que está actualmente autenticado.
 */
const getMyProfile = async (req, res) => {
  try {
    // El UID del usuario se adjuntó en el authMiddleware
    const { uid } = req.user;
    
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Perfil de usuario no encontrado.' });
    }

    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error("Error al obtener mi perfil:", error);
    res.status(500).json({ error: 'No se pudo obtener el perfil del usuario.' });
  }
};

/**
 * Actualiza el perfil del usuario autenticado.
 */
const updateMyProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { nombre, bio, fotoUrl, ciudad, region } = req.body;

    const userRef = db.collection('users').doc(uid);
    const updateData = {};

    // Añadimos al objeto de actualización solo los campos que vienen en la petición
    if (nombre) updateData.nombre = nombre;
    if (bio) updateData.bio = bio;
    if (fotoUrl) updateData.fotoUrl = fotoUrl;
    if (ciudad) updateData.ciudad = ciudad;
    if (region) updateData.region = region;
    
    // Si no se envió ningún dato, devolvemos un error.
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
    }

    updateData.fechaActualizacion = new Date();

    await userRef.update(updateData);

    res.status(200).json({ message: 'Perfil actualizado con éxito.' });
  } catch (error) {
    console.error("Error al actualizar mi perfil:", error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil.' });
  }
};

/**
 * Obtiene el perfil público de cualquier usuario por su ID.
 * Solo expone información no sensible.
 */
const getUserProfileById = async (req, res) => {
    try {
        const { userId } = req.params; // El ID del usuario que queremos ver
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const userData = userDoc.data();
        
        // Creamos un objeto con solo la información pública
        const publicProfile = {
            id: userDoc.id,
            nombre: userData.nombre,
            fotoUrl: userData.fotoUrl,
            bio: userData.bio,
            ciudad: userData.ciudad,
            region: userData.region,
            fechaCreacion: userData.fechaCreacion
        };

        res.status(200).json(publicProfile);
    } catch (error) {
        console.error("Error al obtener perfil público:", error);
        res.status(500).json({ error: 'No se pudo obtener el perfil del usuario.' });
    }
};


module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserProfileById
};
