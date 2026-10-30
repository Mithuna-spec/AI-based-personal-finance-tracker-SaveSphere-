import api from './api';

/**
 * Fetch central financial calculation engine metrics & health scores
 */
export const getFinancialAnalysisApi = async () => {
  const response = await api.get('/financial-analysis');
  return response.data;
};
