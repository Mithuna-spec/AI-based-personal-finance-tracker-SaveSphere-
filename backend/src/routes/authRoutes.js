const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', registerValidation, validateRequest, authController.register);

// POST /api/auth/login
router.post('/login', loginValidation, validateRequest, authController.login);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, authController.getMe);

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, authController.updateProfile);

// PUT /api/auth/change-password (Protected)
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
