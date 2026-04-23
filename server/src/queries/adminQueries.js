const db = require('../db');
const { normalizeAdminPayload } = require('../utils/persistenceNormalization');

/**
 * Helper to convert empty strings or empty values into proper NULLs for PostgreSQL.
 * This prevents the "invalid input syntax for type date: ''" error.
 */
const n = (val) => (val === "" || val === undefined || val === null ? null : val);

const insertExamNotification = async (examData, postsData) => {
  const client = await db.connect();
  const normalized = normalizeAdminPayload(examData, postsData);
  const examPayload = normalized.exam;
  const postsPayload = normalized.posts;

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. INSERT EXAM
    const examQuery = `
      INSERT INTO exams (
        exam_name, organisation, sector, status, official_link, 
        notification_date, application_start, application_end, 
        last_correction_date, age_criteria_date, admit_card_release_date, 
        exam_city_details_date, exam_date, result_release_date, 
        application_fees, allowed_states
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`;

    const examValues = [
      examPayload.exam_name, 
      examPayload.organisation, 
      examPayload.sector, 
      examPayload.status, 
      examPayload.official_link,
      n(examPayload.notification_date),    // Sanitized optional date
      n(examPayload.application_start),   // Sanitized optional date
      n(examPayload.application_end),     // Sanitized optional date
      n(examPayload.last_correction_date), 
      examPayload.age_criteria_date,       // Required field
      n(examPayload.admit_card_release_date),
      n(examPayload.exam_city_details_date), 
      n(examPayload.exam_date), 
      n(examPayload.result_release_date),
      JSON.stringify(examPayload.application_fees), 
      examPayload.allowed_states
    ];

    const { rows } = await client.query(examQuery, examValues);
    const examId = rows[0].id;

    // 2. LOOP THROUGH POSTS
    for (const post of postsPayload) {
      const postQuery = `
        INSERT INTO exam_posts (exam_id, post_name, department, min_age, max_age, allowed_genders, rules)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      
      const { rows: postRows } = await client.query(postQuery, [
        examId, 
        post.post_name, 
        post.department, 
        post.min_age, 
        post.max_age, 
        post.allowed_genders, 
        post.rules
      ]);
      const postId = postRows[0].id;

      // 3. INSERT EDUCATION CRITERIA (OR Logic)
      for (const edu of post.education_criteria) {
        await client.query(`
          INSERT INTO post_education_criteria (
            post_id, required_qualification, allowed_programmes, 
            allowed_branches, min_percentage, final_year_allowed,
            allowed_10th_boards, allowed_12th_boards, allowed_12th_streams, required_subjects
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
          [
            postId, 
            edu.required_qualification, 
            edu.allowed_programmes, 
            edu.allowed_branches, 
            n(edu.min_percentage), // Sanitized numeric field
            edu.final_year_allowed,
            edu.allowed_10th_boards,
            edu.allowed_12th_boards,
            edu.allowed_12th_streams,
            edu.required_subjects,
          ]
        );
      }

      // 4. INSERT RELAXATIONS
      for (const rel of post.relaxations) {
        await client.query(`
          INSERT INTO post_relaxations (post_id, category, relaxation_years, max_attempts)
          VALUES ($1, $2, $3, $4)`,
          [
            postId, 
            rel.category, 
            rel.relaxation_years, 
            n(rel.max_attempts) // Sanitized optional integer
          ]
        );
      }

      // 5. INSERT SPECIAL REQUIREMENTS (Physicals, Exp, Domicile)
      await client.query(`
        INSERT INTO post_special_requirements (
          post_id, physical_criteria, experience_criteria, 
          required_certifications, domicile_required, domicile_states
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          postId, 
          JSON.stringify(post.special_requirements.physical_criteria),
          JSON.stringify(post.special_requirements.experience_criteria),
          post.special_requirements.required_certifications,
          post.special_requirements.domicile_required,
          post.special_requirements.domicile_states
        ]
      );
    }

    await client.query('COMMIT'); // Finalize transaction
    return examId;

  } catch (error) {
    await client.query('ROLLBACK'); // Undo all inserts on any failure
    throw error;
  } finally {
    client.release(); // Return connection to pool
  }
};

module.exports = { insertExamNotification };
