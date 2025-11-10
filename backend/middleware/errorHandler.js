/**
 * Middleware global de manejo de errores
 * Captura todos los errores no manejados y los formatea de manera consistente
 */

const errorHandler = (err, req, res, next) => {
  // Log del error completo para debugging
  console.error('[ERROR HANDLER]', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Errores de Firebase Authentication (código string que empieza con 'auth/')
  if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
    const statusCode = err.code === 'auth/email-already-exists' ? 409 : 400;
    return res.status(statusCode).json({
      error: err.code === 'auth/email-already-exists' 
        ? 'El correo electrónico ya está en uso'
        : 'Error de autenticación',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error al procesar la solicitud'
    });
  }

  // Errores de Firestore (código string que empieza con 'firestore/')
  if (err.code && typeof err.code === 'string' && err.code.startsWith('firestore/')) {
    return res.status(500).json({
      error: 'Error de base de datos',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error al acceder a los datos'
    });
  }

  // Errores de gRPC/Firebase (código numérico)
  if (typeof err.code === 'number') {
    // Código 2 = UNKNOWN (problemas de credenciales/conexión)
    if (err.code === 2) {
      return res.status(503).json({
        error: 'Error de conexión con Firebase',
        message: process.env.NODE_ENV === 'development' 
          ? err.message || 'Error al conectar con los servicios de Firebase'
          : 'Servicio temporalmente no disponible. Intenta más tarde.'
      });
    }
    // Otros códigos de error gRPC
    return res.status(500).json({
      error: 'Error del servicio',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }

  // Errores de validación (cuando se implemente Joi/Zod)
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.details || err.message
    });
  }

  // Errores de autenticación
  if (err.status === 401 || (err.code && typeof err.code === 'string' && err.code === 'auth/invalid-credential')) {
    return res.status(401).json({
      error: 'No autorizado',
      message: err.message || 'Token inválido o expirado'
    });
  }

  // Errores 404
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Recurso no encontrado',
      message: err.message || 'El recurso solicitado no existe'
    });
  }

  // Error por defecto (500)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Wrapper para manejar errores async en rutas
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};

