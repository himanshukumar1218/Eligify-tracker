

const express = require('express')
const router = express.Router() ;
const userController = require('../controllers/userController.js')
const eligibilityController = require('../controllers/eligibilityController.js')
const userDetailsController = require('../controllers/userDetailsController.js')
const getProfileController = require('../controllers/getProfileController.js')
const prepTrackerController = require('../controllers/prepTrackerController.js')
const {validate} = require('../middlewares/validate.js')
const {protect} = require('../middlewares/authMiddleware.js')

const {signupSchema,loginSchema,userDetailsSchema,googleLoginSchema} = require('../utils/validationSchema.js')
const {addTaskSchema,upsertNoteSchema} = require('../utils/validationPrepTracker.js')

// --- Authentication & User Routes ---
router.post('/signup',validate(signupSchema),userController.signup)
router.post('/login',validate(loginSchema),userController.login)
router.post('/google-login', validate(googleLoginSchema), userController.googleLogin)
router.get('/profile',protect,getProfileController.getProfile)
router.post('/studentDetails' ,  protect ,validate(userDetailsSchema), userDetailsController.userDetails)
router.get('/check-eligibility/:postId',protect, eligibilityController.checkPostEligibility);

// --- PrepTracker Routes (Prefix: /preptracker) ---
// Exams
router.get('/preptracker/exams', protect, prepTrackerController.getExams);

// Tasks
router.post('/preptracker/tasks', protect, validate(addTaskSchema), prepTrackerController.addPrepTask);
router.get('/preptracker/tasks', protect, prepTrackerController.listPrepTasks);
router.patch('/preptracker/tasks/:taskId/toggle', protect, prepTrackerController.toggleTask);
router.delete('/preptracker/tasks/:taskId', protect, prepTrackerController.removeTask);

// Notes
router.put('/preptracker/notes', protect, validate(upsertNoteSchema), prepTrackerController.savePrepNote);
router.get('/preptracker/notes', protect, prepTrackerController.fetchPrepNote);

// Daily Notes & Stats
router.post('/preptracker/daily-notes', protect, prepTrackerController.savePrepDailyNote);
router.get('/preptracker/daily-notes', protect, prepTrackerController.fetchPrepDailyNotes);
router.get('/preptracker/stats', protect, prepTrackerController.fetchPrepStats);

module.exports = router;
