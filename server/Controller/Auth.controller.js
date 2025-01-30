const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Model/User.model');
const { sendVerificationEmail, sendForgotPasswordEmail } = require('../Utils/sendEmail');


// Cookie options utility
const getCookieOptions = () => ({
    expires: new Date(Date.now() + (process.env.COOKIE_EXPIRES_TIME || 24) * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
});

const registerUser = async (req, res) => {
    const { email, name, password, phoneNumber } = req.body;

    try {
        if (!email || !name || !password || !phoneNumber) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter all fields" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists" 
            });
        }

        const user = new User({
            email,
            name,
            password,
            phoneNumber
        });

        const verificationCode = user.generateVerificationCode();
        await user.save();

        try {
            await sendVerificationEmail({
                to: email,
                verificationCode
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email"
            });
        }

        const token = user.getJwtToken();

        // Set authentication token cookie
        res.cookie("token", token, getCookieOptions());

        // Set registration status cookie
        res.cookie("registration_status", "pending_verification", {
            ...getCookieOptions(),
            maxAge: 5 * 60 * 1000 // 5 minutes for verification
        });

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountVerified: user.accountVerified
        };

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for verification code.",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.clearCookie("token");
        res.clearCookie("registration_status");
        return res.status(500).json({ 
            success: false, 
            message: "Registration failed", 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and verification code"
            });
        }

        const user = await User.findOne({ email })
            .select('+verificationCode +verificationCodeExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.accountVerified) {
            res.clearCookie("registration_status");
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        if (user.verificationCode !== code || 
            user.verificationCodeExpire < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        user.accountVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        // Clear registration status cookie
        res.clearCookie("registration_status");

        // Generate new token with verified status
        const token = user.getJwtToken();
        res.cookie("token", token, getCookieOptions());

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountVerified: true
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: "Verification failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get User

const GetUSer = async(req, res) =>{

    const user = req.user;
    res.status(200).json({ 
        success: true, 
        user: user 
    });

}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter all fields" 
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        if (!user.accountVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        const token = user.getJwtToken();

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountVerified: user.accountVerified
        };

        res.cookie("token", token, getCookieOptions());

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Login failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            ...getCookieOptions(),
            expires: new Date(0)
        });

        return res.status(200).json({ 
            success: true, 
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Logout failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



// Forget password

const forgetPassword = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const resetToken = user.getResetPasswordToken();

        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpire : Date.now() + 5 * 60 * 1000

            
        });

        // Create the reset URL using FRONTEND_URL from environment variables
        const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

        try {
            await sendForgotPasswordEmail({
                to: user.email,
                resetUrl: resetUrl  
            });

            return res.status(200).json({
                success: true,
                message: "Password reset email sent successfully"
            });
        } catch (error) {
            // Reset the token fields if email sending fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: "Email could not be sent",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// ResetPassword

const ResetPassword = async(req, res) => {
    const {token} = req.params;
    try {

        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset token is invalid or has expired"
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
        
    }

}






module.exports = { 
    registerUser, 
    loginUser, 
    logout, 
    verifyEmail,
    GetUSer,
    forgetPassword,
    ResetPassword
};