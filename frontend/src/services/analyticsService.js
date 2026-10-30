import api from './api';

/**
 * Fetch aggregated financial analytics data with timeframe filters
 */
export const getAnalyticsApi = async (timeframeMonths = 6) => {
  const response = await api.get('/analytics', {
    params: { timeframeMonths },
  });
  return response.data;
};
