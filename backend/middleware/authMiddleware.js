const { auth } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado o en formato incorrecto.' });
  }

  // Extrae el token, quitando el prefijo "Bearer "
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verifica el token usando el SDK de Admin.
    // Si el token es inválido (expirado, malformado), esto lanzará un error.
    const decodedToken = await auth.verifyIdToken(idToken);

    // Si el token es válido, adjuntamos la información del usuario al objeto 'req'.
    // Esto permite que los siguientes controladores sepan quién está haciendo la petición.
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      rol: decodedToken.rol || 'USER' // Si usas custom claims para roles
    };

    // Llama a next() para pasar el control al siguiente middleware o al controlador final.
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return res.status(403).json({ error: 'Acceso prohibido. El token es inválido o ha expirado.' });
  }
};

module.exports = authMiddleware;
