const { body, param } = require('express-validator');

const createEMIValidation = [
  body('loanName')
    .trim()
    .notEmpty()
    .withMessage('Loan name is required')
    .isLength({ min: 2 })
    .withMessage('Loan name must be at least 2 characters long'),
  body('lender')
    .optional({ nullable: true })
    .trim(),
  body('totalAmount')
    .notEmpty()
    .withMessage('Total loan amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Total amount must be a positive number greater than 0'),
  body('monthlyAmount')
    .notEmpty()
    .withMessage('Monthly EMI amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Monthly EMI amount must be a positive number greater than 0'),
  body('interestRate')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Interest rate cannot be negative'),
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
        throw new Error('Loan completion end date must be after start date');
      }
      return true;
    }),
  body('remainingAmount')
    .notEmpty()
    .withMessage('Remaining amount is required')
    .isFloat({ min: 0 })
    .withMessage('Remaining amount cannot be negative'),
];

const updateEMIValidation = [
  param('id')
    .notEmpty()
    .withMessage('EMI ID parameter is required')
    .isUUID()
    .withMessage('Invalid EMI ID format'),
  body('loanName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Loan name cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Loan name must be at least 2 characters long'),
  body('lender')
    .optional({ nullable: true })
    .trim(),
  body('totalAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Total amount must be a positive number greater than 0'),
  body('monthlyAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Monthly EMI amount must be a positive number greater than 0'),
  body('interestRate')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Interest rate cannot be negative'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date (YYYY-MM-DD)'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date (YYYY-MM-DD)'),
  body('remainingAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Remaining amount cannot be negative'),
];

const emiIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('EMI ID parameter is required')
    .isUUID()
    .withMessage('Invalid EMI ID format'),
];

module.exports = {
  createEMIValidation,
  updateEMIValidation,
  emiIdValidation,
};
