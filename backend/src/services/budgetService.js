const prisma = require('../config/db');

/**
 * Create a new category budget for the authenticated user
 */
const createBudget = async (userId, data) => {
  const { category, amount, period, startDate, endDate } = data;

  const newBudget = await prisma.budget.create({
    data: {
      userId,
      category,
      amount: parseFloat(amount),
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return newBudget;
};

/**
 * Get all budgets for user with real expense utilization calculated
 */
const getAllBudgets = async (userId, filters = {}) => {
  const { period, category } = filters;

  const where = { userId };
  if (period && period !== 'ALL') {
    where.period = period;
  }
  if (category && category !== 'ALL') {
    where.category = category;
  }

  const budgets = await prisma.budget.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all user expenses to compute real category spending
  const expenses = await prisma.expense.findMany({
    where: { userId },
  });

  // Attach utilization metrics to each budget
  const processedBudgets = budgets.map((b) => {
    // Filter actual expenses matching this category within budget time range
    const categoryExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const isCategoryMatch = exp.category.toLowerCase() === b.category.toLowerCase();
      const isAfterStart = expDate >= new Date(b.startDate);
      const isBeforeEnd = expDate <= new Date(b.endDate);
      return isCategoryMatch && isAfterStart && isBeforeEnd;
    });

    const spentAmount = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
    const remainingAmount = b.amount - spentAmount;
    const utilizationPercentage = b.amount > 0 ? (spentAmount / b.amount) * 100 : 0;
    const isOverBudget = spentAmount > b.amount;

    return {
      ...b,
      utilization: {
        spentAmount: Math.round(spentAmount * 100) / 100,
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        percentage: Math.min(Math.round(utilizationPercentage * 10) / 10, 999.9),
        isOverBudget,
        expenseCount: categoryExpenses.length,
      },
    };
  });

  // Summary statistics across all budgets
  const totalBudgeted = processedBudgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = processedBudgets.reduce((sum, item) => sum + item.utilization.spentAmount, 0);
  const totalOverBudgetCount = processedBudgets.filter((b) => b.utilization.isOverBudget).length;

  return {
    budgets: processedBudgets,
    summary: {
      count: processedBudgets.length,
      totalBudgeted,
      totalSpent,
      totalOverBudgetCount,
    },
  };
};

/**
 * Get single budget by ID scoped to authenticated user
 */
const getBudgetById = async (userId, budgetId) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    const error = new Error('Budget record not found');
    error.statusCode = 404;
    throw error;
  }

  return budget;
};

/**
 * Update budget scoped to user
 */
const updateBudget = async (userId, budgetId, updateData) => {
  await getBudgetById(userId, budgetId);

  const payload = {};
  if (updateData.category !== undefined) payload.category = updateData.category;
  if (updateData.amount !== undefined) payload.amount = parseFloat(updateData.amount);
  if (updateData.period !== undefined) payload.period = updateData.period;
  if (updateData.startDate !== undefined) payload.startDate = new Date(updateData.startDate);
  if (updateData.endDate !== undefined) payload.endDate = new Date(updateData.endDate);

  const updatedBudget = await prisma.budget.update({
    where: { id: budgetId },
    data: payload,
  });

  return updatedBudget;
};

/**
 * Delete budget scoped to user
 */
const deleteBudget = async (userId, budgetId) => {
  await getBudgetById(userId, budgetId);

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  return { id: budgetId };
};

module.exports = {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
