const pool = require('../db.js');

exports.bulkInsertNotifications = async (notifications) => {
    if (!notifications || notifications.length === 0) return;

    const values = [];
    let queryArgs = [];
    let argIndex = 1;

    notifications.forEach(n => {
        values.push(`($${argIndex++}, $${argIndex++}, $${argIndex++}, $${argIndex++}, $${argIndex++})`);
        queryArgs.push(n.userId, n.title, n.message, n.postId || null, n.category || 'system');
    });

    const query = `
        INSERT INTO student_notifications (user_id, title, message, post_id, category)
        VALUES ${values.join(', ')}
    `;

    return pool.query(query, queryArgs);
};

exports.getNotificationsByUserId = async (userId) => {
    const query = `
        SELECT * FROM student_notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 50
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

exports.markAsRead = async (notificationId, userId) => {
    const query = `
        UPDATE student_notifications 
        SET is_read = true 
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
};
