// userDetailsController.js
const userQueries = require('../queries/getProfileQueries');
const { toFrontendProfile } = require('../utils/userMapper');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const rawData = await userQueries.getUserFullProfile(userId);

    if (!rawData) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "No profile found."
      });
    }

    // Map the database data to frontend-friendly camelCase
    const formattedProfile = toFrontendProfile(rawData);

    return res.status(200).json({
      success: true,
      exists: true,
      data: formattedProfile
    });

  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};