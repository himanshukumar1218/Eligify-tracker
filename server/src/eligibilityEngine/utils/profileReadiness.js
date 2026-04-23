const { getQualificationRank } = require('./qualificationUtils');
const { QUALIFICATION_LEVELS } = require('../../constants/eligibilityConstants');

const PROFILE_INCOMPLETE_CODE = 'PROFILE_INCOMPLETE';

const FIELD_LABELS = {
  dob: 'Date of birth',
  gender: 'Gender',
  category: 'Category',
  domicile_state: 'Domicile state',
  highest_qualification: 'Highest qualification',
  tenth_board: '10th board',
  tenth_percentage: '10th percentage',
  twelfth_board: '12th board',
  twelfth_stream: '12th stream',
  twelfth_subjects: '12th subjects',
  twelfth_percentage: '12th percentage',
  diploma_percentage: 'Diploma percentage',
  programme: 'Programme',
  branch: 'Branch',
  graduation_status: 'Graduation status',
  gpa: 'Graduation score',
  ug_programme: 'UG programme',
  ug_branch: 'UG branch',
  ug_percentage: 'UG score',
};

const BASELINE_FIELDS = [
  'dob',
  'gender',
  'category',
  'domicile_state',
  'highest_qualification',
  'tenth_board',
  'tenth_percentage',
];

const QUALIFICATION_RULES = [
  {
    minQualification: QUALIFICATION_LEVELS[1],
    fields: ['twelfth_board', 'twelfth_stream', 'twelfth_subjects', 'twelfth_percentage'],
  },
  {
    minQualification: QUALIFICATION_LEVELS[2],
    exactQualification: QUALIFICATION_LEVELS[2],
    fields: ['diploma_percentage', 'programme', 'branch'],
  },
  {
    minQualification: QUALIFICATION_LEVELS[3],
    fields: ['programme', 'branch', 'graduation_status', 'gpa'],
  },
  {
    minQualification: QUALIFICATION_LEVELS[4],
    exactQualification: QUALIFICATION_LEVELS[4],
    fields: ['ug_programme', 'ug_branch', 'ug_percentage'],
  },
];

const OPTIONAL_RULES = [
  {
    when: (profile) => profile?.has_experience === true,
    fields: ['exp_years', 'exp_field'],
  },
];

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  return Boolean(value);
};

const toFieldDescriptor = (key) => ({
  key,
  label: FIELD_LABELS[key] || key,
});

const getRequiredFieldKeys = (profile = {}) => {
  const qualification = profile.highest_qualification;
  const qualificationRank = getQualificationRank(qualification);
  const required = new Set(BASELINE_FIELDS);

  QUALIFICATION_RULES.forEach((rule) => {
    const minRank = getQualificationRank(rule.minQualification);
    const meetsMinimum = qualificationRank >= 0 && qualificationRank >= minRank;
    const matchesExact = !rule.exactQualification || qualification === rule.exactQualification;

    if (meetsMinimum && matchesExact) {
      rule.fields.forEach((field) => required.add(field));
    }
  });

  return Array.from(required);
};

const profileReadiness = (profile = {}) => {
  const hardMissing = getRequiredFieldKeys(profile)
    .filter((field) => !isFilled(profile[field]))
    .map(toFieldDescriptor);

  const optionalMissing = OPTIONAL_RULES.flatMap((rule) => {
    if (!rule.when(profile)) return [];
    return rule.fields
      .filter((field) => !isFilled(profile[field]))
      .map(toFieldDescriptor);
  });

  return {
    isReady: hardMissing.length === 0,
    missingFields: hardMissing,
    hardMissing,
    optionalMissing,
  };
};

const createProfileIncompleteError = (readiness) => {
  const error = new Error('Complete your profile to get accurate eligibility results.');
  error.code = PROFILE_INCOMPLETE_CODE;
  error.statusCode = 400;
  error.missingFields = readiness.hardMissing;
  error.optionalMissing = readiness.optionalMissing;
  return error;
};

module.exports = {
  PROFILE_INCOMPLETE_CODE,
  FIELD_LABELS,
  profileReadiness,
  createProfileIncompleteError,
};
