const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // ✅ For generating reset tokens
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

// ✅ Signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // ✅ Check password strength in backend
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters long, include an uppercase letter and a number." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        res.redirect("/signup"); // ✅ Redirect to login after signup
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};


// ✅ Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // ✅ Store Token in Cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // ✅ Redirect and pass user data
        res.render("index", { user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Logout (Clears Token)
exports.logout = (req, res) => {
    res.cookie("token", "", { maxAge: 0 });
    res.redirect("/signup")
};

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Forgot Password - Generate Token & Send Email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body; // ✅ Get email from frontend input
        console.log("📩 Received email:", email); // Debugging

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found for email:", email);
            return res.status(400).json({ error: "User not found" });
        }

        // ✅ Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // ✅ Send Reset Email
        const resetUrl = `https://xzillowx.onrender.com/reset-password/${resetToken}`;
        const mailOptions = {
            from: `"XZillow Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h3>Password Reset Request</h3>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="background: #008cba; color: #fff; padding: 10px 15px; text-decoration: none;">Reset Password</a>
                <p>If you did not request this, ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Reset email sent to:", user.email);

        res.json({ message: "Password reset link sent to your email!" });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};



// ✅ Reset Password - Update Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // ✅ Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // ✅ Hash new password and save
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset. You can now login!" });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

