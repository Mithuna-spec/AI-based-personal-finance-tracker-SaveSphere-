const { body, param, query } = require('express-validator');

const createExpenseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO date (YYYY-MM-DD)'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean value'),
  body('notes')
    .optional({ nullable: true })
    .trim(),
];

const updateExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID parameter is required')
    .isUUID()
    .withMessage('Invalid expense ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Expense title cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date (YYYY-MM-DD)'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean value'),
  body('notes')
    .optional({ nullable: true })
    .trim(),
];

const expenseIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID parameter is required')
    .isUUID()
    .withMessage('Invalid expense ID format'),
];

module.exports = {
  createExpenseValidation,
  updateExpenseValidation,
  expenseIdValidation,
};
