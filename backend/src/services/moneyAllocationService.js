const { getFinancialAnalysis } = require('./financialAnalysisService');

/**
 * Smart Money Allocation Engine (Phase 11)
 * Purely deterministic capital distribution across essential obligations,
 * emergency fund reserves, prioritized financial goals, and debt paydowns.
 */
const calculateMoneyAllocation = async (userId) => {
  // 1. Fetch comprehensive financial analysis metrics
  const analysis = await getFinancialAnalysis(userId);

  const availableAmount = Math.max(0, analysis.cashFlow.availableMoney);
  let remainingPool = availableAmount;
  const allocations = [];
  let currentPriority = 1;

  // ----------------------------------------------------
  // 1. Evaluate Emergency Fund Deficit (Top Priority)
  // ----------------------------------------------------
  const efGap = analysis.emergencyFund.remainingGap;
  const efStatus = analysis.emergencyFund.status;

  if (efStatus !== 'COMPLETED' && efGap > 0 && remainingPool > 0) {
    // Determine monthly recommended allocation towards Emergency Fund
    // Allocate up to 50% of available pool or full gap, whichever fits
    const targetEFAlloc = Math.min(efGap, Math.max(efGap * 0.25, analysis.emergencyFund.essentialMonthlyExpenses));
    const efAlloc = Math.round(Math.min(remainingPool, targetEFAlloc) * 100) / 100;

    if (efAlloc > 0) {
      allocations.push({
        category: 'emergency_fund',
        name: 'Emergency Fund Reserve',
        amount: efAlloc,
        priority: currentPriority++,
        reason: `Emergency fund is below target (${efStatus} status, ₹${efGap.toFixed(2)} total gap remaining)`,
      });
      remainingPool = Math.round((remainingPool - efAlloc) * 100) / 100;
    }
  }

  // ----------------------------------------------------
  // 2. Evaluate & Prioritize Active Financial Goals
  // ----------------------------------------------------
  const activeGoals = analysis.goals.list.filter((g) => !g.isAchieved && g.remainingAmount > 0);

  // Priority ranking weights: HIGH (1) > MEDIUM (2) > LOW (3)
  const priorityWeights = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  const sortedGoals = [...activeGoals].sort((a, b) => {
    const weightA = priorityWeights[a.priority] || 2;
    const weightB = priorityWeights[b.priority] || 2;
    if (weightA !== weightB) return weightA - weightB;

    // Secondary sort: required monthly savings descending (more urgent goals first)
    return b.requiredMonthlySavings - a.requiredMonthlySavings;
  });

  // Allocate pool across sorted goals
  for (const goal of sortedGoals) {
    if (remainingPool <= 0) break;

    // Needed contribution for current cycle is required monthly savings or remaining goal amount
    const targetGoalContribution = goal.requiredMonthlySavings > 0 
      ? goal.requiredMonthlySavings 
      : goal.remainingAmount;

    const goalAlloc = Math.round(Math.min(remainingPool, targetGoalContribution) * 100) / 100;

    if (goalAlloc > 0) {
      allocations.push({
        category: `goal_${goal.id}`,
        name: goal.title,
        amount: goalAlloc,
        priority: currentPriority++,
        reason: `Goal deadline requires monthly contribution of ₹${goal.requiredMonthlySavings.toFixed(2)} (₹${goal.remainingAmount.toFixed(2)} remaining)`,
      });
      remainingPool = Math.round((remainingPool - goalAlloc) * 100) / 100;
    }
  }

  // ----------------------------------------------------
  // 3. Accelerated Debt Paydown (High-Interest EMI Acceleration)
  // ----------------------------------------------------
  if (remainingPool > 0 && analysis.emis.activeLoansCount > 0 && analysis.emis.totalRemainingDebt > 0) {
    const debtAlloc = Math.round(Math.min(remainingPool, analysis.emis.totalRemainingDebt * 0.2) * 100) / 100;

    if (debtAlloc > 0) {
      allocations.push({
        category: 'debt_paydown',
        name: 'Accelerated Loan Principal Paydown',
        amount: debtAlloc,
        priority: currentPriority++,
        reason: `Surplus cash allocated to accelerate payoff of active debt obligations (₹${analysis.emis.totalRemainingDebt.toFixed(2)} total debt remaining)`,
      });
      remainingPool = Math.round((remainingPool - debtAlloc) * 100) / 100;
    }
  }

  // ----------------------------------------------------
  // 4. Flexible Surplus & General Savings Pool
  // ----------------------------------------------------
  if (remainingPool > 0) {
    allocations.push({
      category: 'flexible',
      name: 'Flexible Surplus & Discretionary Pool',
      amount: remainingPool,
      priority: currentPriority++,
      reason: 'Remaining available amount for flexible savings, discretionary spending, or investments',
    });
    remainingPool = 0;
  }

  // ----------------------------------------------------
  // 5. Strict Validation: sum(allocations) <= availableAmount
  // ----------------------------------------------------
  const totalAllocated = allocations.reduce((sum, item) => sum + item.amount, 0);
  const roundedTotal = Math.round(totalAllocated * 100) / 100;

  if (roundedTotal > availableAmount + 0.01) {
    throw new Error(`Allocation Validation Error: Sum of allocations (₹${roundedTotal}) exceeds available amount (₹${availableAmount}).`);
  }

  const unallocatedAmount = Math.max(0, Math.round((availableAmount - roundedTotal) * 100) / 100);

  return {
    availableAmount,
    allocations,
    unallocatedAmount,
    summary: {
      totalIncome: analysis.income.total,
      totalExpenses: analysis.expenses.total,
      recurringExpenses: analysis.expenses.recurring,
      monthlyEMI: analysis.emis.totalMonthlyEMI,
      protectedObligations: Math.round((analysis.expenses.recurring + analysis.emis.totalMonthlyEMI) * 100) / 100,
      totalAllocated: roundedTotal,
      healthScore: analysis.healthScore.score,
      healthStatus: analysis.healthScore.status,
    },
  };
};

module.exports = {
  calculateMoneyAllocation,
};
