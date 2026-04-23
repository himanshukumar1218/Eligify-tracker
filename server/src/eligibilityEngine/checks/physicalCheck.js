const { createReason } = require('../utils/reasonUtils');

/**
 * Checks whether the user meets the physical criteria for the post.
 * Criteria are sourced from `post_special_requirements.physical_criteria` (JSONB).
 *
 * Supported JSONB keys (all optional):
 *  - min_height_male    {number}  cm
 *  - min_height_female  {number}  cm
 *  - min_weight_male    {number}  kg
 *  - min_weight_female  {number}  kg
 *  - min_chest_cm       {number}  cm  (typically male-only)
 *  - must_be_fit        {boolean} requires is_physically_fit = true
 *
 * @param {Object} user - Combined user profile row
 * @param {Object} post - Combined post config row
 * @returns {string|null} - Failure reason, or null if the check passes
 */
const checkPhysical = (user, post) => {
  const criteria = post.physical_criteria;

  if (!criteria) return null;

  const failures = [];
  const gender = user.gender;

  // Height check
  const minHeight =
    gender === 'male' ? criteria.min_height_male :
    gender === 'female' ? criteria.min_height_female :
    null;

  if (minHeight != null && parseInt(user.height_cm) < minHeight) {
    failures.push(`height must be at least ${minHeight} cm (yours: ${user.height_cm} cm)`);
  }

  // Weight check
  const minWeight =
    gender === 'male' ? criteria.min_weight_male :
    gender === 'female' ? criteria.min_weight_female :
    null;

  if (minWeight != null && parseInt(user.weight_kg) < minWeight) {
    failures.push(`weight must be at least ${minWeight} kg (yours: ${user.weight_kg} kg)`);
  }

  // Chest check (typically male-only posts like police/army)
  if (criteria.min_chest_cm != null && parseInt(user.chest_cm) < criteria.min_chest_cm) {
    failures.push(`chest must be at least ${criteria.min_chest_cm} cm (yours: ${user.chest_cm} cm)`);
  }

  // General fitness
  if (criteria.must_be_fit && !user.is_physically_fit) {
    failures.push('must be declared physically fit');
  }

  if (failures.length > 0) {
    return createReason({
      code: 'PHYSICAL_CRITERIA_NOT_MET',
      category: 'physical',
      field: 'physical',
      severity: 'soft',
      message: `Physical criteria not met: ${failures.join('; ')}`,
      actionText: 'Review the physical standards for this post',
      details: { failures },
    });
  }

  return null;
};

module.exports = { checkPhysical };
