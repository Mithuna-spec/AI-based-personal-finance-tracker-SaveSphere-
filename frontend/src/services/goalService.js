import api from './api';

/**
 * Fetch all financial goals with deterministic calculations for current user
 */
export const getGoalsApi = async (filters = {}) => {
  const response = await api.get('/goals', { params: filters });
  return response.data;
};

/**
 * Create a new financial goal
 */
export const createGoalApi = async (goalData) => {
  const response = await api.post('/goals', goalData);
  return response.data;
};

/**
 * Update an existing financial goal by ID
 */
export const updateGoalApi = async (id, goalData) => {
  const response = await api.put(`/goals/${id}`, goalData);
  return response.data;
};

/**
 * Delete a financial goal by ID
 */
export const deleteGoalApi = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};
