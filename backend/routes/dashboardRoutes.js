const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Get dashboard data based on user role
router.get('/', getDashboardData);

module.exports = router;
