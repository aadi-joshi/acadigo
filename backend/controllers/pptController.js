const PPT = require('../models/PPT');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { uploadFile, deleteFile } = require('../utils/supabase');
const { sendNewPPTNotification } = require('../utils/email');

// @desc    Get all PPTs for the current user
// @route   GET /api/ppts
// @access  Private
exports.getPPTs = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'student') {
      // Students can only see PPTs for their batch
      if (!req.user.batch) {
        return res.status(400).json({ message: 'You are not assigned to any batch' });
      }
      query = PPT.find({ batch: req.user.batch });
    } else if (req.user.role === 'trainer') {
      // Trainers can see PPTs they uploaded or for batches they manage
      query = PPT.find({
        $or: [
          { uploadedBy: req.user._id },
          { batch: { $in: await Batch.find({ trainer: req.user._id }).select('_id') } }
        ]
      });
    } else {
      // Admins can see all PPTs
      query = PPT.find();
    }

    // Add sorting, most recent first
    query = query.sort('-createdAt');

    // Populate batch and uploader info
    query = query.populate([
      { path: 'batch', select: 'name' },
      { path: 'uploadedBy', select: 'name role' }
    ]);

    const ppts = await query;

    res.status(200).json(ppts);
  } catch (error) {
    console.error('Get PPTs error:', error);
    res.status(500).json({
      message: 'Server error retrieving PPTs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single PPT
// @route   GET /api/ppts/:id
// @access  Private
exports.getPPT = async (req, res) => {
  try {
    const ppt = await PPT.findById(req.params.id).populate([
      { path: 'batch', select: 'name' },
      { path: 'uploadedBy', select: 'name role' }
    ]);

    if (!ppt) {
      return res.status(404).json({ message: 'PPT not found' });
    }

    // Check if user is authorized to view this PPT
    if (req.user.role === 'student') {
      if (!req.user.batch || !req.user.batch.equals(ppt.batch._id)) {
        return res.status(403).json({ message: 'Not authorized to view this PPT' });
      }
    } else if (req.user.role === 'trainer') {
      const batch = await Batch.findById(ppt.batch._id);
      if (!batch || !batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view this PPT' });
      }
    }

    res.status(200).json(ppt);
  } catch (error) {
    console.error('Get PPT error:', error);
    res.status(500).json({
      message: 'Server error retrieving PPT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload PPT
// @route   POST /api/ppts
// @access  Private (admin, trainer)
exports.uploadPPT = async (req, res) => {
  try {
    const { title, description, batch } = req.body;

    // Check for file
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Validate required fields
    if (!title || !batch) {
      return res.status(400).json({ message: 'Please provide title and batch' });
    }

    // Check if batch exists
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if trainer is assigned to this batch
    if (req.user.role === 'trainer' && !batchDoc.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to upload PPTs to this batch' });
    }

    // Upload file to Supabase Storage
    const fileData = await uploadFile(
      req.file, 
      `ppts/${req.file.originalname}`,
      req.user
    );

    // Create PPT in database
    const ppt = await PPT.create({
      title,
      description,
      batch,
      fileUrl: fileData.fileUrl,
      filePath: fileData.filePath,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      uploadedBy: req.user._id
    });

    // Send notification to students
    try {
      await sendNewPPTNotification(ppt, batchDoc);
    } catch (notificationError) {
      console.error('Error sending PPT notification:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json(ppt);
  } catch (error) {
    console.error('Upload PPT error:', error);
    res.status(500).json({
      message: 'Server error uploading PPT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update PPT
// @route   PUT /api/ppts/:id
// @access  Private (admin, trainer who uploaded)
exports.updatePPT = async (req, res) => {
  try {
    let ppt = await PPT.findById(req.params.id);

    if (!ppt) {
      return res.status(404).json({ message: 'PPT not found' });
    }

    // Check if user is authorized to update this PPT
    if (req.user.role === 'trainer' && !ppt.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this PPT' });
    }

    const { title, description, batch } = req.body;

    // If changing batch, check if trainer is assigned to new batch
    if (batch && batch !== ppt.batch.toString() && req.user.role === 'trainer') {
      const newBatch = await Batch.findById(batch);
      if (!newBatch || !newBatch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to move PPT to this batch' });
      }
    }

    // Update file if provided
    let fileData = null;
    if (req.file) {
      // Delete old file from Supabase
      await deleteFile(ppt.filePath);

      // Upload new file to Supabase Storage
      const fileName = `ppts/${Date.now()}-${req.file.originalname}`;
      fileData = await uploadFile(req.file, fileName, req.user);
    }

    // Update PPT
    ppt = await PPT.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        batch,
        ...(fileData && {
          fileUrl: fileData.fileUrl,
          filePath: fileData.filePath,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize
        })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(ppt);
  } catch (error) {
    console.error('Update PPT error:', error);
    res.status(500).json({
      message: 'Server error updating PPT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete PPT
// @route   DELETE /api/ppts/:id
// @access  Private (admin, trainer who uploaded)
exports.deletePPT = async (req, res) => {
  try {
    const ppt = await PPT.findById(req.params.id);

    if (!ppt) {
      return res.status(404).json({ message: 'PPT not found' });
    }

    // Check if user is authorized to delete this PPT
    if (req.user.role === 'trainer' && !ppt.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this PPT' });
    }

    // Delete file from Supabase
    await deleteFile(ppt.filePath);

    // Delete PPT from database
    await ppt.remove();

    res.status(200).json({ success: true, message: 'PPT deleted' });
  } catch (error) {
    console.error('Delete PPT error:', error);
    res.status(500).json({
      message: 'Server error deleting PPT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get PPTs by batch
// @route   GET /api/ppts/batch/:batchId
// @access  Private (admin, trainer of batch, students in batch)
exports.getPPTsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if user is authorized to view PPTs for this batch
    if (req.user.role === 'student') {
      if (!req.user.batch || !req.user.batch.equals(batch._id)) {
        return res.status(403).json({ message: 'Not authorized to view PPTs for this batch' });
      }
    } else if (req.user.role === 'trainer') {
      if (!batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view PPTs for this batch' });
      }
    }

    // Get PPTs for this batch
    const ppts = await PPT.find({ batch: batchId })
      .sort('-createdAt')
      .populate({ path: 'uploadedBy', select: 'name role' });

    res.status(200).json(ppts);
  } catch (error) {
    console.error('Get PPTs by batch error:', error);
    res.status(500).json({
      message: 'Server error retrieving PPTs by batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
