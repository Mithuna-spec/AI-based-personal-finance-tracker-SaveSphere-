const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getFinancialAnalysis } = require('./financialAnalysisService');
const { calculateMoneyAllocation } = require('./moneyAllocationService');

/**
 * Deterministic AI Recommendation Generator (Fallback & Source of Truth)
 * Maps deterministic calculations into structured recommendation cards & core Q&A answers
 */
const generateDeterministicRecommendations = (analysis, allocation) => {
  const recommendations = [];
  let priorityCounter = 1;

  // 1. Emergency Fund Recommendation (Type: EMERGENCY_FUND)
  if (analysis.emergencyFund.status !== 'COMPLETED' && analysis.emergencyFund.remainingGap > 0) {
    const efAlloc = allocation.allocations.find((a) => a.category === 'emergency_fund');
    const allocAmount = efAlloc ? efAlloc.amount : Math.min(allocation.availableAmount, analysis.emergencyFund.remainingGap);

    recommendations.push({
      id: 'rec_ef_1',
      type: 'EMERGENCY_FUND',
      action: `Allocate ₹${allocAmount.toFixed(2)} toward your Emergency Reserve Pool this month`,
      amount: allocAmount,
      priority: priorityCounter++,
      reason: `Your Emergency Fund is at ${analysis.emergencyFund.progressPercentage}% (${analysis.emergencyFund.coveredMonths} months covered vs 6-month target of ₹${analysis.emergencyFund.targetAmount.toFixed(2)}).`,
      expectedEffect: `Increases cash cushion to protect against unexpected financial shocks.`,
      relatedGoal: 'Emergency Reserve Pool',
    });
  }

  // 2. Financial Goals Recommendations (Type: GOAL)
  analysis.goals.list.forEach((g) => {
    if (!g.isAchieved && g.remainingAmount > 0) {
      const gAlloc = allocation.allocations.find((a) => a.category === `goal_${g.id}`);
      const allocAmount = gAlloc ? gAlloc.amount : Math.min(allocation.availableAmount, g.requiredMonthlySavings);

      recommendations.push({
        id: `rec_goal_${g.id}`,
        type: 'GOAL',
        action: `Allocate ₹${allocAmount.toFixed(2)} toward your "${g.title}" goal this month`,
        amount: allocAmount,
        priority: priorityCounter++,
        reason: `This goal requires approximately ₹${g.requiredMonthlySavings.toFixed(2)}/month to remain on schedule (₹${g.remainingAmount.toFixed(2)} remaining).`,
        expectedEffect: `Keeps your goal progress on track to hit 100% completion by deadline.`,
        relatedGoal: g.title,
      });
    }
  });

  // 3. Over-Budget & Spending Violations (Type: BUDGET / SPENDING)
  analysis.budgets.list.forEach((b) => {
    if (b.isOverBudget) {
      recommendations.push({
        id: `rec_budget_${b.id}`,
        type: 'BUDGET',
        action: `Cap non-essential spending in ${b.category} immediately`,
        amount: b.spent,
        priority: priorityCounter++,
        reason: `You have spent ₹${b.spent.toFixed(2)} against a limit of ₹${b.amount.toFixed(2)} (${b.utilizationPercentage}% utilization).`,
        expectedEffect: `Prevents further cash flow depletion and preserves savings capacity.`,
        relatedGoal: `${b.category} Budget Cap`,
      });
    }
  });

  // 4. Debt & EMI Acceleration (Type: EMI)
  if (analysis.emis.activeLoansCount > 0 && analysis.emis.totalRemainingDebt > 0) {
    const debtAlloc = allocation.allocations.find((a) => a.category === 'debt_paydown');
    if (debtAlloc) {
      recommendations.push({
        id: 'rec_emi_debt_acceleration',
        type: 'EMI',
        action: `Apply ₹${debtAlloc.amount.toFixed(2)} extra principal paydown on active loan debt`,
        amount: debtAlloc.amount,
        priority: priorityCounter++,
        reason: `Your total remaining loan debt is ₹${analysis.emis.totalRemainingDebt.toFixed(2)} with monthly EMI of ₹${analysis.emis.totalMonthlyEMI.toFixed(2)}.`,
        expectedEffect: `Reduces total interest paid and shortens loan tenure.`,
        relatedGoal: 'Debt Payoff Acceleration',
      });
    }
  }

  // 5. Savings Rate Optimization (Type: SAVING)
  if (analysis.cashFlow.savingsRate < 20) {
    recommendations.push({
      id: 'rec_saving_rate',
      type: 'SAVING',
      action: 'Increase monthly savings rate to at least 20% of income',
      amount: Math.round(analysis.income.total * 0.2 * 100) / 100,
      priority: priorityCounter++,
      reason: `Your current savings rate is ${analysis.cashFlow.savingsRate}%. Financial best practices recommend saving at least 20% of total income.`,
      expectedEffect: `Accelerates wealth creation and provides higher capital flexibility.`,
      relatedGoal: '20% Savings Rate Target',
    });
  }

  // 6. General Capital Allocation (Type: GENERAL)
  if (recommendations.length === 0 || allocation.availableAmount > 0) {
    recommendations.push({
      id: 'rec_general_surplus',
      type: 'GENERAL',
      action: `Deploy ₹${allocation.availableAmount.toFixed(2)} in surplus cash into flexible investments or high-yield savings`,
      amount: allocation.availableAmount,
      priority: priorityCounter++,
      reason: `You have ₹${allocation.availableAmount.toFixed(2)} in uncommitted available capital after satisfying all obligations and active goals.`,
      expectedEffect: `Maximizes returns on idle cash reserves.`,
      relatedGoal: 'Flexible Investment Pool',
    });
  }

  // Generate Direct Q&A Answers to Core User Questions
  const answers = {
    availableMoneyStrategy: allocation.availableAmount > 0 
      ? `You have ₹${allocation.availableAmount.toFixed(2)} in available capital. Allocate top priority to Emergency Fund (₹${recommendations[0]?.amount || 0}) and active goal contributions.`
      : `Your available money is ₹0.00 because expenses and EMI obligations consume your income pool. Focus on cutting recurring costs.`,

    goalPriorityRecommendation: analysis.goals.list.length > 0 
      ? `Prioritize "${analysis.goals.list[0].title}", which requires ₹${analysis.goals.list[0].requiredMonthlySavings.toFixed(2)}/month to hit target date.`
      : `No active goals configured. Create a goal to start automated capital distribution.`,

    overspendingDiagnostic: analysis.budgets.overBudgetCount > 0 
      ? `Overspending detected in ${analysis.budgets.overBudgetCount} category budget cap(s). Review category transactions.`
      : `No overspending detected across your active budget caps!`,

    savingsImprovementPlan: `Your savings rate is ${analysis.cashFlow.savingsRate}%. ${
      analysis.cashFlow.savingsRate >= 20 
        ? 'You are maintaining excellent savings discipline.' 
        : 'To improve savings, review recurring subscription expenses and reduce discretionary dining out.'
    }`,

    goalTrackStatus: analysis.goals.unfeasibleCount > 0 
      ? `${analysis.goals.unfeasibleCount} goal(s) are currently unfeasible due to high monthly requirements vs net capacity.`
      : `All active goals are on track based on current monthly contribution schedules.`,

    monthlyChangeRecommendation: recommendations.length > 0 
      ? recommendations[0].action 
      : 'Maintain current budget limits and log all new transaction expenses.',
  };

  return {
    recommendations,
    answers,
  };
};

