const { body, param } = require('express-validator');

const createOrUpdateEmergencyFundValidation = [
  body('essentialMonthlyExpenses')
    .notEmpty()
    .withMessage('Essential monthly expenses amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Essential monthly expenses must be a positive number greater than 0'),
  body('targetMonths')
    .optional()
    .isInt({ min: 1, max: 36 })
    .withMessage('Target months must be an integer between 1 and 36'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current savings amount cannot be negative'),
];

const fundIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Emergency Fund ID parameter is required')
    .isUUID()
    .withMessage('Invalid emergency fund ID format'),
];

module.exports = {
  createOrUpdateEmergencyFundValidation,
  fundIdValidation,
};
