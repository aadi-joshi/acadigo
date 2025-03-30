const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getMySubmissions,
  gradeSubmission 
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for feedback images
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for feedback'));
    }
  }
});

router.use(protect);
router.get('/my-submissions', authorize('student'), getMySubmissions);
// Update route to include file upload middleware
router.put('/:id/grade', authorize('admin', 'trainer'), upload.single('feedbackImage'), gradeSubmission);

module.exports = router;
