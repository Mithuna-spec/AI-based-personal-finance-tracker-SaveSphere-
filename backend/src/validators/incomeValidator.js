const { body, param, query } = require('express-validator');

const createIncomeValidation = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Income source is required')
    .isLength({ min: 2 })
    .withMessage('Source must be at least 2 characters long'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('frequency')
    .trim()
    .notEmpty()
    .withMessage('Frequency is required')
    .isIn(['MONTHLY', 'ONE_TIME', 'ANNUALLY', 'WEEKLY'])
    .withMessage('Frequency must be MONTHLY, ONE_TIME, ANNUALLY, or WEEKLY'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO date (YYYY-MM-DD)'),
  body('notes')
    .optional({ nullable: true })
    .trim(),
];

const updateIncomeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Income ID parameter is required')
    .isUUID()
    .withMessage('Invalid income ID format'),
  body('source')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Income source cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Source must be at least 2 characters long'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('frequency')
    .optional()
    .trim()
    .isIn(['MONTHLY', 'ONE_TIME', 'ANNUALLY', 'WEEKLY'])
    .withMessage('Frequency must be MONTHLY, ONE_TIME, ANNUALLY, or WEEKLY'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date (YYYY-MM-DD)'),
  body('notes')
    .optional({ nullable: true })
    .trim(),
];

const incomeIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Income ID parameter is required')
    .isUUID()
    .withMessage('Invalid income ID format'),
];

module.exports = {
  createIncomeValidation,
  updateIncomeValidation,
  incomeIdValidation,
};
