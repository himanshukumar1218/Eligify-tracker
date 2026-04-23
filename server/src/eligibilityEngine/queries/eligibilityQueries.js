const db = require('../../db.js');

// Validation helpers 

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


const assertUUID = (value, label) => {
  if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
    throw new TypeError(`[eligibilityQueries] Invalid ${label}: expected a UUID, got "${value}"`);
  }
};


const assertPositiveInt = (value, label) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`[eligibilityQueries] Invalid ${label}: expected a positive integer, got "${value}"`);
  }
};


const getUserData = async (userId) => {
  assertUUID(userId, 'userId');

  const query = `
    SELECT
      -- Identity & demographics (student_profiles)
      p.user_id,
      p.full_name,
      p.phone,
      p.dob,
      p.gender,
      p.category,
      p.is_pwd,
      p.pin_code,
      p.district,
      p.domicile_state,
      p.nationality,

      -- Academics (student_academics)
      a.highest_qualification,
      a.tenth_board,
      a.tenth_percentage,
      a.tenth_passing_year,
      a.twelfth_board,
      a.twelfth_stream,
      a.twelfth_subjects,
      a.twelfth_percentage,
      a.twelfth_passing_year,
      a.diploma_percentage,
      a.programme,
      a.branch,
      a.college,
      a.graduation_status,
      a.gpa,
      a.ug_programme,
      a.ug_branch,
      a.ug_college,
      a.ug_passing_year,
      a.ug_percentage,

      -- Skills & experience (student_skills)
      s.certifications,
      s.has_experience,
      s.exp_years,
      s.exp_field,

      -- Physical attributes (student_physical)
      ph.height_cm,
      ph.weight_kg,
      ph.chest_cm,
      ph.is_physically_fit,
      ph.is_ex_serviceman

    FROM student_profiles p
    LEFT JOIN student_academics a  ON a.user_id = p.user_id
    LEFT JOIN student_skills     s  ON s.user_id = p.user_id
    LEFT JOIN student_physical  ph  ON ph.user_id = p.user_id
    WHERE p.user_id = $1
  `;

  const { rows } = await db.query(query, [userId]);
  return rows[0] ?? null;
};


const getPostData = async (userId, postId) => {
  assertUUID(userId, 'userId');
  assertPositiveInt(postId, 'postId');

  const query = `
    WITH user_meta AS (
      -- Resolve the user's category and PWD status once, reused in both relaxation lookups
      SELECT category, is_pwd
      FROM   student_profiles
      WHERE  user_id = $1
    ),

    category_relaxation AS (
      -- Category-based age relaxation (OBC / SC / ST / EWS)
      SELECT pr.post_id, pr.relaxation_years, pr.max_attempts
      FROM   post_relaxations pr
      JOIN   user_meta um ON pr.category = um.category
      WHERE  pr.post_id = $2
    ),

    pwd_relaxation AS (
      -- PWD relaxation row — only relevant if user is a person with disability.
      -- Convention: PWD-only rows have category = NULL (sentinel agreed at DB level).
      -- Adjust this filter if your team stores it differently.
      SELECT pr.post_id, pr.relaxation_years, pr.max_attempts
      FROM   post_relaxations pr
      JOIN   user_meta um ON um.is_pwd = TRUE
      WHERE  pr.post_id = $2
        AND  pr.category IS NULL
    )

    SELECT
      -- Post core fields
      ep.id                       AS post_id,
      ep.post_name,
      ep.department,
      ep.min_age,
      ep.max_age,
      ep.allowed_genders::text[]  AS allowed_genders,
      ep.rules,

      -- Exam-level fields
      ex.id                       AS exam_id,
      ex.exam_name,
      ex.organisation,
      ex.sector,
      ex.status                   AS exam_status,
      ex.application_start,
      ex.application_end,
      ex.age_criteria_date,
      ex.allowed_states,
      ex.application_fees,
      ex.official_link ,

      -- Education criteria — aggregated as JSON array (OR logic, see note 1)
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'required_qualification', pec.required_qualification,
          'allowed_programmes',     pec.allowed_programmes,
          'allowed_branches',       pec.allowed_branches,
          'min_percentage',         pec.min_percentage,
          'final_year_allowed',     pec.final_year_allowed,
          'allowed_10th_boards',    pec.allowed_10th_boards,
          'allowed_12th_boards',    pec.allowed_12th_boards,
          'allowed_12th_streams',   pec.allowed_12th_streams,
          'required_subjects',      pec.required_subjects
        )
      ) FILTER (WHERE pec.id IS NOT NULL) AS education_criteria,

      -- Special requirements
      psr.physical_criteria,
      psr.experience_criteria,
      psr.required_certifications,
      psr.domicile_required,
      psr.domicile_states,

      -- Relaxation: category takes precedence over PWD (see note 2)
      COALESCE(cr.relaxation_years, wr.relaxation_years, 0)  AS relaxation_years,
      COALESCE(cr.max_attempts,     wr.max_attempts)         AS max_attempts

    FROM exam_posts ep
    JOIN exams ex
      ON ex.id = ep.exam_id

    LEFT JOIN post_education_criteria pec
      ON pec.post_id = ep.id

    LEFT JOIN post_special_requirements psr
      ON psr.post_id = ep.id

    LEFT JOIN category_relaxation cr
      ON cr.post_id = ep.id

    LEFT JOIN pwd_relaxation wr
      ON wr.post_id = ep.id

    WHERE ep.id = $2

    GROUP BY
      ep.id,
      ep.post_name,
      ep.department,
      ep.min_age,
      ep.max_age,
      ep.allowed_genders,
      ep.rules,
      ex.id,
      ex.exam_name,
      ex.organisation,
      ex.sector,
      ex.status,
      ex.application_start,
      ex.application_end,
      ex.official_link ,
      ex.age_criteria_date,
      ex.allowed_states,
      ex.application_fees,
      psr.physical_criteria,
      psr.experience_criteria,
      psr.required_certifications,
      psr.domicile_required,
      psr.domicile_states,
      cr.relaxation_years,
      cr.max_attempts,
      wr.relaxation_years,
      wr.max_attempts
  `;

  const { rows } = await db.query(query, [userId, postId]);
  return rows[0] ?? null;
};
/**
 * Fetches every active exam post along with the specific relaxations 
 * that apply to the requesting user based on their profile.
 * * @param {string} userId - UUID of the user to determine applicable relaxations
 * @returns {Promise<Array>} - List of denormalized post objects
 */
