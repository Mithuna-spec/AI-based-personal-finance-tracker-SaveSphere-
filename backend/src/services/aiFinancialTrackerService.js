const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const { getFinancialAnalysis } = require('./financialAnalysisService');
const { calculateMoneyAllocation } = require('./moneyAllocationService');

/**
 * Helper to compute month-over-month category spending changes
 */
const getCategorySpendingComparison = async (userId) => {
  const now = new Date();
  
  // Current Month Boundaries
  const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Previous Month Boundaries
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentExpenses, prevExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startCurrentMonth, lte: endCurrentMonth },
      },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startPrevMonth, lte: endPrevMonth },
      },
    }),
  ]);

  const currentCategoryMap = {};
  currentExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    currentCategoryMap[cat] = (currentCategoryMap[cat] || 0) + exp.amount;
  });

  const prevCategoryMap = {};
  prevExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    prevCategoryMap[cat] = (prevCategoryMap[cat] || 0) + exp.amount;
  });

  const comparison = [];
  const allCategories = new Set([...Object.keys(currentCategoryMap), ...Object.keys(prevCategoryMap)]);

  allCategories.forEach((cat) => {
    const current = Math.round((currentCategoryMap[cat] || 0) * 100) / 100;
    const prev = Math.round((prevCategoryMap[cat] || 0) * 100) / 100;
    const diff = Math.round((current - prev) * 100) / 100;
    const pctChange = prev > 0 ? Math.round(((current - prev) / prev) * 100) : current > 0 ? 100 : 0;

    comparison.push({
      category: cat,
      currentMonth: current,
      previousMonth: prev,
      diff,
      pctChange,
      isSpike: current > prev && (diff >= 50 || pctChange >= 30),
    });
  });

  return comparison;
};

/**
 * Deterministic Rule-Based Fallback AI Insight Analyzer
 * Ensures insights work 100% reliably with real deterministic numbers even when offline
 */
const generateDeterministicInsights = (context) => {
  const insights = [];
  const { analysis, allocation, categoryComparison } = context;

  // 1. Spending Changes & Spikes
  categoryComparison.forEach((item) => {
    if (item.isSpike) {
      insights.push({
        id: `spike_${item.category.toLowerCase().replace(/\s+/g, '_')}`,
        category: 'spending_change',
        severity: 'WARNING',
        title: `Significant ${item.category} Spend Increase`,
        message: `${item.category} expenditure increased significantly compared with the previous month (₹${item.currentMonth} vs ₹${item.previousMonth}, +${item.pctChange}%) and may affect your current savings capacity.`,
        action: `Review recent ${item.category} receipts to eliminate discretionary overspending.`,
      });
    }
  });

  // 2. Budget Pressure & Over-Budget Violations
  analysis.budgets.list.forEach((b) => {
    if (b.isOverBudget) {
      insights.push({
        id: `budget_over_${b.id}`,
        category: 'budget_pressure',
        severity: 'ALERT',
        title: `Over-Budget Cap Alert: ${b.category}`,
        message: `You have exceeded your ${b.category} budget cap! Spent ₹${b.spent} against a limit of ₹${b.amount} (${b.utilizationPercentage}% utilization).`,
        action: `Pause non-essential spending in ${b.category} for the remainder of the period.`,
      });
    } else if (b.utilizationPercentage >= 85) {
      insights.push({
        id: `budget_near_${b.id}`,
        category: 'budget_pressure',
        severity: 'WARNING',
        title: `High Budget Utilization: ${b.category}`,
        message: `${b.category} spending has reached ${b.utilizationPercentage}% of budget (₹${b.spent} of ₹${b.amount}). Only ₹${b.remaining} remaining.`,
        action: 'Monitor remaining transactions closely to avoid budget overruns.',
      });
    }
  });

  // 3. Goal Feasibility & Risk
  analysis.goals.list.forEach((g) => {
    if (!g.isAchieved && g.requiredMonthlySavings > analysis.cashFlow.monthlyNetCapacity) {
      insights.push({
        id: `goal_risk_${g.id}`,
        category: 'goal_risk',
        severity: 'ALERT',
        title: `Goal Feasibility Risk: ${g.title}`,
        message: `${g.title} requires ₹${g.requiredMonthlySavings}/mo savings, which exceeds your available monthly net capacity (₹${analysis.cashFlow.monthlyNetCapacity}).`,
        action: 'Extend target date or re-allocate surplus capital to restore goal feasibility.',
      });
    }
  });

  // 4. Emergency Fund Risk
  if (analysis.emergencyFund.status === 'CRITICAL') {
    insights.push({
      id: 'ef_risk_critical',
      category: 'emergency_fund_risk',
      severity: 'ALERT',
      title: 'Emergency Fund Protection Gap',
      message: `Your emergency reserve (₹${analysis.emergencyFund.currentAmount}) covers only ${analysis.emergencyFund.coveredMonths} months of essential expenses against a 6-month target (₹${analysis.emergencyFund.targetAmount}).`,
      action: 'Prioritize building emergency reserves before making non-essential discretionary investments.',
    });
  } else if (analysis.emergencyFund.status === 'BELOW_TARGET') {
    insights.push({
      id: 'ef_risk_below',
      category: 'emergency_fund_risk',
      severity: 'WARNING',
      title: 'Emergency Reserve Below Target',
      message: `Emergency fund is at ${analysis.emergencyFund.progressPercentage}% of target (₹${analysis.emergencyFund.currentAmount} saved, ₹${analysis.emergencyFund.remainingGap} gap remaining).`,
      action: 'Direct monthly allocations toward your emergency reserve pool.',
    });
  }

  // 5. EMI Debt Burden Alert
  if (analysis.cashFlow.debtToIncomeRatio > 35) {
    insights.push({
      id: 'emi_dti_high',
      category: 'emi_burden',
      severity: 'ALERT',
      title: 'High Debt-to-Income (DTI) Exposure',
      message: `Your monthly EMI commitments (₹${analysis.emis.totalMonthlyEMI}/mo) consume ${analysis.cashFlow.debtToIncomeRatio}% of monthly income, placing pressure on cash flow.`,
      action: 'Consider accelerated loan principal paydowns to reduce monthly debt service.',
    });
  }

  // 6. Positive Behavior / Capital Allocation Milestone
  if (analysis.cashFlow.savingsRate >= 20) {
    insights.push({
      id: 'savings_rate_positive',
      category: 'spending_pattern',
      severity: 'POSITIVE',
      title: 'Strong Savings Rate Momentum',
      message: `Great financial health! You saved ${analysis.cashFlow.savingsRate}% of total income (₹${analysis.cashFlow.netSavings}) this period.`,
      action: 'Maintain current spending discipline to accelerate long-term wealth goals.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'general_positive_insight',
      category: 'spending_pattern',
      severity: 'POSITIVE',
      title: 'Balanced Cash Flow & Stability',
      message: `Your expenses and obligations are well within your income capacity (₹${analysis.cashFlow.availableMoney} available money).`,
      action: 'Explore additional investment avenues or accelerate active goal savings.',
    });
  }

  return insights;
};

