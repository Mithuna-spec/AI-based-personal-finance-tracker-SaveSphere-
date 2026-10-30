import api from './api';

/**
 * Fetch emergency fund configuration & calculated metrics
 */
export const getEmergencyFundApi = async () => {
  const response = await api.get('/emergency-fund');
  return response.data;
};

/**
 * Save / Update emergency fund configuration
 */
export const saveEmergencyFundApi = async (fundData) => {
  const response = await api.post('/emergency-fund', fundData);
  return response.data;
};

/**
 * Reset emergency fund configuration
 */
export const deleteEmergencyFundApi = async (id) => {
  const response = await api.delete(`/emergency-fund/${id}`);
  return response.data;
};
