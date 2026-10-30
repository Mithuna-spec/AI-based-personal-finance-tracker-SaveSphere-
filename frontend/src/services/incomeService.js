import api from './api';

/**
 * Fetch all income records for current user
 */
export const getIncomesApi = async (filters = {}) => {
  const response = await api.get('/incomes', { params: filters });
  return response.data;
};

/**
 * Create a new income record
 */
export const createIncomeApi = async (incomeData) => {
  const response = await api.post('/incomes', incomeData);
  return response.data;
};

/**
 * Update an existing income record by ID
 */
export const updateIncomeApi = async (id, incomeData) => {
  const response = await api.put(`/incomes/${id}`, incomeData);
  return response.data;
};

/**
 * Delete an income record by ID
 */
export const deleteIncomeApi = async (id) => {
  const response = await api.delete(`/incomes/${id}`);
  return response.data;
};
