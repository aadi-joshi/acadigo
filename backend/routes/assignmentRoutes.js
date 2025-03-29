const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions
} = require('../controllers/assignmentController');

// Import the correct middleware path - this is likely the issue
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Define routes with proper middleware and handlers
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/', authorize('admin', 'trainer'), upload.single('file'), createAssignment);
router.put('/:id', authorize('admin', 'trainer'), upload.single('file'), updateAssignment);
router.delete('/:id', authorize('admin', 'trainer'), deleteAssignment);
router.post('/:id/submit', authorize('student'), upload.array('files'), submitAssignment);
router.get('/:id/submissions', authorize('admin', 'trainer'), getSubmissions);

module.exports = router;
