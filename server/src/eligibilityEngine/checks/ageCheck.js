const { calculateAge, formatDate } = require('../utils/dateUtils');
const { createReason } = require('../utils/reasonUtils');

/**
 * Checks whether the user's age falls within the post's allowed range,
 * accounting for any category-based relaxation years.
 *
 * @param {Object} user - Combined user profile row
 * @param {Object} post - Combined post config row
 * @returns {string|null} - Failure reason, or null if the check passes
 */
const checkAge = (user, post) => {
  const age = calculateAge(user.dob, post.age_criteria_date);
  const relaxation = post.relaxation_years || 0;
  const effectiveMaxAge = post.max_age + relaxation;

  if (age < post.min_age || age > effectiveMaxAge) {
    const refDateStr = formatDate(post.age_criteria_date);
    return createReason({
      code: 'AGE_OUT_OF_RANGE',
      category: 'age',
      field: 'dob',
      message:
        `Your age as on ${refDateStr} is ${age} years. Required range: ${post.min_age}-${effectiveMaxAge} years` +
        (relaxation > 0 ? `, including ${relaxation} year(s) of ${user.category} relaxation.` : '.'),
      actionText: 'Check the age rule for this post',
      details: { age, minAge: post.min_age, maxAge: effectiveMaxAge },
    });
  }

  return null;
};

module.exports = { checkAge };
