const prisma = require('../config/db');

/**
 * Create a new income record for the authenticated user
 */
const createIncome = async (userId, data) => {
  const { source, amount, category, frequency, date, notes } = data;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const error = new Error('Income amount must be a positive number greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const newIncome = await prisma.income.create({
    data: {
      userId,
      source,
      amount: parsedAmount,
      category,
      frequency,
      date: new Date(date),
      notes: notes || null,
    },
  });

  return newIncome;
};

/**
 * Get all income records for the authenticated user
 */
const getAllIncomes = async (userId, filters = {}) => {
  const { category, search } = filters;

  const where = { userId };

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { source: { contains: search } },
      { category: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  const incomes = await prisma.income.findMany({
    where,
    orderBy: {
      date: 'desc',
    },
  });

  // Calculate summary metrics
  const totalAmount = incomes.reduce((sum, item) => sum + item.amount, 0);
  const monthlyRecurring = incomes
    .filter((item) => item.frequency === 'MONTHLY')
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    incomes,
    summary: {
      count: incomes.length,
      totalAmount,
      monthlyRecurring,
    },
  };
};

/**
 * Get single income record by ID scoped to user
 */
const getIncomeById = async (userId, incomeId) => {
  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      userId,
    },
  });

  if (!income) {
    const error = new Error('Income record not found');
    error.statusCode = 404;
    throw error;
  }

  return income;
};

/**
 * Update an existing income record scoped to user
 */
const updateIncome = async (userId, incomeId, updateData) => {
  // Ensure record exists and belongs to user
  await getIncomeById(userId, incomeId);

  const payload = {};
  if (updateData.source !== undefined) payload.source = updateData.source;
  if (updateData.amount !== undefined) payload.amount = parseFloat(updateData.amount);
  if (updateData.category !== undefined) payload.category = updateData.category;
  if (updateData.frequency !== undefined) payload.frequency = updateData.frequency;
  if (updateData.date !== undefined) payload.date = new Date(updateData.date);
  if (updateData.notes !== undefined) payload.notes = updateData.notes;

  const updatedIncome = await prisma.income.update({
    where: { id: incomeId },
    data: payload,
  });

  return updatedIncome;
};

/**
 * Delete an income record scoped to user
 */
const deleteIncome = async (userId, incomeId) => {
  // Ensure record exists and belongs to user
  await getIncomeById(userId, incomeId);

  await prisma.income.delete({
    where: { id: incomeId },
  });

  return { id: incomeId };
};

module.exports = {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
