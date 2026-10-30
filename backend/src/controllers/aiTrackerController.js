const aiFinancialTrackerService = require('../services/aiFinancialTrackerService');

/**
 * GET /api/ai-tracker
 * Retrieves AI-generated spending insights, overspending warnings, and goal risk diagnostics
 */
const getAITrackerInsights = async (req, res) => {
  try {
    const aiData = await aiFinancialTrackerService.getAITrackerInsights(req.user.id);

    return res.status(200).json({
      success: true,
      data: aiData,
    });
  } catch (error) {
    console.error('Error fetching AI Tracker Insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI financial tracker insights',
      error: error.message,
    });
  }
};

module.exports = {
  getAITrackerInsights,
};
