const express = require('express');
const {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  addStudentToBatch,
  removeStudentFromBatch
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes for admins and trainers
router.get('/', authorize('admin', 'trainer'), getBatches);

// Create batch - admin only
router.post('/', authorize('admin'), createBatch);

// Batch routes with ID
router.route('/:id')
  .get(authorize('admin', 'trainer', 'student'), getBatch)
  .put(authorize('admin', 'trainer'), updateBatch)
  .delete(authorize('admin'), deleteBatch);

// Batch student management
router.route('/:id/students')
  .get(authorize('admin', 'trainer'), getBatchStudents)
  .post(authorize('admin', 'trainer'), addStudentToBatch);

router.delete('/:id/students/:studentId', authorize('admin', 'trainer'), removeStudentFromBatch);

module.exports = router;
