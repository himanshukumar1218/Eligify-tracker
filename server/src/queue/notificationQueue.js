const { Queue } = require("bullmq");
require('dotenv').config();

console.log('[db] Available Environment Keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NODE_')));

if (process.env.REDIS_URL) {
    console.log('[db] SUCCESS: REDIS_URL found in environment.');
} else {
    console.log('[db] WARNING: REDIS_URL is MISSING from environment. Falling back to localhost.');
}

const connection = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };

const notificationQueue = new Queue('NotificationQueue', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: 1000,
      backoff: {
        type: "exponential",
        delay: 2000
      }
    }
});

module.exports = { notificationQueue, connection };
