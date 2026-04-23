const pool = require('./src/db.js');

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_notifications (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          post_id INTEGER REFERENCES exam_posts(id) ON DELETE CASCADE,
          is_read BOOLEAN DEFAULT FALSE,
          category VARCHAR(50) DEFAULT 'system',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table student_notifications created successfully!");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_documents (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          document_type VARCHAR(255) NOT NULL,
          public_url TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, document_type)
      );
    `);
    console.log("Table user_documents created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit(0);
  }
};

createTable();
