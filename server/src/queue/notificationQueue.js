const { Queue } = require("bullmq");
const dotenv = require("dotenv");
dotenv.config();

// Support both individual parts and single REDIS_URL
if (process.env.REDIS_URL) {
    console.log('[db] REDIS_URL detected. Connecting to production Redis...');
} else {
    console.log('[db] REDIS_URL not found. Falling back to localhost...');
}

const connection = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
      host: process.env.REDIS_HOST || 'localhost',
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
