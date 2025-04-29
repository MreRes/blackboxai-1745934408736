const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Authentication required' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                error: 'User not found' 
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired' 
            });
        }
        res.status(500).json({ 
            error: 'Authentication error' 
        });
    }
};

// Optional auth middleware that doesn't require authentication
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ 
            error: 'Email verification required' 
        });
    }
    next();
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN 
        }
    );
};

module.exports = {
    auth,
    optionalAuth,
    requireVerified,
    generateToken
};
