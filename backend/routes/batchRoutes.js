const express = require('express');
const router = express.Router();
const { 
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  addStudentToBatch,
  removeStudentFromBatch
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getBatches);
router.get('/:id', protect, getBatch);
router.post('/', protect, authorize('admin', 'trainer'), createBatch);
router.put('/:id', protect, authorize('admin', 'trainer'), updateBatch);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteBatch);
router.post('/:id/students', protect, authorize('admin', 'trainer'), addStudentToBatch);
router.delete('/:id/students/:studentId', protect, authorize('admin', 'trainer'), removeStudentFromBatch);

module.exports = router;
