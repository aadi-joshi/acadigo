const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import only the functions that actually exist in authController
const { 
  login,
  getMe
} = require('../controllers/authController');

// Public routes
router.post('/login', login);

// Test route to verify API is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Auth API is working' });
});

// Protected routes
router.get('/me', protect, getMe);

// Comment out these routes until their controllers are implemented
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:resetToken', resetPassword);
// router.post('/register', protect, authorize('admin'), register);

module.exports = router;
