const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { logActivity } = require('../controllers/logController');

// All routes require authentication
router.use(protect);

// Log PPT activity
router.post('/ppt/:id/view', logActivity('ppt_view'));
router.post('/ppt/:id/download', logActivity('ppt_download'));

// Log assignment activity
router.post('/assignment/:id/view', logActivity('assignment_view'));
router.post('/assignment/:id/download', logActivity('assignment_download'));

module.exports = router;
