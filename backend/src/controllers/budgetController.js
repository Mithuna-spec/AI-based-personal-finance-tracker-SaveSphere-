const budgetService = require('../services/budgetService');
const { successResponse } = require('../utils/responseHandler');

/**
 * POST /api/budgets
 */
const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newBudget = await budgetService.createBudget(userId, req.body);
    return successResponse(res, 'Budget created successfully', newBudget, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budgets
 */
const getAllBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period, category } = req.query;
    const result = await budgetService.getAllBudgets(userId, { period, category });
    return successResponse(res, 'Budgets retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budgets/:id
 */
const getBudgetById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const budget = await budgetService.getBudgetById(userId, budgetId);
    return successResponse(res, 'Budget retrieved', budget, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const updatedBudget = await budgetService.updateBudget(userId, budgetId, req.body);
    return successResponse(res, 'Budget updated successfully', updatedBudget, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/budgets/:id
 */
const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const result = await budgetService.deleteBudget(userId, budgetId);
    return successResponse(res, 'Budget deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
