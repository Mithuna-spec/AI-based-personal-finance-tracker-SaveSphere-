const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Register Controller
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const result = await authService.registerUser({ fullName, email, password });
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login Controller
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return successResponse(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Controller
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserProfile(userId);
    return successResponse(res, 'User profile retrieved', { user }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile Controller
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, email } = req.body;
    const result = await authService.updateUserProfile(userId, { fullName, email });
    return successResponse(res, 'Profile updated successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password Controller
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changeUserPassword(userId, { currentPassword, newPassword });
    return successResponse(res, 'Password changed successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
