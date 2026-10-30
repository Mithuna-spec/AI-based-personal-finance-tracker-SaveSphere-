const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/responseHandler');

/**
 * GET /api/dashboard/summary
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summaryData = await dashboardService.getDashboardSummary(userId);
    return successResponse(res, 'Dashboard financial summary retrieved', summaryData, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
