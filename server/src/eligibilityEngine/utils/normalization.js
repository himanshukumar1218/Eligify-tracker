const normalizeText = (value) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';

const normalizeArray = (values) =>
  Array.isArray(values) ? values.map(normalizeText).filter(Boolean) : [];

const normalizeUser = (user = {}) => ({
  ...user,
  normalized: {
    gender: normalizeText(user.gender),
    domicile_state: normalizeText(user.domicile_state),
    tenth_board: normalizeText(user.tenth_board),
    twelfth_board: normalizeText(user.twelfth_board),
    twelfth_stream: normalizeText(user.twelfth_stream),
    twelfth_subjects: normalizeArray(user.twelfth_subjects),
    programme: normalizeText(user.programme),
    branch: normalizeText(user.branch),
    graduation_status: normalizeText(user.graduation_status),
    certifications: normalizeArray(user.certifications),
    exp_field: normalizeText(user.exp_field),
  },
});

const normalizeEducationCriterion = (criterion = {}) => ({
  ...criterion,
  normalized: {
    allowed_10th_boards: normalizeArray(criterion.allowed_10th_boards),
    allowed_12th_boards: normalizeArray(criterion.allowed_12th_boards),
    allowed_12th_streams: normalizeArray(criterion.allowed_12th_streams),
    required_subjects: normalizeArray(criterion.required_subjects),
    allowed_programmes: normalizeArray(criterion.allowed_programmes),
    allowed_branches: normalizeArray(criterion.allowed_branches),
  },
});

const normalizePost = (post = {}) => ({
  ...post,
  education_criteria: Array.isArray(post.education_criteria)
    ? post.education_criteria.map(normalizeEducationCriterion)
    : post.education_criteria,
  normalized: {
    allowed_genders: normalizeArray(post.allowed_genders),
    domicile_states: normalizeArray(post.domicile_states),
    experience_field: normalizeText(post.experience_criteria?.field),
  },
});

const normalizeEligibilityContext = (user, post) => ({
  user: normalizeUser(user),
  post: normalizePost(post),
});

module.exports = {
  normalizeText,
  normalizeArray,
  normalizeEligibilityContext,
};
