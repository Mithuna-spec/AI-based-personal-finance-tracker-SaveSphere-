const prisma = require('../config/db');

/**
 * Create a new financial goal
 */
const createGoal = async (userId, data) => {
  const { title, targetAmount, currentAmount, targetDate, priority, category, status } = data;

  const initialCurrentAmount = currentAmount ? parseFloat(currentAmount) : 0.0;
  const parsedTargetAmount = parseFloat(targetAmount);

  // Auto set status to ACHIEVED if currentAmount >= targetAmount
  const initialStatus =
    status || (initialCurrentAmount >= parsedTargetAmount ? 'ACHIEVED' : 'IN_PROGRESS');

  const newGoal = await prisma.financialGoal.create({
    data: {
      userId,
      title,
      targetAmount: parsedTargetAmount,
      currentAmount: initialCurrentAmount,
      targetDate: new Date(targetDate),
      priority: priority || 'MEDIUM',
      category: category || 'SAVINGS',
      status: initialStatus,
    },
  });

  return newGoal;
};

/**
 * Helper to calculate remaining months between two dates
 */
const calculateRemainingMonths = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);

  const yearDiff = target.getFullYear() - now.getFullYear();
  const monthDiff = target.getMonth() - now.getMonth();

  const totalMonths = yearDiff * 12 + monthDiff;
  return totalMonths;
};

/**
 * Get all financial goals for user with deterministic calculations & feasibility status
 */
const getAllGoals = async (userId, filters = {}) => {
  const { priority, status, category } = filters;

  const where = { userId };
  if (priority && priority !== 'ALL') where.priority = priority;
  if (status && status !== 'ALL') where.status = status;
  if (category && category !== 'ALL') where.category = category;

  const goals = await prisma.financialGoal.findMany({
    where,
    orderBy: { targetDate: 'asc' },
  });

  // Query user's income, expenses, and EMI obligations to establish net monthly savings capacity
  const incomes = await prisma.income.findMany({ where: { userId } });
  const expenses = await prisma.expense.findMany({ where: { userId } });
  const emis = await prisma.eMI.findMany({ where: { userId } });

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const activeEMIs = emis.filter((e) => e.remainingAmount > 0);
  const totalMonthlyEMI = activeEMIs.reduce((sum, item) => sum + item.monthlyAmount, 0);

  // Net monthly savings capacity considering income, expenses, and EMI commitments
  const availableMonthlyCapacity = Math.max(0, totalIncome - totalExpenses - totalMonthlyEMI);

  const processedGoals = goals.map((goal) => {
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    const progressPercentage =
      goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

    const remainingMonths = calculateRemainingMonths(goal.targetDate);
    const isOverdue = remainingMonths < 0 && remainingAmount > 0;
    const isAchieved = goal.status === 'ACHIEVED' || remainingAmount <= 0;

    // Required Monthly Savings calculation
    let requiredMonthlySavings = 0;
    if (isAchieved) {
      requiredMonthlySavings = 0;
    } else if (remainingMonths <= 0) {
      requiredMonthlySavings = remainingAmount;
    } else {
      requiredMonthlySavings = remainingAmount / remainingMonths;
    }

    // Deterministic Feasibility Classification
    let feasibilityStatus = 'ACHIEVABLE';
    let feasibilityReason = '';

    if (isAchieved) {
      feasibilityStatus = 'ACHIEVED';
      feasibilityReason = 'Goal target amount successfully accumulated!';
    } else if (isOverdue) {
      feasibilityStatus = 'OVERDUE';
      feasibilityReason = `Deadline passed with ${remainingAmount.toFixed(2)} remaining.`;
    } else if (requiredMonthlySavings <= availableMonthlyCapacity) {
      feasibilityStatus = 'ACHIEVABLE';
      feasibilityReason = `Required savings (${requiredMonthlySavings.toFixed(
        2
      )}/mo) fits comfortably within net monthly capacity (${availableMonthlyCapacity.toFixed(
        2
      )}/mo, after EMIs).`;
    } else if (requiredMonthlySavings <= availableMonthlyCapacity * 1.3) {
      feasibilityStatus = 'AT_RISK';
      feasibilityReason = `Required savings (${requiredMonthlySavings.toFixed(
        2
      )}/mo) slightly exceeds net monthly capacity (${availableMonthlyCapacity.toFixed(
        2
      )}/mo, after EMIs).`;
    } else {
      feasibilityStatus = 'NOT_CURRENTLY_FEASIBLE';
      feasibilityReason = `Required monthly savings (${requiredMonthlySavings.toFixed(
        2
      )}/mo) exceeds available net capacity (${availableMonthlyCapacity.toFixed(2)}/mo, after EMIs).`;
    }

    return {
      ...goal,
      calculations: {
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        progressPercentage: Math.min(Math.round(progressPercentage * 10) / 10, 100),
        remainingMonths: Math.max(0, remainingMonths),
        requiredMonthlySavings: Math.round(requiredMonthlySavings * 100) / 100,
        availableMonthlyCapacity: Math.round(availableMonthlyCapacity * 100) / 100,
        isAchieved,
        isOverdue,
        feasibilityStatus,
        feasibilityReason,
      },
    };
  });

  // Metrics summary
  const totalTargetAmount = processedGoals.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalCurrentAmount = processedGoals.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalRequiredMonthly = processedGoals
    .filter((g) => !g.calculations.isAchieved)
    .reduce((sum, item) => sum + item.calculations.requiredMonthlySavings, 0);

  return {
    goals: processedGoals,
    summary: {
      count: processedGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
      totalRequiredMonthly,
      availableMonthlyCapacity,
      totalMonthlyEMI,
      achievedCount: processedGoals.filter((g) => g.calculations.isAchieved).length,
      atRiskCount: processedGoals.filter((g) => g.calculations.feasibilityStatus === 'AT_RISK')
        .length,
      unfeasibleCount: processedGoals.filter(
        (g) => g.calculations.feasibilityStatus === 'NOT_CURRENTLY_FEASIBLE'
      ).length,
    },
  };
};

