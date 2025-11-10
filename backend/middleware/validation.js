/**
 * Middleware de validación de entrada
 * Valida y sanitiza datos de entrada antes de llegar a los controladores
 */

const sanitizeString = (value, options = {}) => {
  if (value === null || value === undefined) {
    return options.allowNull ? null : undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const { maxLength = 1000, minLength = 0, trim = true } = options;
  let sanitized = trim ? value.trim() : value;
  
  // Remover caracteres peligrosos para XSS
  sanitized = sanitized.replace(/[<>]/g, '');
  
  if (sanitized.length < minLength || sanitized.length > maxLength) {
    return undefined;
  }
  return sanitized;
};

const sanitizeEmail = (value) => {
  const email = sanitizeString(value, { maxLength: 254 });
  if (!email) return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email.toLowerCase() : undefined;
};

const sanitizeArray = (value, options = {}) => {
  if (!Array.isArray(value)) return undefined;
  const { maxItems = 100, itemValidator } = options;
  if (value.length > maxItems) return undefined;
  if (itemValidator) {
    return value.filter(item => itemValidator(item));
  }
  return value;
};

const sanitizeNumber = (value, options = {}) => {
  const { min, max, integer = false } = options;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  if (integer && !Number.isInteger(num)) return undefined;
  if (min !== undefined && num < min) return undefined;
  if (max !== undefined && num > max) return undefined;
  return num;
};

/**
 * Validador para creación de publicaciones
 */
const validatePublication = (req, res, next) => {
  const errors = [];
  
  // Validar título (soporta ambos formatos)
  const title = sanitizeString(req.body.title || req.body.titulo, { 
    maxLength: 200, 
    minLength: 1 
  });
  if (!title) {
    errors.push('El título es obligatorio y debe tener entre 1 y 200 caracteres');
  }
  
  // Validar contenido (opcional pero si existe debe ser válido)
  const content = req.body.content || req.body.descripcion;
  if (content !== undefined && content !== null) {
    const sanitizedContent = sanitizeString(content, { maxLength: 5000 });
    if (!sanitizedContent && content !== '') {
      errors.push('El contenido no puede exceder 5000 caracteres');
    }
  }
  
  // Validar imageUrl si existe
  if (req.body.imageUrl !== undefined && req.body.imageUrl !== null) {
    const imageUrl = sanitizeString(req.body.imageUrl, { maxLength: 2048 });
    if (!imageUrl && req.body.imageUrl !== '') {
      errors.push('La URL de la imagen no es válida');
    }
  }
  
  // Validar tags si existe
  if (req.body.tags !== undefined) {
    const tags = sanitizeArray(req.body.tags, {
      maxItems: 20,
      itemValidator: (tag) => {
        const sanitized = sanitizeString(tag, { maxLength: 50, minLength: 1 });
        return sanitized !== undefined;
      }
    });
    if (tags === undefined) {
      errors.push('Los tags deben ser un array con máximo 20 elementos, cada uno con máximo 50 caracteres');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Error de validación',
      details: errors
    });
  }
  
  // Sanitizar y normalizar datos antes de pasar al controlador
  req.body.title = title || req.body.titulo;
  req.body.content = content ? sanitizeString(content, { maxLength: 5000 }) : null;
  if (req.body.tags) {
    req.body.tags = sanitizeArray(req.body.tags, {
      maxItems: 20,
      itemValidator: (tag) => sanitizeString(tag, { maxLength: 50, minLength: 1 })
    }) || [];
  }
  
  next();
};

/**
 * Validador para registro de usuarios
 */
const validateRegister = (req, res, next) => {
  const errors = [];
  
  const email = sanitizeEmail(req.body.email);
  if (!email) {
    errors.push('El email es obligatorio y debe tener un formato válido');
  }
  
  const password = req.body.password;
  const MIN_PASSWORD_LENGTH = Number(process.env.MIN_PASSWORD_LENGTH || 12);
  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  
  const nombre = sanitizeString(req.body.nombre, { maxLength: 80, minLength: 1 });
  if (!nombre) {
    errors.push('El nombre es obligatorio y debe tener entre 1 y 80 caracteres');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Error de validación',
      details: errors
    });
  }
  
  // Sanitizar datos
  req.body.email = email;
  req.body.nombre = nombre;
  
  next();
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizeArray,
  sanitizeNumber,
  validatePublication,
  validateRegister
};



