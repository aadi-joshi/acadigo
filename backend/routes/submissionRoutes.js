const express = require('express');
const router = express.Router();
const { 
  getMySubmissions,
  gradeSubmission 
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-submissions', protect, authorize('student'), getMySubmissions);
router.post('/:id/grade', protect, authorize('admin', 'trainer'), gradeSubmission);

module.exports = router;
