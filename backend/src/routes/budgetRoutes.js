const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const {
  createBudgetValidation,
  updateBudgetValidation,
  budgetIdValidation,
} = require('../validators/budgetValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All budget routes require JWT authentication
router.use(authenticateToken);

// POST /api/budgets
router.post('/', createBudgetValidation, validateRequest, budgetController.createBudget);

// GET /api/budgets
router.get('/', budgetController.getAllBudgets);

// GET /api/budgets/:id
router.get('/:id', budgetIdValidation, validateRequest, budgetController.getBudgetById);

// PUT /api/budgets/:id
router.put('/:id', updateBudgetValidation, validateRequest, budgetController.updateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', budgetIdValidation, validateRequest, budgetController.deleteBudget);

module.exports = router;
