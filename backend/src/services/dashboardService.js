const prisma = require('../config/db');
const { getUserEMIObligations } = require('./emiService');

/**
 * Get comprehensive financial dashboard summary for authenticated user
 */
const getDashboardSummary = async (userId) => {
  // Fetch all income records for user
  const incomes = await prisma.income.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  // Fetch all expense records for user
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  // Fetch EMI obligations for user
  const emiObligations = await getUserEMIObligations(userId);

  // Total Income & Total Expenses
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Net Cash Flow / Savings
  const netCashFlow = totalIncome - totalExpenses;

  // Recurring Expenses
  const recurringExpenses = expenses
    .filter((item) => item.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);

  // Available Money = Total Income - Total Expenses - Recurring Expenses - Monthly EMI Commitments
  const availableMoney = Math.max(
    0,
    totalIncome - totalExpenses - recurringExpenses - emiObligations.totalMonthlyEMI
  );

  // Current Month Boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Income & Expenses This Month
  const incomeThisMonth = incomes
    .filter((item) => new Date(item.date) >= startOfMonth && new Date(item.date) <= endOfMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const expensesThisMonth = expenses
    .filter((item) => new Date(item.date) >= startOfMonth && new Date(item.date) <= endOfMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  // Combine Recent Transactions (Top 6)
  const combinedTransactions = [
    ...incomes.map((inc) => ({
      id: inc.id,
      type: 'INCOME',
      title: inc.source,
      amount: inc.amount,
      category: inc.category,
      date: inc.date,
      notes: inc.notes,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: 'EXPENSE',
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      notes: exp.notes,
      isRecurring: exp.isRecurring,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return {
    metrics: {
      totalIncome,
      totalExpenses,
      netCashFlow,
      availableMoney,
      recurringExpenses,
      totalMonthlyEMI: emiObligations.totalMonthlyEMI,
      totalRemainingDebt: emiObligations.totalRemainingDebt,
      incomeThisMonth,
      expensesThisMonth,
      netThisMonth: incomeThisMonth - expensesThisMonth,
    },
    counts: {
      incomesCount: incomes.length,
      expensesCount: expenses.length,
      activeLoansCount: emiObligations.activeLoansCount,
      totalTransactions: incomes.length + expenses.length,
    },
    recentTransactions: combinedTransactions,
  };
};

module.exports = {
  getDashboardSummary,
};
