const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Sends an email notification to a user when they match a new exam
 * @param {string} userEmail - The email address of the student
 * @param {string} userName - The username or name of the student
 * @param {string} examName - The name of the exam
 * @param {string} postName - The name of the specific post
 */
const sendMatchEmail = async (userEmail, userName, examName, postName) => {
    // Only attempt to send if SMTP is configured
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log(`[EmailService] Skipping email to ${userEmail} (SMTP not configured)`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"Eligibility Engine" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `🎉 New Exam Match: ${examName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a;">Hello ${userName},</h2>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                        Great news! Based on your academic profile, you are eligible to apply for a new exam post.
                    </p>
                    <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">${examName}</h3>
                        <p style="margin-bottom: 0; color: #475569;"><strong>Post:</strong> ${postName}</p>
                    </div>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                        Log in to your dashboard to view the full details and start your application process before the deadline.
                    </p>
                    <a href="http://localhost:5173/eligible-exams" style="display: inline-block; background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                        View Exam Details
                    </a>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        You received this email because you are opted into eligibility alerts.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Match email sent successfully to ${userEmail} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Failed to send email to ${userEmail}:`, error);
        return false;
    }
};

module.exports = { sendMatchEmail };
