const userQueries = require('../queries/userDetailsQueries');

exports.userDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.validatedBody;

    const savedData = await userQueries.saveFullUserOnboarding(data, userId);

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: savedData
    });

  } catch (err) {
    console.error("Error Creating Records:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};