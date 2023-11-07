import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

function createEventBusClient() {

  if (process.env.NODE_ENV === 'test') 
    return new Redis();
  
  // If we are running in a container, use the container name as the host
  if (process.env.EVENT_BUS_CONTAINER_NAME) 
    return new Redis({ host: process.env.EVENT_BUS_CONTAINER_NAME });
  
  // For local deployment, use the local url
  if (process.env.REDIS_EVENT_BUS) 
    return new Redis(process.env.REDIS_EVENT_BUS);

  throw new Error('Event bus environment variables are not defined')
}

export const eventBus = createEventBusClient();