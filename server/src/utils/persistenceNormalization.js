const {
  ALL_SENTINEL,
  GENDER_LOOKUP,
  CATEGORY_LOOKUP,
  QUALIFICATION_LOOKUP,
  GRADUATION_STATUS_LOOKUP,
  EXAM_STATUS_LOOKUP,
  collapseWhitespace,
  normalizeCanonicalValue,
} = require('../constants/eligibilityConstants');

const normalizeText = (value) => {
  const normalized = collapseWhitespace(value);
  return normalized || null;
};

const normalizeBoolean = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
};

const normalizeStringArray = (values, { allSentinel = false } = {}) => {
  if (!Array.isArray(values)) return [];

  const seen = new Set();
  const normalized = [];

  values.forEach((value) => {
    const item = collapseWhitespace(value);
    if (!item) return;

    if (allSentinel && item.toLowerCase() === ALL_SENTINEL.toLowerCase()) {
      normalized.length = 0;
      normalized.push(ALL_SENTINEL);
      seen.clear();
      seen.add(ALL_SENTINEL.toLowerCase());
      return;
    }

    if (seen.has(item.toLowerCase()) || normalized[0] === ALL_SENTINEL) return;
    seen.add(item.toLowerCase());
    normalized.push(item);
  });

  return normalized;
};

const normalizeStudentPayload = (data = {}) => ({
  ...data,
  basic: {
    ...data.basic,
    fullName: normalizeText(data.basic?.fullName),
    phone: normalizeText(data.basic?.phone),
    gender: normalizeCanonicalValue(data.basic?.gender, GENDER_LOOKUP),
    category: normalizeCanonicalValue(data.basic?.category, CATEGORY_LOOKUP),
    isPwD: normalizeBoolean(data.basic?.isPwD),
    pinCode: normalizeText(data.basic?.pinCode),
    district: normalizeText(data.basic?.district),
    domicile: normalizeText(data.basic?.domicile),
    nationality: normalizeText(data.basic?.nationality),
  },
  academic: {
    ...data.academic,
    highestQualification: normalizeCanonicalValue(data.academic?.highestQualification, QUALIFICATION_LOOKUP),
    tenthBoard: normalizeText(data.academic?.tenthBoard),
    twelfthBoard: normalizeText(data.academic?.twelfthBoard),
    twelfthStream: normalizeText(data.academic?.twelfthStream),
    twelfthSubjects: normalizeStringArray(data.academic?.twelfthSubjects),
    programme: normalizeText(data.academic?.programme),
    branch: normalizeText(data.academic?.branch),
    graduationStatus: normalizeCanonicalValue(data.academic?.graduationStatus, GRADUATION_STATUS_LOOKUP),
    college: normalizeText(data.academic?.college),
    ugProgramme: normalizeText(data.academic?.ugProgramme),
    ugBranch: normalizeText(data.academic?.ugBranch),
    ugCollege: normalizeText(data.academic?.ugCollege),
  },
  certifications: normalizeStringArray(data.certifications),
  experience: {
    ...data.experience,
    hasExperience: normalizeBoolean(data.experience?.hasExperience),
    field: normalizeText(data.experience?.field),
  },
  physical: {
    ...data.physical,
    isPhysicalFit: normalizeBoolean(data.physical?.isPhysicalFit),
  },
  other: {
    ...data.other,
    isExServiceman: normalizeBoolean(data.other?.isExServiceman),
  },
});

const normalizeAdminPayload = (examData = {}, postsData = []) => ({
  exam: {
    ...examData,
    exam_name: normalizeText(examData.exam_name),
    organisation: normalizeText(examData.organisation),
    sector: normalizeText(examData.sector),
    status: normalizeCanonicalValue(examData.status, EXAM_STATUS_LOOKUP),
    official_link: normalizeText(examData.official_link),
    allowed_states: normalizeStringArray(examData.allowed_states, { allSentinel: true }),
  },
  posts: Array.isArray(postsData)
    ? postsData.map((post) => ({
        ...post,
        post_name: normalizeText(post.post_name),
        department: normalizeText(post.department),
        allowed_genders: normalizeStringArray(
          (post.allowed_genders || []).map((gender) => normalizeCanonicalValue(gender, GENDER_LOOKUP) || gender),
          { allSentinel: true }
        ),
        relaxations: Array.isArray(post.relaxations)
          ? post.relaxations.map((relaxation) => ({
              ...relaxation,
              category: normalizeCanonicalValue(relaxation.category, CATEGORY_LOOKUP),
            }))
          : [],
        education_criteria: Array.isArray(post.education_criteria)
          ? post.education_criteria.map((criterion) => ({
              ...criterion,
              required_qualification: normalizeCanonicalValue(criterion.required_qualification, QUALIFICATION_LOOKUP),
              allowed_programmes: normalizeStringArray(criterion.allowed_programmes, { allSentinel: true }),
              allowed_branches: normalizeStringArray(criterion.allowed_branches, { allSentinel: true }),
              allowed_10th_boards: normalizeStringArray(criterion.allowed_10th_boards, { allSentinel: true }),
              allowed_12th_boards: normalizeStringArray(criterion.allowed_12th_boards, { allSentinel: true }),
              allowed_12th_streams: normalizeStringArray(criterion.allowed_12th_streams, { allSentinel: true }),
              required_subjects: normalizeStringArray(criterion.required_subjects, { allSentinel: true }),
            }))
          : [],
        special_requirements: {
          ...post.special_requirements,
          experience_criteria: post.special_requirements?.experience_criteria
            ? {
                ...post.special_requirements.experience_criteria,
                field: normalizeText(post.special_requirements.experience_criteria.field),
              }
            : post.special_requirements?.experience_criteria,
          required_certifications: normalizeStringArray(post.special_requirements?.required_certifications),
          domicile_states: normalizeStringArray(post.special_requirements?.domicile_states, { allSentinel: true }),
        },
      }))
    : [],
});

module.exports = {
  collapseWhitespace,
  normalizeText,
  normalizeStringArray,
  normalizeStudentPayload,
  normalizeAdminPayload,
};
