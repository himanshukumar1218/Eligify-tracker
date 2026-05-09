const express = require('express');
const router = express.Router();
const { handleContactForm } = require('../controllers/supportController');

// POST /api/support/contact
router.post('/contact', handleContactForm);

module.exports = router;
