const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { uploadFile, deleteFile } = require('../config/firebase');
const { sendNewAssignmentNotification, sendAssignmentGradedNotification } = require('../utils/email');
const { logActivity } = require('../utils/logger');

// @desc    Get all assignments for the current user
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'student') {
      // Students can only see assignments for their batch
      if (!req.user.batch) {
        return res.status(400).json({ message: 'You are not assigned to any batch' });
      }
      query = Assignment.find({ batch: req.user.batch });
    } else if (req.user.role === 'trainer') {
      // Trainers can see assignments they created or for batches they manage
      query = Assignment.find({
        $or: [
          { createdBy: req.user._id },
          { batch: { $in: await Batch.find({ trainer: req.user._id }).select('_id') } }
        ]
      });
    } else {
      // Admins can see all assignments
      query = Assignment.find();
    }

    // Add sorting, most recent first
    query = query.sort('-createdAt');

    // Populate batch and creator info
    query = query.populate([
      { path: 'batch', select: 'name' },
      { path: 'createdBy', select: 'name role' }
    ]);

    const assignments = await query;

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      message: 'Server error retrieving assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate([
      { path: 'batch', select: 'name' },
      { path: 'createdBy', select: 'name role' }
    ]);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is authorized to view this assignment
    if (req.user.role === 'student') {
      if (!req.user.batch || !req.user.batch.equals(assignment.batch._id)) {
        return res.status(403).json({ message: 'Not authorized to view this assignment' });
      }
    } else if (req.user.role === 'trainer') {
      const batch = await Batch.findById(assignment.batch._id);
      if (!batch || !batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view this assignment' });
      }
    }

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'view_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id
    });

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      message: 'Server error retrieving assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (admin, trainer)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, batch, deadline, maxMarks } = req.body;

    // Validate required fields
    if (!title || !batch || !deadline) {
      return res.status(400).json({ message: 'Please provide title, batch, and deadline' });
    }

    // Check if batch exists
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if trainer is assigned to this batch
    if (req.user.role === 'trainer' && !batchDoc.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this batch' });
    }

    // Handle files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `assignments/${Date.now()}-${file.originalname}`;
        const fileData = await uploadFile(file, fileName);
        
        attachments.push({
          fileUrl: fileData.fileUrl,
          filePath: fileData.filePath,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize
        });
      }
    }

    // Create assignment in database
    const assignment = await Assignment.create({
      title,
      description,
      batch,
      deadline: new Date(deadline),
      maxMarks: maxMarks || 100,
      attachments,
      createdBy: req.user._id
    });

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'create_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id
    });

    // Send notification to students
    try {
      await sendNewAssignmentNotification(assignment, batchDoc);
    } catch (notificationError) {
      console.error('Error sending assignment notification:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      message: 'Server error creating assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (admin, trainer who created)
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is authorized to update this assignment
    if (req.user.role === 'trainer' && !assignment.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const { title, description, batch, deadline, maxMarks } = req.body;

    // If changing batch, check if trainer is assigned to new batch
    if (batch && batch !== assignment.batch.toString() && req.user.role === 'trainer') {
      const newBatch = await Batch.findById(batch);
      if (!newBatch || !newBatch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to move assignment to this batch' });
      }
    }

    // Handle files
    const attachments = [...assignment.attachments];
    
    // Remove files that are marked for deletion
    if (req.body.removeFiles && req.body.removeFiles.length > 0) {
      const removeFiles = Array.isArray(req.body.removeFiles) 
        ? req.body.removeFiles 
        : [req.body.removeFiles];
      
      for (const filePath of removeFiles) {
        // Delete from Firebase
        await deleteFile(filePath);
        
        // Remove from attachments array
        const index = attachments.findIndex(att => att.filePath === filePath);
        if (index !== -1) {
          attachments.splice(index, 1);
        }
      }
    }
    
    // Add new files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `assignments/${Date.now()}-${file.originalname}`;
        const fileData = await uploadFile(file, fileName);
        
        attachments.push({
          fileUrl: fileData.fileUrl,
          filePath: fileData.filePath,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize
        });
      }
    }

    // Update assignment
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        batch,
        deadline: deadline ? new Date(deadline) : assignment.deadline,
        maxMarks: maxMarks || assignment.maxMarks,
        attachments
      },
      { new: true, runValidators: true }
    );

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'update_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id
    });

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      message: 'Server error updating assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (admin, trainer who created)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is authorized to delete this assignment
    if (req.user.role === 'trainer' && !assignment.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    // Delete files from Firebase
    for (const attachment of assignment.attachments) {
      await deleteFile(attachment.filePath);
    }

    // Also delete any submissions for this assignment
    const submissions = await Submission.find({ assignment: assignment._id });
    
    for (const submission of submissions) {
      // Delete submission files
      for (const file of submission.files) {
        await deleteFile(file.filePath);
      }
      // Delete submission
      await submission.remove();
    }

    // Delete assignment from database
    await assignment.remove();

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'delete_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id
    });

    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      message: 'Server error deleting assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get assignments by batch
// @route   GET /api/assignments/batch/:batchId
// @access  Private (admin, trainer of batch, students in batch)
exports.getAssignmentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if user is authorized to view assignments for this batch
    if (req.user.role === 'student') {
      if (!req.user.batch || !req.user.batch.equals(batch._id)) {
        return res.status(403).json({ message: 'Not authorized to view assignments for this batch' });
      }
    } else if (req.user.role === 'trainer') {
      if (!batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view assignments for this batch' });
      }
    }

    // Get assignments for this batch
    const assignments = await Assignment.find({ batch: batchId })
      .sort('-createdAt')
      .populate({ path: 'createdBy', select: 'name role' });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Get assignments by batch error:', error);
    res.status(500).json({
      message: 'Server error retrieving assignments by batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
