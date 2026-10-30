const express = require('express');
const router = express.Router();
const financialAnalysisController = require('../controllers/financialAnalysisController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Require JWT authentication
router.use(authenticateToken);

// GET /api/financial-analysis
router.get('/', financialAnalysisController.getAnalysis);

module.exports = router;
