const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getSignedUploadUrl } = require('../controllers/storageController');

router.post('/signed-uploads', authMiddleware, getSignedUploadUrl);

module.exports = router;



