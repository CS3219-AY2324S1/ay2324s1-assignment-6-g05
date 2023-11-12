import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

function createEventBus() {

  // Service discovery deployment of redis-server
  if (process.env.EVENT_BUS_CONTAINER_NAME) {
    return new Redis({ host: process.env.EVENT_BUS_CONTAINER_NAME })
  }

  // Local deployment of redis-server
  if (process.env.REDIS_EVENT_BUS) {
    return new Redis(process.env.REDIS_EVENT_BUS);
  }
  
  console.log(`URL not defined`)
  return new Redis();
}

const eventBus = createEventBus();

eventBus.on("error", (error: Error) => {

  if ('code' in error && error.code === "ECONNREFUSED") {
    console.log("Redis connection refused, retrying...");
  } else if ('code' in error && error.code === "ECONNRESET") {
    console.log("Redis connection timed out. Retrying...");
  } else {
    console.log(error, "Redis error")
  }
});

eventBus.on('close', (error: Error) => {
  if (eventBus.status === 'close') console.log('Redis Event Bus connection closed.');
});

eventBus.on('reconnecting', (error: Error) => {
  if (eventBus.status === 'reconnecting')
    console.log('Reconnecting to Redis Event Bus...');
  else console.log('Error reconnecting to Redis Event Bus.');
});

// Listen to the 'connect' event to Redis
eventBus.on('connect', (error: Error) => {
  if (!error) console.log('Connected to event bus');
});

export default eventBus;

