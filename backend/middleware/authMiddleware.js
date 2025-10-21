const { auth } = require('../config/firebase');

/**
 * Middleware para verificar el token de Firebase ID enviado por el frontend.
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Verificar que el Headres (POSTMAN) 'Authorization' exista y tenga el formato 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado: Token no proporcionado o formato incorrecto.' });
    }

    // 2. Extrae el token del encabezado.
    const idToken = authHeader.split('Bearer ')[1];

    try {
        // 3. Usa el SDK de Admin para verificar la validez del token con los servidores de Firebase.
        // Si el token es inválido (expirado, malformado, etc.), esto lanzará un error.
        const decodedToken = await auth.verifyIdToken(idToken);

        // 4. Si el token es válido, se adjunta la información del usuario al objeto 'req'.
        req.user = decodedToken;
        
        // 5. Pasa el control al siguiente middleware o al controlador final de la ruta.
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({ error: 'No autorizado: Token inválido.' });
    }
};

module.exports = authMiddleware;

