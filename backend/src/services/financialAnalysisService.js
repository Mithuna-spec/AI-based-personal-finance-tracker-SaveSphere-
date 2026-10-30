const prisma = require('../config/db');

/**
 * Central Financial Calculation Engine
 * Produces deterministic financial analysis, liquidity metrics, and health scores for authenticated user
 */
const getFinancialAnalysis = async (userId) => {
  // 1. Fetch user's financial records from database
  const [incomes, expenses, emis, budgets, goals, emergencyFundRecord] = await Promise.all([
    prisma.income.findMany({ where: { userId } }),
    prisma.expense.findMany({ where: { userId } }),
    prisma.eMI.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.financialGoal.findMany({ where: { userId } }),
    prisma.emergencyFund.findFirst({ where: { userId } }),
  ]);

  // Current Month Boundaries for Monthly metrics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // ----------------------------------------------------
  // 1. Income Analysis
  // ----------------------------------------------------
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const incomeThisMonth = incomes
    .filter((item) => new Date(item.date) >= startOfMonth && new Date(item.date) <= endOfMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  // ----------------------------------------------------
  // 2. Expense Analysis
  // ----------------------------------------------------
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const expensesThisMonth = expenses
    .filter((item) => new Date(item.date) >= startOfMonth && new Date(item.date) <= endOfMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const recurringExpenses = expenses
    .filter((item) => item.isRecurring)
    .reduce((sum, item) => sum + item.amount, 0);

  // ----------------------------------------------------
  // 3. EMI / Loan Obligations
  // ----------------------------------------------------
  const activeEMIs = emis.filter((e) => e.remainingAmount > 0);
  const totalMonthlyEMI = activeEMIs.reduce((sum, item) => sum + item.monthlyAmount, 0);
  const totalRemainingDebt = emis.reduce((sum, item) => sum + item.remainingAmount, 0);

  // ----------------------------------------------------
  // 4. Cash Flow & Savings Calculations (Division by Zero Safe)
  // ----------------------------------------------------
  const netSavings = totalIncome - totalExpenses;
  const netMonthlyMargin = incomeThisMonth - expensesThisMonth;

  // Available Money = Income - Expenses - Recurring Expenses - Monthly EMIs (Min 0)
  const availableMoney = Math.max(0, totalIncome - totalExpenses - recurringExpenses - totalMonthlyEMI);

  // Monthly Net Capacity available for new savings/goals
  const monthlyNetCapacity = Math.max(0, totalIncome - totalExpenses - totalMonthlyEMI);

  // Savings Rate (%) = (Net Savings / Total Income) * 100 (Safe against zero income)
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Debt-to-Income Ratio (%) = (Monthly EMI / Total Income) * 100
  const debtToIncomeRatio = totalIncome > 0 ? (totalMonthlyEMI / totalIncome) * 100 : 0;

  // ----------------------------------------------------
  // 5. Budget Utilization Analysis
  // ----------------------------------------------------
  const totalBudgeted = budgets.reduce((sum, item) => sum + item.amount, 0);

  // Compute category spending for budgets
  let totalCategorySpent = 0;
  let overBudgetCount = 0;

  const processedBudgets = budgets.map((b) => {
    const categoryExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const isMatch = exp.category.toLowerCase() === b.category.toLowerCase();
      return isMatch && expDate >= new Date(b.startDate) && expDate <= new Date(b.endDate);
    });

    const spent = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
    totalCategorySpent += spent;

    const remaining = b.amount - spent;
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const isOver = spent > b.amount;
    if (isOver) overBudgetCount++;

    return {
      id: b.id,
      category: b.category,
      amount: b.amount,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      utilizationPercentage: Math.min(Math.round(pct * 10) / 10, 999.9),
      isOverBudget: isOver,
    };
  });

  const overallBudgetUtilization =
    totalBudgeted > 0 ? (totalCategorySpent / totalBudgeted) * 100 : 0;

  // ----------------------------------------------------
  // 6. Goal Planner Analysis
  // ----------------------------------------------------
  const totalGoalTargetAmount = goals.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalGoalCurrentAmount = goals.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalGoalRemainingAmount = Math.max(0, totalGoalTargetAmount - totalGoalCurrentAmount);

  let totalRequiredMonthlyGoalSavings = 0;
  let achievedGoalsCount = 0;
  let unfeasibleGoalsCount = 0;

  const processedGoals = goals.map((g) => {
    const rem = Math.max(0, g.targetAmount - g.currentAmount);
    const isAchieved = g.status === 'ACHIEVED' || rem <= 0;

    const now = new Date();
    const target = new Date(g.targetDate);
    const monthsDiff =
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());

    let reqMonthly = 0;
    if (isAchieved) {
      achievedGoalsCount++;
      reqMonthly = 0;
    } else if (monthsDiff <= 0) {
      reqMonthly = rem;
    } else {
      reqMonthly = rem / monthsDiff;
    }

    if (!isAchieved) {
      totalRequiredMonthlyGoalSavings += reqMonthly;
      if (reqMonthly > monthlyNetCapacity * 1.3) {
        unfeasibleGoalsCount++;
      }
    }

    return {
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      remainingAmount: Math.round(rem * 100) / 100,
      requiredMonthlySavings: Math.round(reqMonthly * 100) / 100,
      isAchieved,
    };
  });

  // ----------------------------------------------------
  // 7. Emergency Fund Requirement Analysis
  // ----------------------------------------------------
  const efEssentialMonthly = emergencyFundRecord
    ? emergencyFundRecord.monthlyExpensesFloat
    : totalExpenses > 0
    ? totalExpenses
    : 1000;
  const efTargetMonths = emergencyFundRecord ? emergencyFundRecord.targetMonths : 6;
  const efTargetAmount = efEssentialMonthly * efTargetMonths;
  const efCurrentAmount = emergencyFundRecord ? emergencyFundRecord.currentAmount : 0;
  const efRemainingGap = Math.max(0, efTargetAmount - efCurrentAmount);
  const efCoveredMonths = efEssentialMonthly > 0 ? efCurrentAmount / efEssentialMonthly : 0;
  const efProgressPct = efTargetAmount > 0 ? (efCurrentAmount / efTargetAmount) * 100 : 0;

  let efStatus = 'CRITICAL';
  if (efRemainingGap <= 0 || efProgressPct >= 100) efStatus = 'COMPLETED';
  else if (efCoveredMonths >= 3 || efProgressPct >= 50) efStatus = 'ON_TRACK';
  else if (efCoveredMonths >= 1 || efProgressPct >= 20) efStatus = 'BELOW_TARGET';

  // ----------------------------------------------------
  // 8. Financial Health Score (0 - 100 Scale)
  // ----------------------------------------------------
  let healthScore = 50; // Neutral baseline

  // Adjust score based on savings rate (+20 max)
  if (savingsRate >= 20) healthScore += 20;
  else if (savingsRate >= 10) healthScore += 10;
  else if (savingsRate < 0) healthScore -= 20;

  // Adjust score based on debt-to-income (-20 max if high debt)
  if (debtToIncomeRatio > 40) healthScore -= 20;
  else if (debtToIncomeRatio > 25) healthScore -= 10;
  else if (totalMonthlyEMI === 0 && totalIncome > 0) healthScore += 10;

  // Adjust score based on emergency fund (+15 max)
  if (efStatus === 'COMPLETED') healthScore += 15;
  else if (efStatus === 'ON_TRACK') healthScore += 10;
  else if (efStatus === 'CRITICAL') healthScore -= 10;

  // Adjust score based on over-budget violations
  if (overBudgetCount > 0) healthScore -= 10;

  healthScore = Math.min(100, Math.max(0, healthScore));

  let healthStatus = 'GOOD';
  if (healthScore >= 75) healthStatus = 'EXCELLENT';
  else if (healthScore >= 55) healthStatus = 'GOOD';
  else if (healthScore >= 40) healthStatus = 'FAIR';
  else healthStatus = 'NEEDS_ATTENTION';

  // Return structured engine calculation
  return {
    income: {
      total: Math.round(totalIncome * 100) / 100,
      thisMonth: Math.round(incomeThisMonth * 100) / 100,
      count: incomes.length,
    },
    expenses: {
      total: Math.round(totalExpenses * 100) / 100,
      thisMonth: Math.round(expensesThisMonth * 100) / 100,
      recurring: Math.round(recurringExpenses * 100) / 100,
      count: expenses.length,
    },
    emis: {
      totalMonthlyEMI: Math.round(totalMonthlyEMI * 100) / 100,
      totalRemainingDebt: Math.round(totalRemainingDebt * 100) / 100,
      activeLoansCount: activeEMIs.length,
    },
    cashFlow: {
      netSavings: Math.round(netSavings * 100) / 100,
      netMonthlyMargin: Math.round(netMonthlyMargin * 100) / 100,
      availableMoney: Math.round(availableMoney * 100) / 100,
      monthlyNetCapacity: Math.round(monthlyNetCapacity * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    },
    budgets: {
      totalBudgeted: Math.round(totalBudgeted * 100) / 100,
      totalCategorySpent: Math.round(totalCategorySpent * 100) / 100,
      overallUtilizationPercentage: Math.round(overallBudgetUtilization * 10) / 10,
      overBudgetCount,
      count: budgets.length,
      list: processedBudgets,
    },
    goals: {
      totalTargetAmount: Math.round(totalGoalTargetAmount * 100) / 100,
      totalCurrentAmount: Math.round(totalGoalCurrentAmount * 100) / 100,
      totalRemainingAmount: Math.round(totalGoalRemainingAmount * 100) / 100,
      totalRequiredMonthlySavings: Math.round(totalRequiredMonthlyGoalSavings * 100) / 100,
      achievedCount: achievedGoalsCount,
      unfeasibleCount: unfeasibleGoalsCount,
      count: goals.length,
      list: processedGoals,
    },
    emergencyFund: {
      essentialMonthlyExpenses: Math.round(efEssentialMonthly * 100) / 100,
      targetMonths: efTargetMonths,
      targetAmount: Math.round(efTargetAmount * 100) / 100,
      currentAmount: Math.round(efCurrentAmount * 100) / 100,
      remainingGap: Math.round(efRemainingGap * 100) / 100,
      coveredMonths: Math.round(efCoveredMonths * 10) / 10,
      progressPercentage: Math.round(efProgressPct * 10) / 10,
      status: efStatus,
    },
    healthScore: {
      score: healthScore,
      status: healthStatus,
    },
  };
};

module.exports = {
  getFinancialAnalysis,
};
