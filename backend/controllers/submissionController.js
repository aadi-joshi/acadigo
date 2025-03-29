const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Get submissions for the logged-in student
// @route   GET /api/submissions/my-submissions
// @access  Private (student)
exports.getMySubmissions = async (req, res) => {
  try {
    // Find all submissions for the student
    const submissions = await Submission.find({ student: req.user._id })
      .populate({
        path: 'assignment',
        select: 'title description deadline maxMarks'
      })
      .sort('-submittedAt');
    
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      message: 'Server error retrieving submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (admin, trainer)
exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    
    // Validate score
    if (!score) {
      return res.status(400).json({ message: 'Please provide a score' });
    }
    
    // Find submission
    const submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate('student');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if score is within max score range
    if (parseInt(score) > submission.assignment.maxMarks) {
      return res.status(400).json({ 
        message: `Score cannot exceed maximum marks of ${submission.assignment.maxMarks}` 
      });
    }
    
    // Check if trainer is authorized (admin can grade any submission)
    if (req.user.role === 'trainer') {
      // Get the batch for this assignment
      const assignment = await Assignment.findById(submission.assignment._id)
        .populate('batch');
      
      if (!assignment.batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to grade this submission' });
      }
    }
    
    // Update submission with grade
    submission.marks = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    
    await submission.save();
    
    // Notify student via email (non-blocking)
    try {
      await sendEmail(
        submission.student.email,
        `Your assignment has been graded: ${submission.assignment.title}`,
        `Your submission for "${submission.assignment.title}" has been graded. Score: ${score}/${submission.assignment.maxMarks}`,
        'assignmentGraded',
        { submission, assignment: submission.assignment }
      );
    } catch (emailError) {
      console.error('Error sending grade notification:', emailError);
    }
    
    res.status(200).json(submission);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      message: 'Server error grading submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
