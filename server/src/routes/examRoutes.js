// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect } = require('../middlewares/authMiddleware'); // Your existing JWT protector

/**
 * @route   GET /api/exams/eligible
 * @desc    Get categorized eligible and near-match exams for the user
 * @access  Private
 */
router.get('/eligible', protect, examController.getEligibleExams);

module.exports = router;