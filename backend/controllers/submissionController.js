const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { uploadFile, deleteFile } = require('../config/firebase');
const { sendAssignmentGradedNotification } = require('../utils/email');
const { logActivity } = require('../utils/logger');

// @desc    Submit assignment
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private (students only)
exports.submitAssignment = async (req, res) => {
  try {
    // Only students can submit assignments
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }

    const { assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is in the correct batch
    if (!req.user.batch || !req.user.batch.equals(assignment.batch)) {
      return res.status(403).json({ message: 'You are not authorized to submit to this assignment' });
    }

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one file' });
    }

    // Check if assignment deadline has passed
    const isLate = new Date() > new Date(assignment.deadline);

    // Check if the student has already submitted
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    // Upload files to Firebase
    const files = [];
    for (const file of req.files) {
      const fileName = `submissions/${req.user._id}-${Date.now()}-${file.originalname}`;
      const fileData = await uploadFile(file, fileName);
      
      files.push({
        fileUrl: fileData.fileUrl,
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize
      });
    }

    if (submission) {
      // This is a resubmission - delete old files first
      for (const file of submission.files) {
        await deleteFile(file.filePath);
      }
      
      // Update the existing submission
      submission = await Submission.findByIdAndUpdate(
        submission._id,
        {
          files,
          submittedAt: Date.now(),
          isLate,
          status: 'submitted',
          // Clear grading if resubmitted
          marks: undefined,
          feedback: undefined,
          gradedBy: undefined,
          gradedAt: undefined
        },
        { new: true }
      );
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        files,
        isLate
      });
    }

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'submit_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id,
      details: {
        submissionId: submission._id,
        isLate
      }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      message: 'Server error submitting assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (admin, trainer)
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only admins and trainers can view all submissions
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Not authorized to view all submissions' });
    }

    // For trainers, check if they are assigned to the batch
    if (req.user.role === 'trainer') {
      const batch = await Batch.findById(assignment.batch);
      if (!batch || !batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view submissions for this batch' });
      }
    }

    // Get all submissions for the assignment
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate({ path: 'student', select: 'name email' })
      .populate({ path: 'gradedBy', select: 'name' });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      message: 'Server error retrieving submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get a student's submission for an assignment
// @route   GET /api/assignments/:assignmentId/submission
// @access  Private (student owner, admin, trainer)
exports.getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // For students, get their own submission
    if (req.user.role === 'student') {
      // Check if student is in the correct batch
      if (!req.user.batch || !req.user.batch.equals(assignment.batch)) {
        return res.status(403).json({ message: 'You are not authorized to view this assignment' });
      }

      const submission = await Submission.findOne({
        assignment: assignmentId,
        student: req.user._id
      });

      return res.status(200).json(submission || null);
    }

    // For trainers, check if they are assigned to the batch
    if (req.user.role === 'trainer') {
      const batch = await Batch.findById(assignment.batch);
      if (!batch || !batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view submissions for this batch' });
      }
    }

    // Admin or authorized trainer - they need to specify a student ID
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    }).populate({ 
      path: 'student', 
      select: 'name email' 
    }).populate({ 
      path: 'gradedBy', 
      select: 'name' 
    });

    res.status(200).json(submission || null);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      message: 'Server error retrieving submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:submissionId/grade
// @access  Private (admin, trainer)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    // Only admins and trainers can grade submissions
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Not authorized to grade submissions' });
    }

    // Check if marks is provided
    if (marks === undefined) {
      return res.status(400).json({ message: 'Marks are required' });
    }

    // Find submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Find associated assignment and batch
    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Associated assignment not found' });
    }

    // For trainers, check if they are assigned to the batch
    if (req.user.role === 'trainer') {
      const batch = await Batch.findById(assignment.batch);
      if (!batch || !batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to grade submissions for this batch' });
      }
    }

    // Validate marks
    if (marks < 0 || marks > assignment.maxMarks) {
      return res.status(400).json({ message: `Marks should be between 0 and ${assignment.maxMarks}` });
    }

    // Update the submission with grading info
    const gradedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        marks,
        feedback: feedback || '',
        gradedBy: req.user._id,
        gradedAt: Date.now(),
        status: 'graded'
      },
      { new: true }
    ).populate({
      path: 'student',
      select: 'name email'
    });

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'grade_assignment',
      resourceType: 'assignment',
      resourceId: assignment._id,
      details: {
        submissionId: submission._id,
        marks,
        studentId: submission.student
      }
    });

    // Send graded notification to student
    try {
      await sendAssignmentGradedNotification(gradedSubmission, assignment);
    } catch (notificationError) {
      console.error('Error sending grade notification:', notificationError);
      // Continue even if notification fails
    }

    res.status(200).json(gradedSubmission);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      message: 'Server error grading submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
