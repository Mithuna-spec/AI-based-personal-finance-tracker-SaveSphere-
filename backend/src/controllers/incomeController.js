const incomeService = require('../services/incomeService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * POST /api/incomes
 */
const createIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newIncome = await incomeService.createIncome(userId, req.body);
    return successResponse(res, 'Income record added successfully', newIncome, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/incomes
 */
const getAllIncomes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, search } = req.query;
    const result = await incomeService.getAllIncomes(userId, { category, search });
    return successResponse(res, 'Income records retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/incomes/:id
 */
const getIncomeById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    const income = await incomeService.getIncomeById(userId, incomeId);
    return successResponse(res, 'Income record retrieved', income, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/incomes/:id
 */
const updateIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    const updatedIncome = await incomeService.updateIncome(userId, incomeId, req.body);
    return successResponse(res, 'Income record updated successfully', updatedIncome, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/incomes/:id
 */
const deleteIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    const result = await incomeService.deleteIncome(userId, incomeId);
    return successResponse(res, 'Income record deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
