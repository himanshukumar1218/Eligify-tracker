const express = require('express')
const router = express.Router() ;
const adminController = require('../controllers/adminController.js')
const {validate} = require('../middlewares/validate.js')
const {protect} = require('../middlewares/authMiddleware.js')

const { examSchema } = require('../utils/validationExamSchema');

router.post('/exams',validate(examSchema),adminController.createExamNotification)

module.exports = router;
