const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/responseHandler');

/**
 * GET /api/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeframeMonths } = req.query;
    const analytics = await analyticsService.getAnalyticsData(userId, timeframeMonths);
    return successResponse(res, 'Aggregated financial analytics retrieved', analytics, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};
