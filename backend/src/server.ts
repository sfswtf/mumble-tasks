import mongoose from 'mongoose';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

// Connect to MongoDB
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
}); 