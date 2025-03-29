const rateLimit = require('express-rate-limit');

// Get rate limit window and max counts from environment variables
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || 60000; // 1 minute
const RATE_LIMIT_MAX_STUDENT = process.env.RATE_LIMIT_MAX_STUDENT || 60;
const RATE_LIMIT_MAX_TRAINER = process.env.RATE_LIMIT_MAX_TRAINER || 120;
const RATE_LIMIT_MAX_ADMIN = process.env.RATE_LIMIT_MAX_ADMIN || 180;

/**
 * Dynamic rate limiter based on user role
 */
const roleLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: (req) => {
    if (!req.user) return RATE_LIMIT_MAX_STUDENT; // Default to student limits
    
    // Assign limit based on role
    switch (req.user.role) {
      case 'admin':
        return parseInt(RATE_LIMIT_MAX_ADMIN);
      case 'trainer':
        return parseInt(RATE_LIMIT_MAX_TRAINER);
      case 'student':
      default:
        return parseInt(RATE_LIMIT_MAX_STUDENT);
    }
  },
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in development environment
  skip: () => process.env.NODE_ENV === 'development'
});

// General limiter for non-authenticated routes
const generalLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: 30, // 30 requests per minute
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development environment
  skip: () => process.env.NODE_ENV === 'development'
});

module.exports = {
  roleLimiter,
  generalLimiter
};
