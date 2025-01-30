// utils/sendEmail.js
const transporter = require('../config/Email.config');

const sendVerificationEmail = async ({ to, verificationCode }) => {
    try {
        const mailOptions = {
            from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
            to,
            subject: 'Email Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center; padding: 20px;">Email Verification</h2>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
                        <p style="margin-bottom: 20px;">Hello,</p>
                        <p>Thank you for registering! Please use the following verification code to complete your registration:</p>
                        <div style="background-color: #fff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                            <h1 style="color: #007bff; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
                        </div>
                        <p style="margin-bottom: 20px;">This code will expire in 5 minutes.</p>
                        <p style="color: #666; font-size: 0.9em;">If you didn't request this verification code, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 0.8em;">
                        <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send verification email');
    }
};


const sendForgotPasswordEmail = async ({ to, resetUrl }) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.SMTP_EMAIL}>`,
            to,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center; padding: 20px;">Password Reset Request</h2>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
                        <p style="margin-bottom: 20px;">Hello,</p>
                        <p>We received a request to reset your password. Click the link below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #007bff; 
                                      color: #ffffff; 
                                      padding: 12px 25px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="margin-bottom: 10px;">Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #007bff; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                            ${resetUrl}
                        </p>
                        <p style="margin-top: 20px; color: #666;">This link will expire in 5 minutes.</p>
                        <p style="color: #666; font-size: 0.9em;">If you didn't request this password reset, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send password reset email');
    }
};
module.exports = { sendVerificationEmail, sendForgotPasswordEmail };