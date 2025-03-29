const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import all functions from authController
const { 
  login,
  getMe,
  register,
  logout,
  test
} = require('../controllers/authController'); // Fixed missing closing parenthesis here

// Public routes
router.post('/login', login);

// Test route to verify API is working
router.get('/test', test);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// Enable the register route for admin
router.post('/register', protect, authorize('admin'), register);

module.exports = router;
