const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * Auth Routes
 * POST /api/v1/auth/login
 * GET  /api/v1/auth/me
 */
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;