/**
 * Main Personalized AI Financial Recommendations Service
 */
const getPersonalizedRecommendations = async (userId) => {
  const [analysis, allocation] = await Promise.all([
    getFinancialAnalysis(userId),
    calculateMoneyAllocation(userId),
  ]);

  const deterministicResult = generateDeterministicRecommendations(analysis, allocation);

  const provider = process.env.AI_PROVIDER || 'gemini';
  const apiKey = process.env.GEMINI_API_KEY;

  if (provider === 'gemini' && apiKey && apiKey.trim().length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are SaveSphere AI, a personalized financial advisor.
Analyze the user's real deterministic financial facts and capital allocation:

Deterministic Analysis: ${JSON.stringify(analysis, null, 2)}
Money Allocation Plan: ${JSON.stringify(allocation, null, 2)}

DO NOT contradict any backend figures. Output a JSON object with:
1. "recommendations": Array of recommendations (Types: GOAL, SAVING, BUDGET, SPENDING, EMERGENCY_FUND, EMI, GENERAL). Each must have: id, type, action, amount, priority, reason, expectedEffect, relatedGoal.
2. "answers": Answers to 6 core questions (availableMoneyStrategy, goalPriorityRecommendation, overspendingDiagnostic, savingsImprovementPlan, goalTrackStatus, monthlyChangeRecommendation).

Return ONLY valid JSON format without markdown ticks.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      // Verify that AI numbers do not contradict backend allocation numbers
      const sanitizedRecommendations = parsed.recommendations.map((rec) => {
        // If type is GOAL or EMERGENCY_FUND, enforce backend allocation amount
        const matchingDet = deterministicResult.recommendations.find((d) => d.type === rec.type);
        if (matchingDet && typeof matchingDet.amount === 'number') {
          rec.amount = matchingDet.amount; // Enforce deterministic calculation
        }
        return rec;
      });

      return {
        provider: 'gemini-1.5-flash',
        recommendations: sanitizedRecommendations,
        answers: parsed.answers || deterministicResult.answers,
        summary: allocation.summary,
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic recommendations generator:', err.message);
    }
  }

  return {
    provider: 'deterministic-rule-engine',
    recommendations: deterministicResult.recommendations,
    answers: deterministicResult.answers,
    summary: allocation.summary,
  };
};

module.exports = {
  getPersonalizedRecommendations,
};
