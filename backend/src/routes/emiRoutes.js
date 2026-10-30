const express = require('express');
const router = express.Router();
const emiController = require('../controllers/emiController');
const {
  createEMIValidation,
  updateEMIValidation,
  emiIdValidation,
} = require('../validators/emiValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All EMI routes require JWT authentication
router.use(authenticateToken);

// POST /api/emis
router.post('/', createEMIValidation, validateRequest, emiController.createEMI);

// GET /api/emis
router.get('/', emiController.getAllEMIs);

// GET /api/emis/:id
router.get('/:id', emiIdValidation, validateRequest, emiController.getEMIById);

// PUT /api/emis/:id
router.put('/:id', updateEMIValidation, validateRequest, emiController.updateEMI);

// DELETE /api/emis/:id
router.delete('/:id', emiIdValidation, validateRequest, emiController.deleteEMI);

module.exports = router;
