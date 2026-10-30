import api from './api';

/**
 * Fetch all EMI / Loan records for current user
 */
export const getEMIsApi = async (filters = {}) => {
  const response = await api.get('/emis', { params: filters });
  return response.data;
};

/**
 * Create a new loan / EMI record
 */
export const createEMIApi = async (emiData) => {
  const response = await api.post('/emis', emiData);
  return response.data;
};

/**
 * Update an existing loan / EMI record by ID
 */
export const updateEMIApi = async (id, emiData) => {
  const response = await api.put(`/emis/${id}`, emiData);
  return response.data;
};

/**
 * Delete a loan / EMI record by ID
 */
export const deleteEMIApi = async (id) => {
  const response = await api.delete(`/emis/${id}`);
  return response.data;
};
