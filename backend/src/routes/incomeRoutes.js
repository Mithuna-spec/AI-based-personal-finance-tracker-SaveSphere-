const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const {
  createIncomeValidation,
  updateIncomeValidation,
  incomeIdValidation,
} = require('../validators/incomeValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All income routes require JWT authentication
router.use(authenticateToken);

// POST /api/incomes
router.post('/', createIncomeValidation, validateRequest, incomeController.createIncome);

// GET /api/incomes
router.get('/', incomeController.getAllIncomes);

// GET /api/incomes/:id
router.get('/:id', incomeIdValidation, validateRequest, incomeController.getIncomeById);

// PUT /api/incomes/:id
router.put('/:id', updateIncomeValidation, validateRequest, incomeController.updateIncome);

// DELETE /api/incomes/:id
router.delete('/:id', incomeIdValidation, validateRequest, incomeController.deleteIncome);

module.exports = router;
