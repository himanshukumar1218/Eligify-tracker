const { Queue } = require("bullmq");
const Redis = require("ioredis");
require('dotenv').config();

// Support both individual parts and single REDIS_URL
let connection;
if (process.env.REDIS_URL) {
    console.log('[db] SUCCESS: REDIS_URL found. Initializing Production Redis connection...');
    connection = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });
} else {
    console.log('[db] WARNING: REDIS_URL is MISSING. Falling back to localhost.');
    connection = {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    };
}

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
