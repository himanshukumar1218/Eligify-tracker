// eligibilityEngine/checks/genderCheck.js
const { createReason } = require('../utils/reasonUtils');

const checkGender = (user, post) => {
  const allowed = post.normalized?.allowed_genders || [];

  if (allowed.length === 0 || allowed.includes('all')) {
    return null;
  }

  if (!allowed.includes(user.normalized?.gender)) {
    return createReason({
      code: 'GENDER_MISMATCH',
      category: 'gender',
      field: 'gender',
      message: `This post is restricted to ${post.allowed_genders.join('/')} candidates only. Your profile gender is ${user.gender || 'not set'}.`,
      actionText: 'Update your gender only if your saved value is incorrect',
    });
  }

  return null;
};

module.exports = { checkGender };
