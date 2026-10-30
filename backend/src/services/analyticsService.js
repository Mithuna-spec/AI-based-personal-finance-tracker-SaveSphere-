const prisma = require('../config/db');

/**
 * Helper to get month label (e.g., "Oct 2026")
 */
const formatMonthYearKey = (dateObj) => {
  const d = new Date(dateObj);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Get comprehensive aggregated financial analytics for authenticated user
 */
const getAnalyticsData = async (userId, timeframeMonths = 6) => {
  const monthsLimit = parseInt(timeframeMonths, 10) || 6;

  // Calculate start date boundary based on timeframe
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsLimit + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  // Fetch all user records
  const [incomes, expenses, budgets, goals, emis] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.financialGoal.findMany({ where: { userId } }),
    prisma.eMI.findMany({ where: { userId } }),
  ]);

  // ----------------------------------------------------
  // 1. Monthly Trends Aggregation (Income, Expenses, Savings)
  // ----------------------------------------------------
  const monthlyMap = {};

  // Initialize all months in the timeframe
  const current = new Date(startDate);
  const now = new Date();
  while (current <= now || current.getMonth() === now.getMonth()) {
    const key = formatMonthYearKey(current);
    monthlyMap[key] = {
      month: key,
      income: 0,
      expenses: 0,
      savings: 0,
    };
    current.setMonth(current.getMonth() + 1);
  }

  // Aggregate incomes into monthly buckets
  incomes.forEach((inc) => {
    const key = formatMonthYearKey(inc.date);
    if (monthlyMap[key]) {
      monthlyMap[key].income += inc.amount;
    }
  });

  // Aggregate expenses into monthly buckets
  expenses.forEach((exp) => {
    const key = formatMonthYearKey(exp.date);
    if (monthlyMap[key]) {
      monthlyMap[key].expenses += exp.amount;
    }
  });

  // Compute savings per month
  const monthlyTrends = Object.values(monthlyMap).map((m) => {
    const income = Math.round(m.income * 100) / 100;
    const expAmount = Math.round(m.expenses * 100) / 100;
    const savings = Math.round((income - expAmount) * 100) / 100;

    return {
      month: m.month,
      income,
      expenses: expAmount,
      savings,
    };
  });

  // ----------------------------------------------------
  // 2. Category-wise Expense Breakdown
  // ----------------------------------------------------
  const categoryMap = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
  });

  const categoryExpenses = Object.keys(categoryMap).map((category) => ({
    category,
    amount: Math.round(categoryMap[category] * 100) / 100,
  })).sort((a, b) => b.amount - a.amount);

  // ----------------------------------------------------
  // 3. Budget Utilization Comparison
  // ----------------------------------------------------
  const allUserExpenses = await prisma.expense.findMany({ where: { userId } });
  const budgetUtilization = budgets.map((b) => {
    const categorySpent = allUserExpenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        const isMatch = exp.category.toLowerCase() === b.category.toLowerCase();
        return isMatch && expDate >= new Date(b.startDate) && expDate <= new Date(b.endDate);
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const pct = b.amount > 0 ? (categorySpent / b.amount) * 100 : 0;

    return {
      category: b.category,
      budgeted: Math.round(b.amount * 100) / 100,
      spent: Math.round(categorySpent * 100) / 100,
      utilizationPercentage: Math.min(Math.round(pct * 10) / 10, 999.9),
      isOverBudget: categorySpent > b.amount,
    };
  });

  // ----------------------------------------------------
  // 4. Goal Progress Aggregation
  // ----------------------------------------------------
  const goalProgress = goals.map((g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;

    return {
      id: g.id,
      title: g.title,
      targetAmount: Math.round(g.targetAmount * 100) / 100,
      currentAmount: Math.round(g.currentAmount * 100) / 100,
      remainingAmount: Math.round(remaining * 100) / 100,
      progressPercentage: Math.min(Math.round(progress * 10) / 10, 100),
      status: g.status,
    };
  });

  // ----------------------------------------------------
  // 5. EMI Burden & Loan Debt Analysis
  // ----------------------------------------------------
  const totalMonthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const activeEMIs = emis.filter((e) => e.remainingAmount > 0);
  const totalMonthlyEMI = activeEMIs.reduce((sum, item) => sum + item.monthlyAmount, 0);
  const totalRemainingDebt = emis.reduce((sum, item) => sum + item.remainingAmount, 0);

  const emiBurdenPercentage =
    totalMonthlyIncome > 0 ? (totalMonthlyEMI / totalMonthlyIncome) * 100 : 0;

  const emiBurdenData = emis.map((e) => ({
    loanName: e.loanName,
    lender: e.lender || 'Private',
    monthlyEMI: Math.round(e.monthlyAmount * 100) / 100,
    remainingDebt: Math.round(e.remainingAmount * 100) / 100,
    totalAmount: Math.round(e.totalAmount * 100) / 100,
  }));

  return {
    timeframeMonths: monthsLimit,
    monthlyTrends,
    categoryExpenses,
    budgetUtilization,
    goalProgress,
    emiBurden: {
      totalMonthlyEMI: Math.round(totalMonthlyEMI * 100) / 100,
      totalRemainingDebt: Math.round(totalRemainingDebt * 100) / 100,
      emiBurdenPercentage: Math.round(emiBurdenPercentage * 10) / 10,
      loans: emiBurdenData,
    },
  };
};

module.exports = {
  getAnalyticsData,
};
