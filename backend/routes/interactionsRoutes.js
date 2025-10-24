const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { likePublication, getMyMatches } = require('../controllers/interactionsController');

// Protegidas
router.post('/like', authMiddleware, likePublication);
router.get('/matches', authMiddleware, getMyMatches);

module.exports = router;

