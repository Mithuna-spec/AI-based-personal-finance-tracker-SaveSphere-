import api from './api';

/**
 * Fetch smart money allocation recommendation breakdown
 */
export const getAllocationRecommendationApi = async () => {
  const response = await api.get('/recommendations/allocation');
  return response.data;
};

/**
 * Fetch personalized AI financial recommendations and answers to core questions
 */
export const getPersonalizedRecommendationsApi = async () => {
  const response = await api.get('/recommendations/personalized');
  return response.data;
};
