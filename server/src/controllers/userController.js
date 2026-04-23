const userQueries = require('../queries/userQueries')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
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
        const { email, password } = req.body;
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
            { expiresIn: '100m' }
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