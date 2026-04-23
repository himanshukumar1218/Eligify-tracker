// controllers/examController.js
const { checkAllExams } = require('../eligibilityEngine/checkEligibility');
const { PROFILE_INCOMPLETE_CODE } = require('../eligibilityEngine/utils/profileReadiness');

/**
 * Fetches all matched and near-matched exams for the authenticated user.
 */
exports.getEligibleExams = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted via authMiddleware

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required." 
      });
    }

    // 1. Run the Categorized Bulk Scan
    // Returns { eligible: [...], nearMatches: [...] }
    const { eligible, nearMatches } = await checkAllExams(userId);

    // 2. Return both categories to the frontend
    return res.status(200).json({
      success: true,
      data: {
        eligibleCount: eligible.length,
        nearMatchCount: nearMatches.length,
        eligible,      // Exams with 0 failures
        nearMatches    // Exams with 1-2 failures for user review
      }
    });

  } catch (err) {
    console.error(`[ExamController] Bulk scan error:`, err);

    if (err.code === PROFILE_INCOMPLETE_CODE) {
      return res.status(err.statusCode || 400).json({
        success: false,
        code: PROFILE_INCOMPLETE_CODE,
        missingFields: err.missingFields || [],
        optionalMissing: err.optionalMissing || [],
        message: err.message,
      });
    }

    // Provide a specific message if the profile is missing
    if (err.message.includes('Onboarding incomplete')) {
      return res.status(400).json({ 
        success: false, 
        message: "Please complete your profile to see matched exams." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "An error occurred while matching exams with your profile." 
    });
  }
};
