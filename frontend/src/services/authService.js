import api from './api';

/**
 * Register user API call
 */
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user API call
 */
export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user profile API call
 */
export const getCurrentUserApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update profile details (fullName, email)
 */
export const updateProfileApi = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

/**
 * Change password
 */
export const changePasswordApi = async (data) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};
