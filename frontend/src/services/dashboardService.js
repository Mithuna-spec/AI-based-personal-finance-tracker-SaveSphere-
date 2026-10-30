import api from './api';

/**
 * Fetch financial dashboard summary data for current user
 */
export const getDashboardSummaryApi = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};