/**
 * Fetches all active exam posts with tailored relaxations for a specific user.
 * Corrected to explicitly group by all psr requirement columns.
 */
const getAllPostsData = async (userId) => {
  assertUUID(userId, 'userId');

  const query = `
    WITH user_meta AS (
      SELECT category, is_pwd FROM student_profiles WHERE user_id = $1
    ),
    applicable_relaxations AS (
      SELECT pr.post_id, pr.relaxation_years, pr.max_attempts
      FROM   post_relaxations pr
      JOIN   user_meta um 
        ON   (pr.category = um.category) 
        OR   (pr.category IS NULL AND um.is_pwd = TRUE)
    )
    SELECT
      ep.id AS post_id,
      ep.post_name,
      ep.department,
      ep.min_age,
      ep.max_age,
      ep.allowed_genders::text[] AS allowed_genders,
      ex.id AS exam_id,
      ex.exam_name,
      ex.organisation,
      ex.application_start, -- ADD THIS
      ex.application_end,
      ex.age_criteria_date,
      ex.official_link ,

      -- Aggregate education paths
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'required_qualification', pec.required_qualification,
          'allowed_programmes',     pec.allowed_programmes,
          'allowed_branches',       pec.allowed_branches,
          'min_percentage',         pec.min_percentage,
          'final_year_allowed',     pec.final_year_allowed,
          'allowed_10th_boards',    pec.allowed_10th_boards,
          'allowed_12th_boards',    pec.allowed_12th_boards,
          'allowed_12th_streams',   pec.allowed_12th_streams,
          'required_subjects',      pec.required_subjects
        ) ORDER BY pec.id
      ) FILTER (WHERE pec.id IS NOT NULL) AS education_criteria,

      -- Special requirements columns
      psr.physical_criteria,
      psr.experience_criteria,
      psr.required_certifications,
      psr.domicile_required,
      psr.domicile_states,

      -- Use MAX to handle cases where a user might qualify for multiple relaxations
      COALESCE(MAX(ar.relaxation_years), 0) AS relaxation_years

    FROM exam_posts ep
    JOIN exams ex ON ex.id = ep.exam_id
    LEFT JOIN post_education_criteria pec ON pec.post_id = ep.id
    LEFT JOIN post_special_requirements psr ON psr.post_id = ep.id
    LEFT JOIN applicable_relaxations ar ON ar.post_id = ep.id

    --WHERE ex.application_end >= CURRENT_DATE 
     -- AND ex.status = 'active'

    GROUP BY 
      ep.id, ep.post_name, ep.department, ep.min_age, ep.max_age, ep.allowed_genders,
      ex.id, ex.exam_name, ex.organisation,ex.application_start,ex.official_link , ex.application_end, ex.age_criteria_date,
      -- List all psr columns to satisfy Postgres grouping rules
      psr.physical_criteria,
      psr.experience_criteria,
      psr.required_certifications,
      psr.domicile_required,
      psr.domicile_states
  `;

  const { rows } = await db.query(query, [userId]);
  return rows;
};

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = { getUserData, getPostData , getAllPostsData };
