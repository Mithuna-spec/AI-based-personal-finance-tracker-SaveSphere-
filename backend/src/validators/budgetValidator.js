const { body, param } = require('express-validator');

const createBudgetValidation = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('amount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number greater than 0'),
  body('period')
    .trim()
    .notEmpty()
    .withMessage('Period is required')
    .isIn(['MONTHLY', 'YEARLY'])
    .withMessage('Period must be MONTHLY or YEARLY'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date (YYYY-MM-DD)'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const updateBudgetValidation = [
  param('id')
    .notEmpty()
    .withMessage('Budget ID parameter is required')
    .isUUID()
    .withMessage('Invalid budget ID format'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number greater than 0'),
  body('period')
    .optional()
    .trim()
    .isIn(['MONTHLY', 'YEARLY'])
    .withMessage('Period must be MONTHLY or YEARLY'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date (YYYY-MM-DD)'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date (YYYY-MM-DD)'),
];

const budgetIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Budget ID parameter is required')
    .isUUID()
    .withMessage('Invalid budget ID format'),
];

module.exports = {
  createBudgetValidation,
  updateBudgetValidation,
  budgetIdValidation,
};
