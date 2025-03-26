const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
  getPPTs,
  getPPT,
  uploadPPT,
  updatePPT,
  deletePPT,
  logPPTView
} = require('../controllers/pptController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPPTs);
router.get('/:id', protect, getPPT);
router.post('/', protect, authorize('admin', 'trainer'), upload.single('file'), uploadPPT);
router.put('/:id', protect, authorize('admin', 'trainer'), upload.single('file'), updatePPT);
router.delete('/:id', protect, authorize('admin', 'trainer'), deletePPT);
router.post('/:id/view', protect, logPPTView);

module.exports = router;