/**
 * Main AI Service Entry Point
 * Fetches deterministic financial facts and analyzes them via Google Gemini (if configured)
 * or via the deterministic rule-based AI analyzer.
 */
const getAITrackerInsights = async (userId) => {
  // 1. Gather all deterministic financial data
  const [analysis, allocation, categoryComparison] = await Promise.all([
    getFinancialAnalysis(userId),
    calculateMoneyAllocation(userId),
    getCategorySpendingComparison(userId),
  ]);

  const context = {
    analysis,
    allocation,
    categoryComparison,
  };

  const provider = process.env.AI_PROVIDER || 'gemini';
  const apiKey = process.env.GEMINI_API_KEY;

  // Try Google Gemini API if configured
  if (provider === 'gemini' && apiKey && apiKey.trim().length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are SaveSphere AI, an expert financial analyst. Analyze the following real deterministic financial context for a user.
DO NOT invent or alter any financial figures. All numbers MUST strictly come from the provided JSON context.

Financial Context:
${JSON.stringify(context, null, 2)}

Identify:
1. Spending patterns
2. Significant spending changes (month-over-month category increases)
3. Potential overspending
4. Budget pressure
5. Goal risk
6. Emergency fund risk
7. Unusual financial behavior

Return ONLY a valid JSON array of objects without markdown code blocks, with structure:
[
  {
    "id": "string",
    "category": "spending_change|budget_pressure|goal_risk|emergency_fund_risk|emi_burden|spending_pattern",
    "severity": "ALERT|WARNING|INFO|POSITIVE",
    "title": "Short title",
    "message": "Detailed natural language insight explaining the exact numbers",
    "action": "Actionable financial advice"
  }
]`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedInsights = JSON.parse(cleanedJson);

      return {
        provider: 'gemini-1.5-flash',
        insights: parsedInsights,
        contextSummary: {
          availableMoney: analysis.cashFlow.availableMoney,
          healthScore: analysis.healthScore.score,
          healthStatus: analysis.healthScore.status,
        },
      };
    } catch (err) {
      console.warn('Gemini API call failed or unconfigured, using deterministic AI engine fallback:', err.message);
    }
  }

  // Fallback to Deterministic AI Engine
  const deterministicInsights = generateDeterministicInsights(context);
  return {
    provider: 'deterministic-rule-engine',
    insights: deterministicInsights,
    contextSummary: {
      availableMoney: analysis.cashFlow.availableMoney,
      healthScore: analysis.healthScore.score,
      healthStatus: analysis.healthScore.status,
    },
  };
};

module.exports = {
  getAITrackerInsights,
};
