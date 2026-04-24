const userQueries = require('../queries/userQueries')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const { sendWelcomeEmail } = require("../services/emailService")
dotenv.config()
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUserName = await userQueries.getUserByUserName(username);
        if (existingUserName) {
            return res.status(400).json({ message: "Username already taken. Please try another." });
        }

        const existingUser = await userQueries.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await userQueries.createUser(username, email, password_hash);

        // Send welcome email (fire and forget)
        sendWelcomeEmail(user.email, user.username).catch(e => console.error("[Email] Welcome email failed:", e));

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                is_admin: user.is_admin
            },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: "User Created Successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (err) {
        console.error("Signup Error", err);
        return res.status(500).json({
            message: "INTERNAL SERVER ERROR"
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password, remember } = req.body;
        const existingUser = await userQueries.getUserByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ message: "No account found with this email. Please sign up first." });
        }
        const isMatch = await bcrypt.compare(password, existingUser.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        const token = jwt.sign({
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            is_admin: existingUser.is_admin
        },
            process.env.SECRET_KEY,
            { expiresIn: remember ? '30d' : '24h' }
        )
        const { password_hash, ...userWithoutPassword } = existingUser;
        return res.status(200).json({
            message: "Login Successful",
            user: userWithoutPassword,
            token
        })
    } catch (err) {
        console.error("Login Error", err)
        return res.status(500).json({
            message: "INTERNAL SERVER ERROR"
        })
    }
}

exports.profile = async (req, res) => {
    const id = req.user.id
    const result = await userQueries.userProfile(id);
    const { password_hash, ...userWithoutPassword } = result;
    return res.status(200).json({ message: "Profile of the user", result: userWithoutPassword })
}
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token: idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        let user = await userQueries.getUserByEmail(email);
        
        if (!user) {
            let username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            // Truncate to ensure there's room for random numbers and stays under 30 chars
            if (username.length > 20) username = username.substring(0, 20);

            const existingUserName = await userQueries.getUserByUserName(username);
            if (existingUserName) {
                username = username + Math.floor(Math.random() * 1000);
            }

            const password_hash = await bcrypt.hash(Math.random().toString(36), 10);
            user = await userQueries.createUser(username, email, password_hash);
            
            // Send welcome email for new Google user (fire and forget)
            sendWelcomeEmail(user.email, user.username).catch(e => console.error("[Email] Google welcome email failed:", e));
        }
        
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            is_admin: user.is_admin
        },
            process.env.SECRET_KEY,
            { expiresIn: '30d' }
        )
        
        const { password_hash: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            message: 'Google Login Successful',
            user: userWithoutPassword,
            token
        });
    } catch (err) {
        console.error('Google Login Error', err);
        return res.status(500).json({
            message: 'Google Authentication Failed'
        });
    }
}
