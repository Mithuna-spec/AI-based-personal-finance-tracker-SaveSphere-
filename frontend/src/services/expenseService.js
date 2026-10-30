import api from './api';

/**
 * Fetch all expense records for current user
 */
export const getExpensesApi = async (filters = {}) => {
  const response = await api.get('/expenses', { params: filters });
  return response.data;
};

/**
 * Create a new expense record
 */
export const createExpenseApi = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

/**
 * Update an existing expense record by ID
 */
export const updateExpenseApi = async (id, expenseData) => {
  const response = await api.put(`/expenses/${id}`, expenseData);
  return response.data;
};

/**
 * Delete an expense record by ID
 */
export const deleteExpenseApi = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
