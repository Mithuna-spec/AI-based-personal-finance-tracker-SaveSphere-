const emiService = require('../services/emiService');
const { successResponse } = require('../utils/responseHandler');

/**
 * POST /api/emis
 */
const createEMI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newEMI = await emiService.createEMI(userId, req.body);
    return successResponse(res, 'EMI / Loan record added successfully', newEMI, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/emis
 */
const getAllEMIs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const result = await emiService.getAllEMIs(userId, { status });
    return successResponse(res, 'EMI / Loan records retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/emis/:id
 */
const getEMIById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const emiId = req.params.id;
    const emi = await emiService.getEMIById(userId, emiId);
    return successResponse(res, 'EMI / Loan record retrieved', emi, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/emis/:id
 */
const updateEMI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const emiId = req.params.id;
    const updatedEMI = await emiService.updateEMI(userId, emiId, req.body);
    return successResponse(res, 'EMI / Loan record updated successfully', updatedEMI, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/emis/:id
 */
const deleteEMI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const emiId = req.params.id;
    const result = await emiService.deleteEMI(userId, emiId);
    return successResponse(res, 'EMI / Loan record deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEMI,
  getAllEMIs,
  getEMIById,
  updateEMI,
  deleteEMI,
};
