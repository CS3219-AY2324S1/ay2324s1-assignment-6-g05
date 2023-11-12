import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import logger from '../lib/utils/logger';

dotenv.config();

function createDatabaseClient() {
  
  // If we are running in a container, use the container name as the host
  if (process.env.COLLABORATION_CACHE_CONTAINER_NAME) {
    logger.info(`Found database container named: ${process.env.COLLABORATION_CACHE_CONTAINER_NAME}`)
    return new Redis({ host: process.env.COLLABORATION_CACHE_CONTAINER_NAME });
  }

  if (process.env.REDIS_URL) {
    logger.info(`Found database url: ${process.env.REDIS_URL}`)
    return new Redis(process.env.REDIS_URL);
  }

  throw new Error("Collaboration cache environment variables are not defined");
}

export const redis = createDatabaseClient();