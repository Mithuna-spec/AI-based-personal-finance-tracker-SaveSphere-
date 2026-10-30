const prisma = require('../config/db');

/**
 * Helper to classify emergency fund status deterministically
 */
const classifyFundStatus = (progressPercentage, coveredMonths, remainingAmount) => {
  if (remainingAmount <= 0 || progressPercentage >= 100) {
    return {
      status: 'COMPLETED',
      label: 'Completed',
      reason: 'Safety reserve is 100% funded! You have fully covered your target emergency cushion.',
    };
  } else if (coveredMonths >= 3 || progressPercentage >= 50) {
    return {
      status: 'ON_TRACK',
      label: 'On Track',
      reason: `Solid progress! You have ${coveredMonths.toFixed(1)} months of essential expenses covered.`,
    };
  } else if (coveredMonths >= 1 || progressPercentage >= 20) {
    return {
      status: 'BELOW_TARGET',
      label: 'Below Target',
      reason: `Partial reserve established (${coveredMonths.toFixed(1)} months covered). Continue building towards target.`,
    };
  } else {
    return {
      status: 'CRITICAL',
      label: 'Critical',
      reason: `Vulnerable position! You have less than 1 month (${coveredMonths.toFixed(1)} months) of essential expenses reserved.`,
    };
  }
};

/**
 * Get emergency fund configuration and calculations for user
 */
const getEmergencyFund = async (userId) => {
  const fund = await prisma.emergencyFund.findFirst({
    where: { userId },
  });

  // Fetch user's actual expenses if unconfigured
  const userExpenses = await prisma.expense.findMany({ where: { userId } });
  const totalMonthlyExpenses = userExpenses.reduce((sum, item) => sum + item.amount, 0);

  if (!fund) {
    const defaultMonthly = totalMonthlyExpenses > 0 ? totalMonthlyExpenses : 1000;
    const defaultMonths = 6;
    const defaultTarget = defaultMonthly * defaultMonths;
    const defaultCurrent = 0;
    const remaining = defaultTarget;
    const coveredMonths = 0;
    const progressPercentage = 0;
    const classification = classifyFundStatus(progressPercentage, coveredMonths, remaining);

    return {
      isConfigured: false,
      fund: null,
      calculations: {
        essentialMonthlyExpenses: defaultMonthly,
        targetMonths: defaultMonths,
        targetAmount: defaultTarget,
        currentAmount: defaultCurrent,
        remainingAmount: remaining,
        progressPercentage: 0,
        coveredMonths: 0,
        status: classification.status,
        statusLabel: classification.label,
        statusReason: classification.reason,
      },
    };
  }

  const essentialMonthlyExpenses = fund.monthlyExpensesFloat;
  const targetMonths = fund.targetMonths;
  const targetAmount = essentialMonthlyExpenses * targetMonths;
  const currentAmount = fund.currentAmount;
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const coveredMonths = essentialMonthlyExpenses > 0 ? currentAmount / essentialMonthlyExpenses : 0;

  const classification = classifyFundStatus(progressPercentage, coveredMonths, remainingAmount);

  return {
    isConfigured: true,
    fund,
    calculations: {
      essentialMonthlyExpenses,
      targetMonths,
      targetAmount: Math.round(targetAmount * 100) / 100,
      currentAmount: Math.round(currentAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      progressPercentage: Math.min(Math.round(progressPercentage * 10) / 10, 100),
      coveredMonths: Math.round(coveredMonths * 10) / 10,
      status: classification.status,
      statusLabel: classification.label,
      statusReason: classification.reason,
    },
  };
};

/**
 * Upsert / Save emergency fund configuration
 */
const upsertEmergencyFund = async (userId, data) => {
  const { essentialMonthlyExpenses, targetMonths, currentAmount } = data;

  const parsedMonthly = parseFloat(essentialMonthlyExpenses);
  const parsedMonths = targetMonths ? parseInt(targetMonths, 10) : 6;
  const parsedCurrent = currentAmount !== undefined ? parseFloat(currentAmount) : 0.0;
  const calculatedTarget = parsedMonthly * parsedMonths;

  const existingFund = await prisma.emergencyFund.findFirst({
    where: { userId },
  });

  let fund;
  if (existingFund) {
    fund = await prisma.emergencyFund.update({
      where: { id: existingFund.id },
      data: {
        monthlyExpensesFloat: parsedMonthly,
        targetMonths: parsedMonths,
        targetAmount: calculatedTarget,
        currentAmount: parsedCurrent,
      },
    });
  } else {
    fund = await prisma.emergencyFund.create({
      data: {
        userId,
        monthlyExpensesFloat: parsedMonthly,
        targetMonths: parsedMonths,
        targetAmount: calculatedTarget,
        currentAmount: parsedCurrent,
      },
    });
  }

  return fund;
};

/**
 * Delete emergency fund configuration
 */
const deleteEmergencyFund = async (userId, fundId) => {
  const fund = await prisma.emergencyFund.findFirst({
    where: { id: fundId, userId },
  });

  if (!fund) {
    const error = new Error('Emergency fund configuration not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.emergencyFund.delete({
    where: { id: fundId },
  });

  return { id: fundId };
};

module.exports = {
  getEmergencyFund,
  upsertEmergencyFund,
  deleteEmergencyFund,
};
