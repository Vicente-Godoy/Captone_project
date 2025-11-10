const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publicationsController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePublication } = require('../middleware/validation');

// --- Rutas Públicas ---
// Cualquiera puede ver el listado de publicaciones o una publicación específica.
router.get('/', publicationsController.getAllPublications);
router.get('/:publicationId', publicationsController.getPublicationById);

// --- Rutas Protegidas ---
// Solo un usuario autenticado puede crear una nueva publicación.
router.post('/', authMiddleware, validatePublication, publicationsController.createPublication);

// Aquí irán las rutas para actualizar (PUT) y eliminar (DELETE), también protegidas.


module.exports = router;
