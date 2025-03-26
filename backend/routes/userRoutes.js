const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getUsersByBatch
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes that need authentication
router.use(protect);

// Routes for all authenticated users
router.put('/profile', updateProfile);

// Routes restricted to admin
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin', 'trainer'), getUser)
  .put(updateUser) // Auth handled in controller due to self-update case
  .delete(authorize('admin'), deleteUser);

// Get users by batch
router.get('/batch/:batchId', authorize('admin', 'trainer'), getUsersByBatch);

module.exports = router;
