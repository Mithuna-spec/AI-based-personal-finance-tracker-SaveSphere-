const { body, param } = require('express-validator');

const createGoalValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Goal title is required')
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('targetAmount')
    .notEmpty()
    .withMessage('Target amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number greater than 0'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current amount cannot be negative'),
  body('targetDate')
    .notEmpty()
    .withMessage('Target date is required')
    .isISO8601()
    .withMessage('Target date must be a valid ISO date (YYYY-MM-DD)'),
  body('priority')
    .trim()
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('Priority must be HIGH, MEDIUM, or LOW'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['SAVINGS', 'INVESTMENT', 'PURCHASE', 'RETIREMENT', 'OTHER'])
    .withMessage('Category must be SAVINGS, INVESTMENT, PURCHASE, RETIREMENT, or OTHER'),
  body('status')
    .optional()
    .trim()
    .isIn(['IN_PROGRESS', 'ACHIEVED', 'PAUSED'])
    .withMessage('Status must be IN_PROGRESS, ACHIEVED, or PAUSED'),
];

const updateGoalValidation = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID parameter is required')
    .isUUID()
    .withMessage('Invalid goal ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number greater than 0'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current amount cannot be negative'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid ISO date (YYYY-MM-DD)'),
  body('priority')
    .optional()
    .trim()
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('Priority must be HIGH, MEDIUM, or LOW'),
  body('category')
    .optional()
    .trim()
    .isIn(['SAVINGS', 'INVESTMENT', 'PURCHASE', 'RETIREMENT', 'OTHER'])
    .withMessage('Category must be SAVINGS, INVESTMENT, PURCHASE, RETIREMENT, or OTHER'),
  body('status')
    .optional()
    .trim()
    .isIn(['IN_PROGRESS', 'ACHIEVED', 'PAUSED'])
    .withMessage('Status must be IN_PROGRESS, ACHIEVED, or PAUSED'),
];

const goalIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID parameter is required')
    .isUUID()
    .withMessage('Invalid goal ID format'),
];

module.exports = {
  createGoalValidation,
  updateGoalValidation,
  goalIdValidation,
};
