const express = require('express');
const router = express.Router();
const { 
  getMySubmissions,
  gradeSubmission 
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/my-submissions', authorize('student'), getMySubmissions);
router.post('/:id/grade', authorize('admin', 'trainer'), gradeSubmission);

module.exports = router;
