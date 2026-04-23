const pool = require('../db.js');

exports.listExams = async () => {
  const query = `
    SELECT id, exam_name, organisation, sector, status
    FROM exams
    WHERE status IN ('Upcoming', 'Active')
    ORDER BY exam_name ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

exports.insertPrepTask = async (userId, examId, title, dueDate) => {
  const query = `
    INSERT INTO prep_tasks (user_id, exam_id, title, due_date)
    VALUES ($1, $2, $3, $4)
    RETURNING id, exam_id, title, due_date, completed, completed_at, created_at, updated_at;
  `;
  // Passes null neatly to the DB if dueDate is missing
  const { rows } = await pool.query(query, [userId, examId, title, dueDate || null]);
  return rows[0]; 
};

exports.listPrepTasksByExam = async (userId, examId) => {
  const query = `
    SELECT id, title, due_date, completed, completed_at, created_at, updated_at
    FROM prep_tasks
    WHERE user_id = $1 AND exam_id = $2
    ORDER BY created_at ASC;
  `;
  const { rows } = await pool.query(query, [userId, examId]);
  return rows;
};

exports.togglePrepTask = async (taskId, userId) => {
  const query = `
    UPDATE prep_tasks
    SET completed = NOT completed,
        completed_at = CASE WHEN NOT completed THEN CURRENT_DATE ELSE NULL END,
        updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, completed, completed_at, updated_at;
  `;
  const { rows } = await pool.query(query, [taskId, userId]);
  return rows[0]; // will return undefined if no exact match (due to userId ownership)
};

exports.deletePrepTask = async (taskId, userId) => {
  const query = `
    DELETE FROM prep_tasks
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const { rows } = await pool.query(query, [taskId, userId]);
  return rows[0]; 
};

exports.upsertPrepNote = async (userId, examId, content) => {
  const query = `
    INSERT INTO prep_notes (user_id, exam_id, content)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, exam_id) DO UPDATE
        SET content = EXCLUDED.content,
            updated_at = NOW()
    RETURNING id, exam_id, content, updated_at;
  `;
  const { rows } = await pool.query(query, [userId, examId, content]);
  return rows[0];
};

exports.getPrepNote = async (userId, examId) => {
  const query = `
    SELECT content, updated_at
    FROM prep_notes
    WHERE user_id = $1 AND exam_id = $2
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [userId, examId]);
  return rows[0];
};
exports.upsertPrepDailyNote = async (userId, examId, noteDate, content) => {
  const query = `
    INSERT INTO prep_daily_notes (user_id, exam_id, note_date, content)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, exam_id, note_date) DO UPDATE
        SET content = EXCLUDED.content,
            updated_at = NOW()
    RETURNING id, exam_id, note_date, content, updated_at;
  `;
  const { rows } = await pool.query(query, [userId, examId, noteDate, content]);
  return rows[0];
};

exports.getPrepDailyNotes = async (userId, examId) => {
  const query = `
    SELECT id, note_date, content, updated_at
    FROM prep_daily_notes
    WHERE user_id = $1 AND exam_id = $2
    ORDER BY note_date DESC;
  `;
  const { rows } = await pool.query(query, [userId, examId]);
  return rows;
};

exports.getPrepStatsData = async (userId, examId) => {
  const tasksQuery = `
    SELECT completed, completed_at
    FROM prep_tasks
    WHERE user_id = $1 AND exam_id = $2;
  `;
  const { rows } = await pool.query(tasksQuery, [userId, examId]);
  return rows;
};
