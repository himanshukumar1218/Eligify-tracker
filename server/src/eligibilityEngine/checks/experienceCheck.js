const { createReason } = require('../utils/reasonUtils');

/**
 * Checks whether the user's work experience meets the post's requirements.
 * Experience criteria are sourced from `post_special_requirements.experience_criteria` (JSONB).
 *
 * Supported JSONB keys (all optional):
 *  - min_years  {number}  Minimum years of experience required
 *  - field      {string}  Required field/domain (e.g., "Accounts", "Teaching")
 *
 * @param {Object} user - Combined user profile row
 * @param {Object} post - Combined post config row
 * @returns {string|null} - Failure reason, or null if the check passes
 */
const checkExperience = (user, post) => {
  const criteria = post.experience_criteria;

  if (!criteria) return null;

  const failures = [];

  // Check minimum years
  if (criteria.min_years != null) {
    const userYears = user.has_experience ? (user.exp_years || 0) : 0;

    if (userYears < criteria.min_years) {
      failures.push(
        `minimum ${criteria.min_years} year(s) of experience required ` +
        `(yours: ${userYears} year(s))`
      );
    }
  }

  // Check field / domain match
  if (criteria.field) {
    const userField = user.normalized?.exp_field || '';
    const requiredField = post.normalized?.experience_field || '';

    if (!userField.includes(requiredField)) {
      failures.push(`experience must be in the field of "${criteria.field}" (yours: "${user.exp_field || 'none'}")`);
    }
  }

  if (failures.length > 0) {
    return createReason({
      code: 'EXPERIENCE_CRITERIA_NOT_MET',
      category: 'experience',
      field: 'experience',
      severity: 'soft',
      message: `Experience criteria not met: ${failures.join('; ')}`,
      actionText: 'Review the experience requirement for this post',
      details: { failures },
    });
  }

  return null;
};

module.exports = { checkExperience };
