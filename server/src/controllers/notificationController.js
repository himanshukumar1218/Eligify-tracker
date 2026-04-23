const { getNotificationsByUserId, markAsRead } = require('../queries/notificationQueries');

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await getNotificationsByUserId(userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ success: false, message: "Could not fetch notifications" });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifId = req.params.id;
        const result = await markAsRead(notifId, userId);
        
        if (!result) {
            return res.status(404).json({ success: false, message: "Notification not found or unauthorized" });
        }

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ success: false, message: "Could not update notification" });
    }
};

module.exports = { getUserNotifications, markNotificationAsRead };
