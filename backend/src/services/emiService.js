const prisma = require('../config/db');

/**
 * Create a new EMI / Loan record
 */
const createEMI = async (userId, data) => {
  const {
    loanName,
    lender,
    totalAmount,
    monthlyAmount,
    interestRate,
    startDate,
    endDate,
    remainingAmount,
  } = data;

  const newEMI = await prisma.eMI.create({
    data: {
      userId,
      loanName,
      lender: lender || null,
      totalAmount: parseFloat(totalAmount),
      monthlyAmount: parseFloat(monthlyAmount),
      interestRate: interestRate !== undefined && interestRate !== null ? parseFloat(interestRate) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      remainingAmount: parseFloat(remainingAmount),
    },
  });

  return newEMI;
};

/**
 * Get user's monthly EMI obligations helper
 */
const getUserEMIObligations = async (userId) => {
  const emis = await prisma.eMI.findMany({
    where: { userId },
  });

  // Calculate active monthly EMI commitment (exclude fully paid loans)
  const activeEMIs = emis.filter((e) => e.remainingAmount > 0);
  const totalMonthlyEMI = activeEMIs.reduce((sum, item) => sum + item.monthlyAmount, 0);
  const totalRemainingDebt = emis.reduce((sum, item) => sum + item.remainingAmount, 0);

  return {
    totalMonthlyEMI: Math.round(totalMonthlyEMI * 100) / 100,
    totalRemainingDebt: Math.round(totalRemainingDebt * 100) / 100,
    activeLoansCount: activeEMIs.length,
  };
};

/**
 * Get all EMI records for user with computed metrics
 */
const getAllEMIs = async (userId, filters = {}) => {
  const { status } = filters;

  const where = { userId };

  const emis = await prisma.eMI.findMany({
    where,
    orderBy: { endDate: 'asc' },
  });

  const processedEMIs = emis.map((emi) => {
    const paidAmount = Math.max(0, emi.totalAmount - emi.remainingAmount);
    const progressPercentage =
      emi.totalAmount > 0 ? (paidAmount / emi.totalAmount) * 100 : 0;
    const isFullyPaid = emi.remainingAmount <= 0;
    const loanStatus = isFullyPaid ? 'FULLY_PAID' : 'ACTIVE';

    return {
      ...emi,
      computed: {
        paidAmount: Math.round(paidAmount * 100) / 100,
        progressPercentage: Math.min(Math.round(progressPercentage * 10) / 10, 100),
        isFullyPaid,
        loanStatus,
      },
    };
  });

  // Filter processed items if status filter is applied
  let filteredEMIs = processedEMIs;
  if (status === 'ACTIVE') {
    filteredEMIs = processedEMIs.filter((e) => !e.computed.isFullyPaid);
  } else if (status === 'FULLY_PAID') {
    filteredEMIs = processedEMIs.filter((e) => e.computed.isFullyPaid);
  }

  const { totalMonthlyEMI, totalRemainingDebt, activeLoansCount } =
    await getUserEMIObligations(userId);
  const totalLoanAmount = processedEMIs.reduce((sum, item) => sum + item.totalAmount, 0);

  return {
    emis: filteredEMIs,
    summary: {
      count: processedEMIs.length,
      activeLoansCount,
      totalLoanAmount,
      totalRemainingDebt,
      totalMonthlyEMI,
    },
  };
};

/**
 * Get single EMI by ID scoped to user
 */
const getEMIById = async (userId, emiId) => {
  const emi = await prisma.eMI.findFirst({
    where: {
      id: emiId,
      userId,
    },
  });

  if (!emi) {
    const error = new Error('EMI / Loan record not found');
    error.statusCode = 404;
    throw error;
  }

  return emi;
};

/**
 * Update EMI record scoped to user
 */
const updateEMI = async (userId, emiId, updateData) => {
  await getEMIById(userId, emiId);

  const payload = {};
  if (updateData.loanName !== undefined) payload.loanName = updateData.loanName;
  if (updateData.lender !== undefined) payload.lender = updateData.lender;
  if (updateData.totalAmount !== undefined) payload.totalAmount = parseFloat(updateData.totalAmount);
  if (updateData.monthlyAmount !== undefined) payload.monthlyAmount = parseFloat(updateData.monthlyAmount);
  if (updateData.interestRate !== undefined)
    payload.interestRate = updateData.interestRate !== null ? parseFloat(updateData.interestRate) : null;
  if (updateData.startDate !== undefined) payload.startDate = new Date(updateData.startDate);
  if (updateData.endDate !== undefined) payload.endDate = new Date(updateData.endDate);
  if (updateData.remainingAmount !== undefined) payload.remainingAmount = parseFloat(updateData.remainingAmount);

  const updatedEMI = await prisma.eMI.update({
    where: { id: emiId },
    data: payload,
  });

  return updatedEMI;
};

/**
 * Delete EMI record scoped to user
 */
const deleteEMI = async (userId, emiId) => {
  await getEMIById(userId, emiId);

  await prisma.eMI.delete({
    where: { id: emiId },
  });

  return { id: emiId };
};

module.exports = {
  createEMI,
  getAllEMIs,
  getEMIById,
  updateEMI,
  deleteEMI,
  getUserEMIObligations,
};
