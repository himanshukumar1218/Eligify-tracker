const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserNotifications, markNotificationAsRead, clearNotifications } = require('../controllers/notificationController');

router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/clear', protect, clearNotifications);

module.exports = router;
