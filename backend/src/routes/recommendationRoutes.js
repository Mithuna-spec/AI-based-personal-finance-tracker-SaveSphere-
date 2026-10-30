const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Require authentication for all recommendation routes
router.use(authenticateToken);

// GET /api/recommendations (Personalized AI Recommendations)
router.get('/', recommendationController.getPersonalizedRecommendations);

// GET /api/recommendations/personalized
router.get('/personalized', recommendationController.getPersonalizedRecommendations);

// GET /api/recommendations/allocation (Deterministic Money Allocation)
router.get('/allocation', recommendationController.getAllocationRecommendation);

module.exports = router;
