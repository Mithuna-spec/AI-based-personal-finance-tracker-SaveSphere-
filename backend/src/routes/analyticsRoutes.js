const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All analytics routes require JWT authentication
router.use(authenticateToken);

// GET /api/analytics
router.get('/', analyticsController.getAnalytics);

module.exports = router;
