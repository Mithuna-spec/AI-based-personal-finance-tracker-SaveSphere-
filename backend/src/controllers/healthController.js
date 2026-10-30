const healthService = require('../services/healthService');

/**
 * Health Controller
 * GET /api/health
 */
const getHealthStatus = async (req, res, next) => {
  try {
    await healthService.checkHealthStatus();
    return res.status(200).json({
      success: true,
      message: "SaveSphere API is running"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthStatus,
};