/**
 * Get single goal by ID scoped to user
 */
const getGoalById = async (userId, goalId) => {
  const goal = await prisma.financialGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    const error = new Error('Financial goal record not found');
    error.statusCode = 404;
    throw error;
  }

  return goal;
};

/**
 * Update financial goal scoped to user
 */
const updateGoal = async (userId, goalId, updateData) => {
  const existingGoal = await getGoalById(userId, goalId);

  const payload = {};
  if (updateData.title !== undefined) payload.title = updateData.title;
  if (updateData.targetAmount !== undefined)
    payload.targetAmount = parseFloat(updateData.targetAmount);
  if (updateData.currentAmount !== undefined)
    payload.currentAmount = parseFloat(updateData.currentAmount);
  if (updateData.targetDate !== undefined) payload.targetDate = new Date(updateData.targetDate);
  if (updateData.priority !== undefined) payload.priority = updateData.priority;
  if (updateData.category !== undefined) payload.category = updateData.category;
  if (updateData.status !== undefined) payload.status = updateData.status;

  const newTarget = payload.targetAmount || existingGoal.targetAmount;
  const newCurrent = payload.currentAmount !== undefined ? payload.currentAmount : existingGoal.currentAmount;

  if (newCurrent >= newTarget && payload.status !== 'PAUSED') {
    payload.status = 'ACHIEVED';
  }

  const updatedGoal = await prisma.financialGoal.update({
    where: { id: goalId },
    data: payload,
  });

  return updatedGoal;
};

/**
 * Delete financial goal scoped to user
 */
const deleteGoal = async (userId, goalId) => {
  await getGoalById(userId, goalId);

  await prisma.financialGoal.delete({
    where: { id: goalId },
  });

  return { id: goalId };
};

module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};
