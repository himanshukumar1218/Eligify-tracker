const { meetsQualificationLevel, isAll } = require('../utils/qualificationUtils');
const { createReason } = require('../utils/reasonUtils');
const {
  GRADUATION_STATUSES,
  QUALIFICATION_LEVELS,
} = require('../../constants/eligibilityConstants');

const SECONDARY = QUALIFICATION_LEVELS[0];
const INTERMEDIATE = QUALIFICATION_LEVELS[1];
const UNDERGRADUATE = QUALIFICATION_LEVELS[3];
const POSTGRADUATE = QUALIFICATION_LEVELS[4];
const CURRENTLY_PURSUING = GRADUATION_STATUSES[0].toLowerCase();

const checkEducation = (user, post) => {
  const criteria = post.education_criteria;

  // If it comes without education criteria -- Anpadh Gawar
  if (!criteria || criteria.length === 0) return null;

  const failureDetails = [];

  for (const criterion of criteria) {
    const pathFailures = [];
    const normalizedCriterion = criterion.normalized || {};

    // 1. Qualification level
    if (criterion.required_qualification) {
      const isPursuing = user.normalized?.graduation_status === CURRENTLY_PURSUING;
      const finalYearOk = criterion.final_year_allowed && isPursuing;

      if (!meetsQualificationLevel(user.highest_qualification, criterion.required_qualification) && !finalYearOk) {
        pathFailures.push(`qualification must be ${criterion.required_qualification} or higher`);
      }
    }
    // 2. 10th & 12th Board Check
    if (criterion.allowed_10th_boards?.length > 0 && !isAll(criterion.allowed_10th_boards)) {
      if (!user.normalized?.tenth_board || !normalizedCriterion.allowed_10th_boards.includes(user.normalized.tenth_board)) {
        pathFailures.push(`10th Board must be ${criterion.allowed_10th_boards.join('/')}`);
      }
    }

    if (criterion.allowed_12th_boards?.length > 0 && !isAll(criterion.allowed_12th_boards)) {
      if (!user.normalized?.twelfth_board || !normalizedCriterion.allowed_12th_boards.includes(user.normalized.twelfth_board)) {
        pathFailures.push(`12th Board must be ${criterion.allowed_12th_boards.join('/')}`);
      }
    }

    // 3. 12th Stream Check (Science, Commerce, Arts)
    if (criterion.allowed_12th_streams?.length > 0 && !isAll(criterion.allowed_12th_streams)) {
      if (!user.normalized?.twelfth_stream || !normalizedCriterion.allowed_12th_streams.includes(user.normalized.twelfth_stream)) {
        pathFailures.push(`12th Stream must be ${criterion.allowed_12th_streams.join('/')}`);
      }
    }

    // 4. Specific 12th Subjects Check
    // Expected: criterion.required_subjects = ['Physics', 'Mathematics']
    if (criterion.required_subjects?.length > 0 && !isAll(criterion.required_subjects)) {
      const userSubs = user.normalized?.twelfth_subjects || [];
      const missing = criterion.required_subjects.filter(
        sub => !userSubs.includes(String(sub).trim().toLowerCase())
      );

      if (missing.length > 0) {
        pathFailures.push(`Missing required 12th subjects: ${missing.join(', ')}`);
      }
    }

    // 5. Percentage/GPA Check with Normalization
    // ... inside the loop for each criterion
    if (criterion.min_percentage != null) {
      let userScore = 0;

      // Logic: Pick the score relevant to the qualification level
      if (criterion.required_qualification === UNDERGRADUATE || criterion.required_qualification === POSTGRADUATE) {
        userScore = parseFloat(user.gpa || 0);
      } else if (criterion.required_qualification === INTERMEDIATE) {
        userScore = parseFloat(user.twelfth_percentage || 0);
      } else if (criterion.required_qualification === SECONDARY) {
        userScore = parseFloat(user.tenth_percentage || 0);
      }

      // Normalization: If GPA (0-10) is used, convert to percentage (0-100)
      if (userScore <= 10 && userScore > 0) {
        userScore = userScore * 10;
      }

      if (userScore < criterion.min_percentage) {
        pathFailures.push(`minimum score of ${criterion.min_percentage}% required (Your calculated score: ${userScore}%)`);
      }
    }

    // 2. Programme (e.g. B.Tech, B.E)
    if (criterion.allowed_programmes && !isAll(criterion.allowed_programmes)) {
      if (!normalizedCriterion.allowed_programmes.includes(user.normalized?.programme)) {
        pathFailures.push(`programme must be one of: ${criterion.allowed_programmes.join(', ')}`);
      }
    }

    // 3. Branch / specialisation (e.g. CS, IT)


    if (!isAll(criterion.allowed_branches)) {
      if (!normalizedCriterion.allowed_branches.includes(user.normalized?.branch)) {
        pathFailures.push(`branch must be one of: ${criterion.allowed_branches.join(', ')}`)
      }
    }




    // This path is fully satisfied — overall check passes
    if (pathFailures.length === 0) return null;

    failureDetails.push(pathFailures.join(' AND '));
  }

  // None of the OR-paths were satisfied
  return createReason({
    code: 'EDUCATION_CRITERIA_NOT_MET',
    category: 'education',
    field: 'education',
    message: `Education criteria not met. ${failureDetails.map((d, i) => `Path ${i + 1}: ${d}`).join(' | ')}`,
    actionText: 'Review your education details and the qualifying path for this post',
    details: { paths: failureDetails },
  });
};

module.exports = { checkEducation };
