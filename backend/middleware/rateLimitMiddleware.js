const rateLimit = require('express-rate-limit');

// Higher limits for authentication endpoints
exports.authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_AUTH) || 20, // Higher limit for auth endpoints
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.studentLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_STUDENT) || 60,
  message: 'Too many requests from this student, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.trainerLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_TRAINER) || 120,
  message: 'Too many requests from this trainer, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.adminLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_ADMIN) || 180,
  message: 'Too many requests from this admin, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.roleLimiter = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  switch (req.user.role) {
    case 'student':
      return exports.studentLimiter(req, res, next);
    case 'trainer':
      return exports.trainerLimiter(req, res, next);
    case 'admin':
      return exports.adminLimiter(req, res, next);
    default:
      return next();
  }
};
