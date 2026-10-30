const financialAnalysisService = require('../services/financialAnalysisService');
const { successResponse } = require('../utils/responseHandler');

/**
 * GET /api/financial-analysis
 */
const getAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analysis = await financialAnalysisService.getFinancialAnalysis(userId);
    return successResponse(res, 'Central financial analysis engine calculations retrieved', analysis, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalysis,
};
