const pool = require('../db.js');
const { normalizeStudentPayload } = require('../utils/persistenceNormalization');

exports.saveFullUserOnboarding = async (data, userId) => {
  const client = await pool.connect();
  const normalizedData = normalizeStudentPayload(data);

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Insert Personal Details
    const personalQuery = `
  INSERT INTO student_profiles 
  (full_name, dob, phone, gender, category, is_pwd, pin_code, district, domicile_state, user_id)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    dob = EXCLUDED.dob,
    phone = EXCLUDED.phone,
    gender = EXCLUDED.gender,
    category = EXCLUDED.category,
    is_pwd = EXCLUDED.is_pwd,
    pin_code = EXCLUDED.pin_code,
    district = EXCLUDED.district,
    domicile_state = EXCLUDED.domicile_state
  RETURNING *;
`;

    const personalValues = [
      normalizedData.basic.fullName,
      normalizedData.basic.dob,
      normalizedData.basic.phone || null,
      normalizedData.basic.gender || null,
      normalizedData.basic.category || null,
      normalizedData.basic.isPwD,
      normalizedData.basic.pinCode || null,
      normalizedData.basic.district || null,
      normalizedData.basic.domicile || null,
      userId
    ];

    const personalRes = await client.query(personalQuery, personalValues);

    // 2. Insert Academic Details
    // userDetailsQueries.js

const academicQuery = `
  INSERT INTO student_academics 
  (
    highest_qualification,
    tenth_board,
    tenth_percentage,
    tenth_passing_year,
    twelfth_board,
    twelfth_stream,
    twelfth_subjects,
    twelfth_percentage,
    twelfth_passing_year,
    diploma_percentage,
    programme,
    branch,
    graduation_status,
    college,
    gpa,
    ug_programme,
    ug_branch,
    ug_college,
    ug_passing_year,
    ug_percentage,
    user_id
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
  ON CONFLICT (user_id) DO UPDATE SET
    highest_qualification = EXCLUDED.highest_qualification,
    tenth_board = EXCLUDED.tenth_board,
    tenth_percentage = EXCLUDED.tenth_percentage,
    tenth_passing_year = EXCLUDED.tenth_passing_year,
    twelfth_board = EXCLUDED.twelfth_board,
    twelfth_stream = EXCLUDED.twelfth_stream,
    twelfth_subjects = EXCLUDED.twelfth_subjects,
    twelfth_percentage = EXCLUDED.twelfth_percentage,
    twelfth_passing_year = EXCLUDED.twelfth_passing_year,
    diploma_percentage = EXCLUDED.diploma_percentage,
    programme = EXCLUDED.programme,
    branch = EXCLUDED.branch,
    graduation_status = EXCLUDED.graduation_status,
    college = EXCLUDED.college,
    gpa = EXCLUDED.gpa,
    ug_programme = EXCLUDED.ug_programme,
    ug_branch = EXCLUDED.ug_branch,
    ug_college = EXCLUDED.ug_college,
    ug_passing_year = EXCLUDED.ug_passing_year,
    ug_percentage = EXCLUDED.ug_percentage
  RETURNING *;
`;

const academicValues = [
  normalizedData.academic.highestQualification,
  normalizedData.academic.tenthBoard || null,
  normalizedData.academic.tenthPercentage || null,
  normalizedData.academic.tenthPassingYear || null,
  normalizedData.academic.twelfthBoard || null,
  normalizedData.academic.twelfthStream || null,
  normalizedData.academic.twelfthSubjects || null,
  normalizedData.academic.twelfthPercentage || null,
  normalizedData.academic.twelfthPassingYear || null,
  normalizedData.academic.diplomaPercentage || null,
  normalizedData.academic.programme || null,
  normalizedData.academic.branch || null,
  normalizedData.academic.graduationStatus || null,
  normalizedData.academic.college || null,
  normalizedData.academic.gpa || null,
  normalizedData.academic.ugProgramme || null,
  normalizedData.academic.ugBranch || null,
  normalizedData.academic.ugCollege || null,
  normalizedData.academic.ugPassingYear || null,
  normalizedData.academic.ugPercentage || null,
  userId
];

    const academicRes = await client.query(academicQuery, academicValues);

    const skillsQuery = `
  INSERT INTO student_skills 
  (certifications, has_experience, exp_years, exp_field, user_id)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (user_id) DO UPDATE SET
    certifications = EXCLUDED.certifications,
    has_experience = EXCLUDED.has_experience,
    exp_years = EXCLUDED.exp_years,
    exp_field = EXCLUDED.exp_field
  RETURNING *;
`;

    const skillsValues = [
      normalizedData.certifications || null,
      normalizedData.experience.hasExperience,
      normalizedData.experience.years || null,
      normalizedData.experience.field || null,
      userId
    ];

    const skillsRes = await client.query(skillsQuery, skillsValues);

    const physicalQuery = `
  INSERT INTO student_physical 
  (height_cm, weight_kg, chest_cm, is_physically_fit, is_ex_serviceman, user_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (user_id) DO UPDATE SET
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg,
    chest_cm = EXCLUDED.chest_cm,
    is_physically_fit = EXCLUDED.is_physically_fit,
    is_ex_serviceman = EXCLUDED.is_ex_serviceman
  RETURNING *;
`;

    const physicalValues = [
      normalizedData.physical.height || null,
      normalizedData.physical.weight || null,
      normalizedData.physical.chest || null,
      normalizedData.physical.isPhysicalFit,
      normalizedData.other.isExServiceman,
      userId
    ];

    const physicalRes = await client.query(physicalQuery, physicalValues);

    await client.query('COMMIT'); // Save everything
    return {
      personal: personalRes.rows[0],
      academic: academicRes.rows[0],
      skills: skillsRes.rows[0],
      physical: physicalRes.rows[0]
    };

  } catch (error) {
    await client.query('ROLLBACK'); // Cancel everything on error
    throw error;
  } finally {
    client.release();
  }
};
