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
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('admin', 'trainer'), upload.single('file'), createAssignment);
router.put('/:id', protect, authorize('admin', 'trainer'), upload.single('file'), updateAssignment);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.array('files'), submitAssignment);
router.get('/:id/submissions', protect, authorize('admin', 'trainer'), getSubmissions);

module.exports = router;
