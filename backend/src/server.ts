import mongoose from 'mongoose';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

// Safe confirmation that API keys are present (redacted)
if (config.assemblyaiApiKey) {
  const key = config.assemblyaiApiKey;
  const redacted = `${key.slice(0, 6)}...${key.slice(-4)}`;
  logger.info(`AssemblyAI key loaded: ${redacted}`);
} else {
  logger.warn('AssemblyAI key missing. Set ASSEMBLYAI_API_KEY in backend/.env');
}

if (config.anthropicApiKey) {
  const key = config.anthropicApiKey;
  const redacted = `${key.slice(0, 6)}...${key.slice(-4)}`;
  logger.info(`Anthropic key loaded: ${redacted}`);
} else {
  logger.warn('Anthropic key missing. Set ANTHROPIC_API_KEY in backend/.env');
}

// Connect to MongoDB (non-fatal in dev)
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    logger.warn('Continuing without MongoDB connection (dev mode).');
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