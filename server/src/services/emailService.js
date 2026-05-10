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
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; color: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #22d3ee 0%, #2563eb 100%); border-radius: 12px; margin-bottom: 15px;">
                            <span style="font-size: 24px; color: white; font-weight: bold;">E</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">New Exam Match</h1>
                    </div>
                    
                    <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h2 style="margin-top: 0; color: #22d3ee; font-size: 20px;">Hello ${userName},</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                            Great news! Based on your academic profile, you are eligible to apply for a new exam post.
                        </p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #1e293b; border-left: 4px solid #22d3ee; border-radius: 8px;">
                            <h3 style="margin-top: 0; color: #ffffff; font-size: 18px;">${examName}</h3>
                            <p style="margin-bottom: 0; color: #cbd5e1; font-size: 15px;"><strong>Post:</strong> ${postName}</p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                            Log in to your dashboard to view the full details and start your application process before the deadline.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://geteligify.app/eligible-exams" style="display: inline-block; background: linear-gradient(to right, #22d3ee, #06b6d4); color: #020617; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                View Exam Details
                            </a>
                        </div>
                    </div>
                    
                    <p style="color: #475569; font-size: 13px; text-align: center; margin-top: 30px;">
                        You received this email because you are opted into eligibility alerts. <br>
                        © 2024 Eligify Platform. All rights reserved.
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
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; color: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border-radius: 12px; margin-bottom: 15px;">
                            <span style="font-size: 24px; color: white; font-weight: bold;">E</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">Support Inquiry</h1>
                    </div>
                    
                    <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h2 style="margin-top: 0; color: #a855f7; font-size: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 15px;">New Message Received</h2>
                        
                        <div style="margin-top: 20px;">
                            <p style="color: #94a3b8; font-size: 15px; margin: 5px 0;"><strong>Name:</strong> <span style="color: #f8fafc;">${name}</span></p>
                            <p style="color: #94a3b8; font-size: 15px; margin: 5px 0;"><strong>Email:</strong> <span style="color: #f8fafc;">${email}</span></p>
                        </div>
                        
                        <div style="margin: 25px 0 0 0; padding: 20px; background-color: #1e293b; border-left: 4px solid #a855f7; border-radius: 8px;">
                            <p style="margin-top: 0; font-weight: bold; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message:</p>
                            <p style="color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
                        </div>
                    </div>
                    
                    <p style="color: #475569; font-size: 13px; text-align: center; margin-top: 30px;">
                        This inquiry was sent from the Eligify Contact Form. <br>
                        © 2024 Eligify Platform. All rights reserved.
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

/**
 * Sends a deadline reminder email to a user
 * @param {string} userEmail - The email address of the student
 * @param {string} userName - The username or name of the student
 * @param {string} examName - The name of the exam
 * @param {string} postName - The name of the specific post
 * @param {number} daysLeft - Number of days until the deadline
 */
const sendDeadlineEmail = async (userEmail, userName, examName, postName, daysLeft) => {
    // Only attempt to send if SMTP is configured
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log(`[EmailService] Skipping deadline email to ${userEmail} (SMTP not configured)`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"Eligibility Engine" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `⚠️ Deadline Approaching: ${examName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; color: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 12px; margin-bottom: 15px;">
                            <span style="font-size: 24px; color: white; font-weight: bold;">E</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">Deadline Alert</h1>
                    </div>
                    
                    <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h2 style="margin-top: 0; color: #f59e0b; font-size: 20px;">Hello ${userName},</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                            This is an automated reminder from the Eligibility Engine. You have a matched opportunity that is closing in exactly <strong>${daysLeft} days</strong>.
                        </p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 8px;">
                            <h3 style="margin-top: 0; color: #ffffff; font-size: 18px;">${examName}</h3>
                            <p style="margin-bottom: 0; color: #cbd5e1; font-size: 15px;"><strong>Post:</strong> ${postName}</p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                            If you haven't applied yet, log in to your dashboard to view the full details and submit your application before the deadline passes.
                        </p>
                        <p style="color: #64748b; font-size: 14px; font-style: italic; margin-top: 10px;">
                            If you have already applied, please ignore this email.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://geteligify.app/eligible-exams" style="display: inline-block; background: linear-gradient(to right, #fbbf24, #f59e0b); color: #020617; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                View Exam Details
                            </a>
                        </div>
                    </div>
                    
                    <p style="color: #475569; font-size: 13px; text-align: center; margin-top: 30px;">
                        You received this email because you are opted into eligibility alerts. <br>
                        © 2024 Eligify Platform. All rights reserved.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Deadline email sent successfully to ${userEmail} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Failed to send deadline email to ${userEmail}:`, error);
        return false;
    }
};

module.exports = { sendMatchEmail, sendWelcomeEmail, sendSupportEmail, sendDeadlineEmail };
