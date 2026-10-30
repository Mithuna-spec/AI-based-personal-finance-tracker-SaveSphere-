const moneyAllocationService = require('../services/moneyAllocationService');
const aiRecommendationService = require('../services/aiRecommendationService');

/**
 * GET /api/recommendations/allocation
 * Retrieves deterministic money allocation plan
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
      message: 'Failed to calculate money allocation plan',
      error: error.message,
    });
  }
};

/**
 * GET /api/recommendations
 * GET /api/recommendations/personalized
 * Retrieves personalized AI financial recommendations and core Q&A answers
 */
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const recData = await aiRecommendationService.getPersonalizedRecommendations(req.user.id);
    return res.status(200).json({
      success: true,
      data: recData,
    });
  } catch (error) {
    console.error('Error generating personalized AI recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate personalized AI financial recommendations',
      error: error.message,
    });
  }
};

module.exports = {
  getAllocationRecommendation,
  getPersonalizedRecommendations,
};
