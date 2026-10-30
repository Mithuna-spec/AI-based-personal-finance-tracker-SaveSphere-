const goalService = require('../services/goalService');
const { successResponse } = require('../utils/responseHandler');

/**
 * POST /api/goals
 */
const createGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newGoal = await goalService.createGoal(userId, req.body);
    return successResponse(res, 'Financial goal created successfully', newGoal, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/goals
 */
const getAllGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { priority, status, category } = req.query;
    const result = await goalService.getAllGoals(userId, { priority, status, category });
    return successResponse(res, 'Financial goals retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/goals/:id
 */
const getGoalById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.getGoalById(userId, goalId);
    return successResponse(res, 'Financial goal retrieved', goal, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/goals/:id
 */
const updateGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const updatedGoal = await goalService.updateGoal(userId, goalId, req.body);
    return successResponse(res, 'Financial goal updated successfully', updatedGoal, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/goals/:id
 */
const deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const result = await goalService.deleteGoal(userId, goalId);
    return successResponse(res, 'Financial goal deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};
