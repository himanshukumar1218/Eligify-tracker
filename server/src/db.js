const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const missingEnv = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'].filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error('[db] Missing required environment variables:', missingEnv.join(', '));
}

console.log('[db] Initializing PostgreSQL pool', {
  user: process.env.DB_USER || '(missing)',
  host: process.env.DB_HOST || '(missing)',
  port: process.env.DB_PORT || '(missing)',
  database: process.env.DB_NAME || '(missing)',
});

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 600000,
});

pool.on('error', (error) => {
  console.error('[db] Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
