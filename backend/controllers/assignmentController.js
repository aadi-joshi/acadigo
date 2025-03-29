const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { uploadFile, deleteFile } = require('../utils/supabase');
const User = require('../models/User');
const Batch = require('../models/Batch');
const { sendEmail } = require('../utils/emailService');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    let query;
    
    // If student, only get assignments for their batch
    if (req.user.role === 'student') {
      query = Assignment.find({ batch: req.user.batch });
    } 
    // If trainer, only get assignments they created or for batches they manage
    else if (req.user.role === 'trainer') {
      const trainerBatches = await Batch.find({ trainer: req.user._id }).select('_id');
      const batchIds = trainerBatches.map(batch => batch._id);
      
      query = Assignment.find({
        $or: [
          { uploadedBy: req.user._id },
          { batch: { $in: batchIds } }
        ]
      });
    } 
    // If admin, get all assignments
    else {
      query = Assignment.find();
    }
    
    // Add filters based on query parameters
    if (req.query.batchId) {
      query = query.find({ batch: req.query.batchId });
    }
    
    // Populate batch and uploader details
    query = query.populate({
      path: 'batch',
      select: 'name'
    }).populate({
      path: 'uploadedBy',
      select: 'name'
    });
    
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
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'batch',
        select: 'name'
      })
      .populate({
        path: 'uploadedBy',
        select: 'name'
      });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
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
    const { title, description, batch, deadline, maxMarks, allowResubmission } = req.body;
    
    // Check required fields
    if (!title || !batch || !deadline || !maxMarks) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if batch exists
    const batchExists = await Batch.findById(batch);
    if (!batchExists) {
      return res.status(400).json({ message: 'Batch not found' });
    }
    
    // Upload file to Supabase if provided
    let fileData = {};
    if (req.file) {
      fileData = await uploadFile(
        req.file,
        `assignments/${Date.now()}-${req.file.originalname}`,
        req.user
      );
    }
    
    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      fileUrl: fileData.fileUrl || null,
      filePath: fileData.filePath || null,
      fileName: fileData.fileName || null,
      fileSize: fileData.fileSize || null,
      batch,
      deadline,
      maxMarks: parseInt(maxMarks),
      allowResubmission: allowResubmission === 'true' || allowResubmission === true,
      uploadedBy: req.user._id
    });
    
    // Get students from the batch for email notification
    const students = await User.find({ batch, role: 'student' });
    
    // Send email notifications to students (non-blocking)
    students.forEach(student => {
      try {
        sendEmail(
          student.email,
          `New Assignment: ${title}`,
          `A new assignment "${title}" has been posted. The deadline is ${new Date(deadline).toLocaleString()}.`,
          'newAssignment',
          { assignment, batch: batchExists }
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    });
    
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
// @access  Private (admin, trainer who uploaded it)
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized to update
    if (req.user.role === 'trainer' && !assignment.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }
    
    const { title, description, batch, deadline, maxMarks, allowResubmission } = req.body;
    
    // Build update object
    const updateData = {
      title: title || assignment.title,
      description: description || assignment.description,
      batch: batch || assignment.batch,
      deadline: deadline || assignment.deadline,
      maxMarks: maxMarks ? parseInt(maxMarks) : assignment.maxMarks,
      allowResubmission: allowResubmission !== undefined ? 
        (allowResubmission === 'true' || allowResubmission === true) : 
        assignment.allowResubmission
    };
    
    // Upload new file if provided
    if (req.file) {
      // Delete old file if exists
      if (assignment.filePath) {
        await deleteFile(assignment.filePath);
      }
      
      // Upload new file
      const fileData = await uploadFile(
        req.file,
        `assignments/${Date.now()}-${req.file.originalname}`,
        req.user
      );
      
      // Add file data to update object
      updateData.fileUrl = fileData.fileUrl;
      updateData.filePath = fileData.filePath;
      updateData.fileName = fileData.fileName;
      updateData.fileSize = fileData.fileSize;
    }
    
    // Update assignment
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
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
// @access  Private (admin, trainer who uploaded it)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized to delete
    if (req.user.role === 'trainer' && !assignment.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }
    
    // Delete file from storage if exists
    if (assignment.filePath) {
      await deleteFile(assignment.filePath);
    }
    
    // Delete all submissions for this assignment
    const submissions = await Submission.find({ assignment: assignment._id });
    for (const submission of submissions) {
      // Delete each file in the submission
      for (const file of submission.files) {
        if (file.filePath) {
          await deleteFile(file.filePath);
        }
      }
      
      // Delete submission from database
      await Submission.findByIdAndDelete(submission._id);
    }
    
    // Delete assignment from database
    await Assignment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      message: 'Server error deleting assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (student)
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if student is from the correct batch
    if (!req.user.batch.equals(assignment.batch)) {
      return res.status(403).json({ message: 'Not authorized to submit to this assignment' });
    }
    
    // Check if deadline has passed and resubmission is not allowed
    const deadlinePassed = new Date(assignment.deadline) < new Date();
    const existingSubmission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id
    });
    
    if (deadlinePassed && !assignment.allowResubmission && existingSubmission) {
      return res.status(400).json({ message: 'Deadline has passed and resubmission is not allowed' });
    }
    
    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one file' });
    }
    
    // Upload files to Supabase
    const uploadedFiles = [];
    for (const file of req.files) {
      const fileData = await uploadFile(
        file,
        `submissions/${req.user._id}/${assignment._id}/${Date.now()}-${file.originalname}`,
        req.user
      );
      
      uploadedFiles.push({
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        filePath: fileData.filePath,
        fileSize: fileData.fileSize,
        uploadedAt: new Date()
      });
    }
    
    // Create or update submission
    let submission;
    
    if (existingSubmission) {
      // Delete old files from storage
      for (const file of existingSubmission.files) {
        if (file.filePath) {
          await deleteFile(file.filePath);
        }
      }
      
      // Update submission
      submission = await Submission.findByIdAndUpdate(
        existingSubmission._id,
        {
          files: uploadedFiles,
          submittedAt: new Date(),
          status: deadlinePassed ? 'late' : 'submitted'
        },
        { new: true }
      );
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        files: uploadedFiles,
        submittedAt: new Date(),
        status: deadlinePassed ? 'late' : 'submitted'
      });
    }
    
    // Notify trainer (non-blocking)
    const batchData = await Batch.findById(assignment.batch).populate('trainer');
    if (batchData && batchData.trainer) {
      try {
        const student = await User.findById(req.user._id);
        sendEmail(
          batchData.trainer.email,
          `Assignment Submission: ${assignment.title}`,
          `${student.name} has submitted the assignment "${assignment.title}"`,
          'submissionNotification',
          { student, assignment }
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }
    
    res.status(200).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      message: 'Server error submitting assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (admin, trainer)
exports.getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // If trainer, check if they're authorized to view submissions
    if (req.user.role === 'trainer') {
      const batch = await Batch.findById(assignment.batch);
      if (!batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view these submissions' });
      }
    }
    
    // Get submissions for the assignment
    const submissions = await Submission.find({ assignment: assignment._id })
      .populate({
        path: 'student',
        select: 'name email'
      });
    
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      message: 'Server error retrieving submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};