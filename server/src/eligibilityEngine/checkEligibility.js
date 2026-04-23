// eligibilityEngine/checkEligibility.js

const { getUserData, getPostData, getAllPostsData } = require('./queries/eligibilityQueries');
const {
  profileReadiness,
  createProfileIncompleteError,
} = require('./utils/profileReadiness');
const { normalizeEligibilityContext } = require('./utils/normalization');
const { EXAM_STATUSES } = require('../constants/eligibilityConstants');
const { ensureReason, createReason } = require('./utils/reasonUtils');

const { checkGender }        = require('./checks/genderCheck');
const { checkAge }           = require('./checks/ageCheck');
const { checkEducation }     = require('./checks/educationCheck');
const { checkCertification } = require('./checks/certificationCheck');
const { checkPhysical }      = require('./checks/physicalCheck');
const { checkDomicile }      = require('./checks/domicileCheck');
const { checkExperience }    = require('./checks/experienceCheck');

/**
 * Registry of all eligibility checks.
 * Reused by both single and bulk processing logic.
 *
 * Eligibility output is only trustworthy after the candidate profile includes
 * the baseline demographics and qualification-aware education fields required
 * by `profileReadiness()`:
 * - Always: dob, gender, category, domicile_state, highest_qualification,
 *   tenth_board, tenth_percentage
 * - Intermediate and above: twelfth_board, twelfth_stream,
 *   twelfth_subjects, twelfth_percentage
 * - Diploma: diploma_percentage, programme, branch
 * - Undergraduate and above: programme, branch, graduation_status, gpa
 * - Postgraduate: ug_programme, ug_branch, ug_percentage
 */
const CHECKS = [
  { name: 'Gender', fn: checkGender, severity: 'hard', category: 'gender' },
  { name: 'Domicile', fn: checkDomicile, severity: 'hard', category: 'domicile' },
  { name: 'Education', fn: checkEducation, severity: 'hard', category: 'education' },
  { name: 'Age', fn: checkAge, severity: 'hard', category: 'age' },
  { name: 'Certification', fn: checkCertification, severity: 'soft', category: 'certification' },
  { name: 'Physical', fn: checkPhysical, severity: 'soft', category: 'physical' },
  { name: 'Experience', fn: checkExperience, severity: 'soft', category: 'experience' },
];

const ensureProfileReady = (user) => {
  const readiness = profileReadiness(user);
  if (!readiness.isReady) {
    throw createProfileIncompleteError(readiness);
  }
};

const checkAllExams = async (userId) => {
  const [user, posts] = await Promise.all([
    getUserData(userId),
    getAllPostsData(userId),
  ]);
  if (!user) throw new Error('Onboarding incomplete');
  ensureProfileReady(user);

  const now = new Date();
  const eligible = [];
  const nearMatches = [];

  posts.forEach((post) => {
    const { user: normalizedUser, post: normalizedPost } = normalizeEligibilityContext(user, post);
    // 1. Calculate Timing Status
    const startDate = normalizedPost.application_start ? new Date(normalizedPost.application_start) : null;
    const endDate = normalizedPost.application_end ? new Date(normalizedPost.application_end) : null;
    
    let timingStatus = EXAM_STATUSES[1];
    if (startDate && now < startDate) timingStatus = EXAM_STATUSES[0];
    else if (endDate && now > endDate) timingStatus = EXAM_STATUSES[2];

    // 2. Run Individual Checks
    const reasons = [];
    let hasHardFailure = false;

    for (const check of CHECKS) {
      try {
        const reason = ensureReason(check.fn(normalizedUser, normalizedPost), {
          code: `${check.name.toUpperCase()}_CHECK_FAILED`,
          category: check.category,
          severity: check.severity,
        });
        if (reason) {
          reasons.push(reason);
          if (reason.severity === 'hard') hasHardFailure = true;
        }
      } catch (err) {
        console.error(`[Engine] ${check.name} failed:`, err);
        reasons.push(
          createReason({
            code: `${check.name.toUpperCase()}_SYSTEM_ERROR`,
            category: check.category,
            field: 'system',
            severity: 'hard',
            message: `System error verifying ${check.name}.`,
            actionText: 'Try again later',
          })
        );
        hasHardFailure = true; // Safety default
      }
    }

    const result = {
      postId: post.post_id,
      postName: post.post_name,
      examName: post.exam_name,
      organisation: post.organisation || 'N/A',
      deadline: post.application_end,
      url : post.official_link || 'Link Not Available' ,
      timingStatus: timingStatus,
      reasons: reasons,
    };

    // 3. Categorization Logic
    if (reasons.length === 0 && timingStatus !== EXAM_STATUSES[2]) {
      // Perfect match and currently open
      eligible.push(result);
    } 
    else if (!hasHardFailure) {
      // It's a 'Near Match' if:
      // a) It's a perfect match but the deadline passed (for review)
      // b) It has only 1-2 'soft' failures
      if (reasons.length === 0 || (reasons.length >= 1 && reasons.length <= 2)) {
        nearMatches.push(result);
      }
    }
  });

  return { eligible, nearMatches };
};
/**
 * DETERMINES ELIGIBILITY FOR A SINGLE POST
 * Use this for detailed "Why am I ineligible?" modal views.
 */
const checkEligibility = async (userId, postId) => {
  const [user, post] = await Promise.all([
    getUserData(userId),
    getPostData(userId, postId),
  ]);
  if (!user) {
    return {
      eligible: false,
      reasons: [
        createReason({
          code: 'USER_PROFILE_NOT_FOUND',
          category: 'profile',
          field: 'profile',
          severity: 'hard',
          message: 'User profile not found.',
          actionText: 'Complete your profile',
        }),
      ],
    };
  }
  if (!post) {
    return {
      eligible: false,
      reasons: [
        createReason({
          code: 'POST_NOT_FOUND',
          category: 'post',
          field: 'post',
          severity: 'hard',
          message: 'Exam post not found.',
          actionText: 'Choose another post',
        }),
      ],
    };
  }
  ensureProfileReady(user);
  const { user: normalizedUser, post: normalizedPost } = normalizeEligibilityContext(user, post);

  const reasons = [];
  for (const { name, fn, severity, category } of CHECKS) {
    try {
      const reason = ensureReason(fn(normalizedUser, normalizedPost), {
        code: `${name.toUpperCase()}_CHECK_FAILED`,
        category,
        severity,
      });
      if (reason) reasons.push(reason);
    } catch (err) {
      reasons.push(
        createReason({
          code: `${name.toUpperCase()}_SYSTEM_ERROR`,
          category,
          field: 'system',
          severity: 'hard',
          message: `Internal error during ${name} check.`,
          actionText: 'Try again later',
        })
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    metadata: {
      postName: post.post_name,
      organisation: post.organisation,
      officialLink: post.official_link,
      deadline: post.application_end
    }
  };
};

module.exports = { checkEligibility, checkAllExams };
