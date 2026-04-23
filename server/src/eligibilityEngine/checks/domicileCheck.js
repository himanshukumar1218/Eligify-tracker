/**
 * Checks whether the user's domicile state satisfies the post's domicile requirement.
 * Only runs when `post.domicile_required` is true.
 *
 * @param {Object} user - Combined user profile row
 * @param {Object} post - Combined post config row
 * @returns {string|null} - Failure reason, or null if the check passes
 */

const { isAll } = require('../utils/qualificationUtils');
const { createReason } = require('../utils/reasonUtils');
const checkDomicile = (user, post) => {
  if (!post.domicile_required) return null;

  const allowedStates = post.domicile_states || [];
  if (isAll(allowedStates)) return null;
  if (!(post.normalized?.domicile_states || []).includes(user.normalized?.domicile_state)) {
    return createReason({
      code: 'DOMICILE_MISMATCH',
      category: 'domicile',
      field: 'domicile_state',
      message: `This post is open only to residents of ${allowedStates.join(', ')}. Your registered domicile is ${user.domicile_state || 'not set'}.`,
      actionText: 'Review domicile-specific posts or correct your domicile state',
    });
  }

  return null;
};

module.exports = { checkDomicile };
