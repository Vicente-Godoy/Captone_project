const express = require('express');
const router = express.Router();

// Importamos el controlador que contiene la lógica de registro
const authController = require('../controllers/authController');
const { validateRegister } = require('../middleware/validation');

// Define la ruta POST para el registro de nuevos usuarios.
// Cuando llegue una petición a /api/auth/register, se ejecutará authController.register
router.post('/register', validateRegister, authController.register);


module.exports = router;
