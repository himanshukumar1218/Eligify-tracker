const adminQueries = require('../queries/adminQueries');
const { notificationQueue } = require('../queue/notificationQueue');

const createExamNotification = async (req, res) => {
 
  const { exam, posts } = req.validatedBody;

  try {
    const newExamId = await adminQueries.insertExamNotification(exam, posts);
    
    // Background Queue - Fire & Forget
    await notificationQueue.add('ScanExamEvent', { 
        examId: newExamId,
        examName: exam.exam_name 
    });

    res.status(201).json({
      success: true,
      message: "Exam and all associated posts created successfully",
      examId: newExamId
    });
  } catch (error) {
    console.error("Admin Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create exam notification. Transaction rolled back.",
      error: error.message
    });
  }
};

module.exports = { createExamNotification };