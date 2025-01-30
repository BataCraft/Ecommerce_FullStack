const jwt = require('jsonwebtoken');
const User = require('../Model/User.model')

const isAuthUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // Check if token exists
        if (!token) {
            return res.status(401).json({  
                success: false, 
                message: "Please login to access this resource" 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if user still exists in database
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Check if user is verified
            if (!user.accountVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email to access this resource"
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (tokenError) {
            if (tokenError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            }
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please login again"
                });
            }
            throw tokenError; // Re-throw unexpected errors
        }

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Authentication failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Optional: Add role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

module.exports = { 
    isAuthUser,
    authorizeRoles 
};