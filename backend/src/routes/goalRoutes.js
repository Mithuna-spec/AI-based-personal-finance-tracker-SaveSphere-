const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const {
  createGoalValidation,
  updateGoalValidation,
  goalIdValidation,
} = require('../validators/goalValidator');
const { validateRequest } = require('../validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// All goal routes require JWT authentication
router.use(authenticateToken);

// POST /api/goals
router.post('/', createGoalValidation, validateRequest, goalController.createGoal);

// GET /api/goals
router.get('/', goalController.getAllGoals);

// GET /api/goals/:id
router.get('/:id', goalIdValidation, validateRequest, goalController.getGoalById);

// PUT /api/goals/:id
router.put('/:id', updateGoalValidation, validateRequest, goalController.updateGoal);

// DELETE /api/goals/:id
router.delete('/:id', goalIdValidation, validateRequest, goalController.deleteGoal);

module.exports = router;
