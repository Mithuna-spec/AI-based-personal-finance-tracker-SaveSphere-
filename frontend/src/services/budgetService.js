import api from './api';

/**
 * Fetch all budget records with real utilization data for current user
 */
export const getBudgetsApi = async (filters = {}) => {
  const response = await api.get('/budgets', { params: filters });
  return response.data;
};

/**
 * Create a new budget cap
 */
export const createBudgetApi = async (budgetData) => {
  const response = await api.post('/budgets', budgetData);
  return response.data;
};

/**
 * Update an existing budget cap by ID
 */
export const updateBudgetApi = async (id, budgetData) => {
  const response = await api.put(`/budgets/${id}`, budgetData);
  return response.data;
};

/**
 * Delete a budget cap by ID
 */
export const deleteBudgetApi = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};
