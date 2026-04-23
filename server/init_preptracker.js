const pool = require('./src/db.js');

const init = async () => {
  try {
    // 1. Create prep_daily_notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prep_daily_notes (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
          note_date DATE NOT NULL DEFAULT CURRENT_DATE,
          content TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, exam_id, note_date)
      );
    `);
    console.log("Created prep_daily_notes table");

    // 2. Add Composite Indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prep_tasks_user_exam ON prep_tasks(user_id, exam_id);
    `);
    console.log("Created composite index on prep_tasks");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prep_daily_notes_user_exam ON prep_daily_notes(user_id, exam_id);
    `);
    console.log("Created composite index on prep_daily_notes");

    // If there is existing data in prep_notes, we can optionally migrate it, but assuming new feature, we can leave it.
    // For safety, let's copy existing notes to the new table if it's empty
    await pool.query(`
      INSERT INTO prep_daily_notes (user_id, exam_id, note_date, content, updated_at)
      SELECT user_id, exam_id, CURRENT_DATE, content, updated_at
      FROM prep_notes
      ON CONFLICT DO NOTHING;
    `);
    console.log("Migrated existing notes to daily notes");

  } catch (err) {
    console.error("DB Init Error:", err);
  } finally {
    process.exit(0);
  }
};

init();
