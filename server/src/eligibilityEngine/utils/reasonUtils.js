const createReason = ({
  code,
  category,
  field,
  message,
  severity = 'hard',
  actionText = 'Update your profile',
  details = null,
}) => ({
  code,
  category,
  field,
  severity,
  message,
  actionText,
  details,
});

const ensureReason = (reason, fallback = {}) => {
  if (!reason) return null;

  if (typeof reason === 'string') {
    return createReason({
      code: fallback.code || 'CHECK_FAILED',
      category: fallback.category || 'general',
      field: fallback.field || 'general',
      severity: fallback.severity || 'hard',
      actionText: fallback.actionText || 'Update your profile',
      message: reason,
      details: fallback.details || null,
    });
  }

  return createReason({
    ...fallback,
    ...reason,
    message: reason.message || fallback.message || 'Criteria not satisfied.',
  });
};

module.exports = {
  createReason,
  ensureReason,
};
