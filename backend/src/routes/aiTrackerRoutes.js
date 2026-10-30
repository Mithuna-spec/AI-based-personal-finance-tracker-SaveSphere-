const express = require('express');
const router = express.Router();
const aiTrackerController = require('../controllers/aiTrackerController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Require authentication
router.use(authenticateToken);

// GET /api/ai-tracker
router.get('/', aiTrackerController.getAITrackerInsights);

module.exports = router;
