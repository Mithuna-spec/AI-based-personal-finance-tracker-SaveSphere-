const emergencyFundService = require('../services/emergencyFundService');
const { successResponse } = require('../utils/responseHandler');

/**
 * GET /api/emergency-fund
 */
const getEmergencyFund = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await emergencyFundService.getEmergencyFund(userId);
    return successResponse(res, 'Emergency fund details retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/emergency-fund
 */
const saveEmergencyFund = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const fund = await emergencyFundService.upsertEmergencyFund(userId, req.body);
    return successResponse(res, 'Emergency fund configuration saved successfully', fund, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/emergency-fund/:id
 */
const deleteEmergencyFund = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const fundId = req.params.id;
    const result = await emergencyFundService.deleteEmergencyFund(userId, fundId);
    return successResponse(res, 'Emergency fund configuration reset', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmergencyFund,
  saveEmergencyFund,
  deleteEmergencyFund,
};
