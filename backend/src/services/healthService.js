/**
 * Health Service - Handles health check business logic
 */

const checkHealthStatus = async () => {
  return {
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SaveSphere Personal Finance API',
  };
};

module.exports = {
  checkHealthStatus,
};
