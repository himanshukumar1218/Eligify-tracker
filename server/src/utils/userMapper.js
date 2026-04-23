// utils/userMapper.js

/**
 * Maps Raw Database Row (snake_case) to Frontend State (camelCase)
 */
exports.toFrontendProfile = (db) => {
  if (!db) return null;

  return {
    basic: {
      fullName: db.full_name || '',
      dob: db.dob ? new Date(db.dob).toISOString().split('T')[0] : '',
      phone: db.phone || '',
      gender: db.gender || '',
      category: db.category || '',
      isPwD: db.is_pwd !== null ? (db.is_pwd ? 'true' : 'false') : '',
      district: db.district || '',
      domicile: db.domicile_state || '',
      nationality: db.nationality || 'Indian',
      pinCode: db.pin_code || ''
    },
    academic: {
      highestQualification: db.highest_qualification || '',
      tenthBoard: db.tenth_board || '',
      tenthPercentage: db.tenth_percentage?.toString() || '',
      tenthPassingYear: db.tenth_passing_year?.toString() || '',
      twelfthBoard: db.twelfth_board || '',
      twelfthStream: db.twelfth_stream || '',
      twelfthSubjects: db.twelfth_subjects || [],
      twelfthPercentage: db.twelfth_percentage?.toString() || '',
      twelfthPassingYear: db.twelfth_passing_year?.toString() || '',
      diplomaPercentage: db.diploma_percentage?.toString() || '',
      programme: db.programme || '',
      branch: db.branch || '',
      graduationStatus: db.graduation_status || '',
      college: db.college || '',
      gpa: db.gpa?.toString() || '',
      ugProgramme: db.ug_programme || '',
      ugBranch: db.ug_branch || '',
      ugCollege: db.ug_college || '',
      ugPassingYear: db.ug_passing_year?.toString() || '',
      ugPercentage: db.ug_percentage?.toString() || '',
    },
    certifications: db.certifications || [],
    experience: {
      hasExperience: db.has_experience ? 'true' : 'false',
      years: db.exp_years?.toString() || '',
      field: db.exp_field || ''
    },
    physical: {
      height: db.height_cm?.toString() || '',
      weight: db.weight_kg?.toString() || '',
      chest: db.chest_cm?.toString() || '',
      isPhysicalFit: db.is_physically_fit ? 'true' : 'false'
    },
    other: {
      isExServiceman: db.is_ex_serviceman // Uses boolean as expected by your "other" logic
    }
  };
};