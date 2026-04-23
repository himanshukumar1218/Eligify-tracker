// userDetailsQueries.js
const pool = require('../db.js');

exports.getUserFullProfile = async (userId) => {
  const query = `
    SELECT 
      p.full_name, p.dob, p.phone, p.gender, p.category, p.is_pwd, p.pin_code, p.district, p.domicile_state, p.nationality,
      a.highest_qualification, a.tenth_board, a.tenth_percentage, a.tenth_passing_year,
      a.twelfth_board, a.twelfth_stream, a.twelfth_subjects, a.twelfth_percentage, a.twelfth_passing_year,
      a.diploma_percentage, a.programme, a.branch, a.graduation_status, a.college, a.gpa,
      a.ug_programme, a.ug_branch, a.ug_college, a.ug_passing_year, a.ug_percentage,
      s.certifications, s.has_experience, s.exp_years, s.exp_field,
      ph.height_cm, ph.weight_kg, ph.chest_cm, ph.is_physically_fit, ph.is_ex_serviceman
    FROM student_profiles p
    LEFT JOIN student_academics a ON p.user_id = a.user_id
    LEFT JOIN student_skills s ON p.user_id = s.user_id
    LEFT JOIN student_physical ph ON p.user_id = ph.user_id
    WHERE p.user_id = $1;
  `;
  
  const { rows } = await pool.query(query, [userId]);
  return rows[0]; // Returns the single merged profile object
};
