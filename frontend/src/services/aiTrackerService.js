import api from './api';

/**
 * Fetch AI Financial Tracker Insights
 */
export const getAITrackerInsightsApi = async () => {
  const response = await api.get('/ai-tracker');
  return response.data;
};
