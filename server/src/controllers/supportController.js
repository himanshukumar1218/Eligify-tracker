const { sendSupportEmail } = require('../services/emailService');

/**
 * Handles contact form submissions
 */
const handleContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, message) are required.'
            });
        }

        // Send email to admin
        const emailSent = await sendSupportEmail({ name, email, message });

        if (!emailSent) {
            // We still return success to the user so they don't see a scary error, 
            // but we log it internally.
            console.error('[SupportController] Contact form submitted but email failed to send.');
        }

        return res.status(200).json({
            success: true,
            message: 'Your message has been received. We will contact you soon.'
        });
    } catch (error) {
        console.error('[SupportController] Error handling contact form:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing your request.'
        });
    }
};

module.exports = { handleContactForm };
