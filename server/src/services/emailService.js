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

/**
 * Sends a welcome email to a new user
 * @param {string} userEmail - The email address of the student
 * @param {string} userName - The name of the student
 */
const sendWelcomeEmail = async (userEmail, userName) => {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log(`[EmailService] Skipping welcome email to ${userEmail} (SMTP not configured)`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"Eligify Team" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `🚀 Welcome to Eligify, ${userName}!`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; color: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #22d3ee 0%, #2563eb 100%); border-radius: 12px; margin-bottom: 15px;">
                            <span style="font-size: 24px; color: white; font-weight: bold;">E</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">Welcome to Eligify</h1>
                    </div>
                    
                    <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h2 style="margin-top: 0; color: #22d3ee; font-size: 20px;">Hello ${userName},</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                            We're thrilled to have you on board! You've just taken a major step toward simplifying your exam preparation journey.
                        </p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #1e293b; border-radius: 8px;">
                            <h3 style="margin-top: 0; color: #ffffff; font-size: 16px;">What's next?</h3>
                            <ul style="color: #94a3b8; padding-left: 20px; margin-bottom: 0;">
                                <li style="margin-bottom: 10px;">Complete your <b>Academic Profile</b> to unlock matches.</li>
                                <li style="margin-bottom: 10px;">Check your <b>Personalized Eligibility</b> dashboard.</li>
                                <li>Start tracking your <b>Preparation Milestones</b>.</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://geteligify.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #22d3ee, #06b6d4); color: #020617; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                Launch Your Dashboard
                            </a>
                        </div>
                    </div>
                    
                    <p style="color: #475569; font-size: 13px; text-align: center; margin-top: 30px;">
                        Need help getting started? Just reply to this email! <br>
                        © 2024 Eligify Platform. All rights reserved.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Welcome email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Failed to send welcome email:`, error);
        return false;
    }
};

/**
 * Sends a notification to admin when a user submits a contact form
 * @param {Object} details - { name, email, message }
 */
const sendSupportEmail = async (details) => {
    const { name, email, message } = details;
    
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log(`[EmailService] Skipping support email (SMTP not configured)`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"Eligify Support" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to yourself/admin
            subject: `📬 New Support Inquiry from ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <h2 style="color: #0f172a; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">New Support Inquiry</h2>
                    <p style="margin-top: 20px;"><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 20px;">
                        <p style="margin-top: 0; font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase;">Message:</p>
                        <p style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="color: #94a3b8; font-size: 11px; margin-top: 30px; text-align: center;">
                        This inquiry was sent from the Eligify Contact Form.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Support email forwarded to admin`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Failed to send support email:`, error);
        return false;
    }
};

module.exports = { sendMatchEmail, sendWelcomeEmail, sendSupportEmail };
