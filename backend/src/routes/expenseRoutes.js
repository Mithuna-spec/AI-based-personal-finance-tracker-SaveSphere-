const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const {
  createExpenseValidation,
  updateExpenseValidation,
  expenseIdValidation,
} = require('../validators/expenseValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All expense routes require JWT authentication
router.use(authenticateToken);

// POST /api/expenses
router.post('/', createExpenseValidation, validateRequest, expenseController.createExpense);

// GET /api/expenses
router.get('/', expenseController.getAllExpenses);

// GET /api/expenses/:id
router.get('/:id', expenseIdValidation, validateRequest, expenseController.getExpenseById);

// PUT /api/expenses/:id
router.put('/:id', updateExpenseValidation, validateRequest, expenseController.updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', expenseIdValidation, validateRequest, expenseController.deleteExpense);

module.exports = router;
