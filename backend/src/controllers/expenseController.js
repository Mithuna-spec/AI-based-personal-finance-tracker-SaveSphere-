const expenseService = require('../services/expenseService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * POST /api/expenses
 */
const createExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newExpense = await expenseService.createExpense(userId, req.body);
    return successResponse(res, 'Expense record added successfully', newExpense, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/expenses
 */
const getAllExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, search, startDate, endDate } = req.query;
    const result = await expenseService.getAllExpenses(userId, { category, search, startDate, endDate });
    return successResponse(res, 'Expense records retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/expenses/:id
 */
const getExpenseById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const expense = await expenseService.getExpenseById(userId, expenseId);
    return successResponse(res, 'Expense record retrieved', expense, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/expenses/:id
 */
const updateExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const updatedExpense = await expenseService.updateExpense(userId, expenseId, req.body);
    return successResponse(res, 'Expense record updated successfully', updatedExpense, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/expenses/:id
 */
const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const result = await expenseService.deleteExpense(userId, expenseId);
    return successResponse(res, 'Expense record deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
