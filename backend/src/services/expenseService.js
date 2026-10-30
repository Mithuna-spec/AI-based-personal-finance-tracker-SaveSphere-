const prisma = require('../config/db');

/**
 * Create a new expense record for the authenticated user
 */
const createExpense = async (userId, data) => {
  const { title, amount, category, date, isRecurring, notes } = data;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const error = new Error('Expense amount must be a positive number greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const newExpense = await prisma.expense.create({
    data: {
      userId,
      title,
      amount: parsedAmount,
      category,
      date: new Date(date),
      isRecurring: Boolean(isRecurring),
      notes: notes || null,
    },
  });

  return newExpense;
};

/**
 * Get all expense records for the authenticated user with optional filters
 */
const getAllExpenses = async (userId, filters = {}) => {
  const { category, search, startDate, endDate } = filters;

  const where = { userId };

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { category: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: {
      date: 'desc',
    },
  });

  // Calculate summary statistics
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const recurringAmount = expenses
    .filter((item) => item.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    expenses,
    summary: {
      count: expenses.length,
      totalAmount,
      recurringAmount,
    },
  };
};

/**
 * Get single expense record by ID scoped to authenticated user
 */
const getExpenseById = async (userId, expenseId) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
  });

  if (!expense) {
    const error = new Error('Expense record not found');
    error.statusCode = 404;
    throw error;
  }

  return expense;
};

/**
 * Update an existing expense record scoped to authenticated user
 */
const updateExpense = async (userId, expenseId, updateData) => {
  // Ensure record exists and belongs to user
  await getExpenseById(userId, expenseId);

  const payload = {};
  if (updateData.title !== undefined) payload.title = updateData.title;
  if (updateData.amount !== undefined) payload.amount = parseFloat(updateData.amount);
  if (updateData.category !== undefined) payload.category = updateData.category;
  if (updateData.date !== undefined) payload.date = new Date(updateData.date);
  if (updateData.isRecurring !== undefined) payload.isRecurring = Boolean(updateData.isRecurring);
  if (updateData.notes !== undefined) payload.notes = updateData.notes;

  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data: payload,
  });

  return updatedExpense;
};

/**
 * Delete an expense record scoped to authenticated user
 */
const deleteExpense = async (userId, expenseId) => {
  // Ensure record exists and belongs to user
  await getExpenseById(userId, expenseId);

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  return { id: expenseId };
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
