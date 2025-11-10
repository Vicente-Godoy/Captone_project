const { auth, db } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Controlador para registrar un nuevo usuario.
 */
const register = asyncHandler(async (req, res) => {
  // Los datos ya vienen sanitizados del middleware de validación
  const { email, password, nombre } = req.body;

  // 1. Crear el usuario en Firebase Authentication
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: nombre,
  });

  // 2. Crear un documento de perfil de usuario en la colección 'users' de Firestore.
  // Usamos el UID de Authentication como el ID del documento para mantenerlos vinculados.
  const userProfile = {
    nombre: nombre,
    email: email,
    fechaCreacion: new Date(),
    rol: 'USER', // Rol por defecto
    fotoUrl: null,
    bio: null,
  };

  // Escribimos el documento en Firestore
  await db.collection('users').doc(userRecord.uid).set(userProfile);

  // 3. Respuesta
  return res.status(201).json({
    message: "Usuario registrado con éxito.",
    uid: userRecord.uid
  });
});

module.exports = { register };

