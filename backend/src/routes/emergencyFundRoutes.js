const express = require('express');
const router = express.Router();
const emergencyFundController = require('../controllers/emergencyFundController');
const {
  createOrUpdateEmergencyFundValidation,
  fundIdValidation,
} = require('../validators/emergencyFundValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All emergency fund routes require JWT authentication
router.use(authenticateToken);

// GET /api/emergency-fund
router.get('/', emergencyFundController.getEmergencyFund);

// POST /api/emergency-fund
router.post(
  '/',
  createOrUpdateEmergencyFundValidation,
  validateRequest,
  emergencyFundController.saveEmergencyFund
);

// DELETE /api/emergency-fund/:id
router.delete('/:id', fundIdValidation, validateRequest, emergencyFundController.deleteEmergencyFund);

module.exports = router;
