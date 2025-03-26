const express = require('express');
const { login, getMe, register, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin'), register);

module.exports = router;
