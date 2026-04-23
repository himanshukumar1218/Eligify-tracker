const { checkEligibility } = require('../eligibilityEngine/checkEligibility');
const { PROFILE_INCOMPLETE_CODE } = require('../eligibilityEngine/utils/profileReadiness');

const checkPostEligibility = async (req, res) => {
  try {
    // 1. Get userId from Auth Middleware (e.g., req.user.id)
    // 2. Get postId from URL parameters
    const userId = req.user.id; 
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    // 3. Trigger the Engine
    const result = await checkEligibility(userId, parseInt(postId));

    // 4. Send Response back to Frontend
    return res.status(200).json({
      success: true,
      eligible: result.eligible,
      reasons: result.reasons // Array of strings explaining why if ineligible
    });

  } catch (error) {
    console.error("User Eligibility Route Error:", error);

    if (error.code === PROFILE_INCOMPLETE_CODE) {
      return res.status(error.statusCode || 400).json({
        success: false,
        code: PROFILE_INCOMPLETE_CODE,
        missingFields: error.missingFields || [],
        optionalMissing: error.optionalMissing || [],
        message: error.message,
      });
    }

    res.status(500).json({ message: "Internal server error checking eligibility" });
  }
};

module.exports = { checkPostEligibility };
