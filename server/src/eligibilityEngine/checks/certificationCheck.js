const { createReason } = require('../utils/reasonUtils');

/**
 * Checks whether the user holds all certifications required by the post.
 * ALL required certifications must be present (AND logic).
 *
 * @param {Object} user - Combined user profile row
 * @param {Object} post - Combined post config row
 * @returns {string|null} - Failure reason, or null if the check passes
 */
const checkCertification = (user, post) => {
  const required = post.required_certifications;

  if (!required || required.length === 0) return null;

  const userCerts = user.normalized?.certifications || [];
  const missing = required.filter((cert) => !userCerts.includes(String(cert).trim().toLowerCase()));

  if (missing.length > 0) {
    return createReason({
      code: 'CERTIFICATION_MISSING',
      category: 'certification',
      field: 'certifications',
      severity: 'soft',
      message: `Missing required certification(s): ${missing.join(', ')}`,
      actionText: 'Add the certification if you already have it, or skip this post',
      details: { missing },
    });
  }

  return null;
};

module.exports = { checkCertification };
