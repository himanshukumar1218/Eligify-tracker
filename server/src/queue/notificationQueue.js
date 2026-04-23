const { Queue } = require("bullmq");
const dotenv = require("dotenv");
dotenv.config();

const connection = {
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
