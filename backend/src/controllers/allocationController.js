const moneyAllocationService = require('../services/moneyAllocationService');

/**
 * GET /api/recommendations/allocation
 * Retrieves deterministic money allocation plan for authenticated user
 */
const getAllocationRecommendation = async (req, res) => {
  try {
    const allocationData = await moneyAllocationService.calculateMoneyAllocation(req.user.id);

    return res.status(200).json({
      success: true,
      data: allocationData,
    });
  } catch (error) {
    console.error('Error calculating money allocation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate smart money allocation plan',
      error: error.message,
    });
  }
};

module.exports = {
  getAllocationRecommendation,
};
