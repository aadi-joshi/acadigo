const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.active) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Authorize by role - FIXED: properly handle admin access and debug logging
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`Authorization check: User role ${req.user.role}, Required roles: ${roles.join(', ')}`);
    
    // Always allow admin regardless of specified roles
    if (req.user.role === 'admin') {
      console.log('Admin access granted');
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Access denied: User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`);
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }
    
    console.log('Authorization successful');
    next();
  };
};
