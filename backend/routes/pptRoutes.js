const express = require('express');
const multer = require('multer');
const {
  getPPTs,
  getPPT,
  uploadPPT,
  updatePPT,
  deletePPT,
  getPPTsByBatch
} = require('../controllers/pptController');
const { protect, authorize } = require('../middleware/auth');

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PPT, PPTX, PDF, etc.
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PPT, PPTX, DOC, DOCX, and PDF files are allowed.'), false);
    }
  }
});

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all PPTs
router.get('/', getPPTs);

// Get PPTs by batch
router.get('/batch/:batchId', getPPTsByBatch);

// Upload PPT
router.post('/', authorize('admin', 'trainer'), upload.single('file'), uploadPPT);

// PPT routes with ID
router.route('/:id')
  .get(getPPT)
  .put(authorize('admin', 'trainer'), upload.single('file'), updatePPT)
  .delete(authorize('admin', 'trainer'), deletePPT);

module.exports = router;
