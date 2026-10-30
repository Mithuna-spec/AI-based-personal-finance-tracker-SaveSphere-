const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 SaveSphere Backend Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health Check Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma client disconnected. Exiting process.');
  process.exit(0);
});

startServer();
