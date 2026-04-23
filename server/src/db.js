const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// check if we are using a single URL or individual parts
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] Error: DATABASE_URL is missing from .env');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 600000,
});

pool.on('connect', () => {
  console.log('[db] Connected to PostgreSQL successfully');
});

pool.on('error', (error) => {
  console.error('[db] Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;