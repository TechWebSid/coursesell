const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  try {
    // Check both cookie and Authorization header for token
    let token = req.cookies.token;
    
    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Please login to access this resource' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Set both id and userId in req.user for compatibility
    req.user = {
      ...user.toObject(),
      id: user._id,
      userId: user._id
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ 
      error: 'Invalid token',
      details: error.message
    });
  }
};

const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Access denied. Instructors only.' });
  }
  next();
};

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

module.exports = { isAuthenticated, isInstructor, authorize }; 