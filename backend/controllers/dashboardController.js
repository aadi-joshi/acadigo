const User = require('../models/User');
const Batch = require('../models/Batch');
const PPT = require('../models/PPT');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Base data structure
    const dashboardData = {
      stats: {},
      ppts: [],
      assignments: [],
      batches: [],
      submissions: [],
      recentUsers: []
    };

    // Common dashboard data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Role-specific dashboard data
    switch (userRole) {
      case 'admin':
        // Admin dashboard data
        const totalUsers = await User.countDocuments();
        const trainers = await User.countDocuments({ role: 'trainer' });
        const students = await User.countDocuments({ role: 'student' });
        const totalBatches = await Batch.countDocuments();
        const activeBatches = await Batch.countDocuments({ active: true });
        const totalPPTs = await PPT.countDocuments();
        const totalAssignments = await Assignment.countDocuments();
        
        // Recent user activity
        const recentUsers = await User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name email role')
          .populate('batch', 'name');
        
        // Activity stats for today
        const todayPPTViews = await ActivityLog.countDocuments({ 
          type: 'ppt_view', 
          createdAt: { $gte: today } 
        });
        
        const todaySubmissions = await Submission.countDocuments({ 
          submittedAt: { $gte: today } 
        });
        
        const todayAPIRequests = await ActivityLog.countDocuments({
          createdAt: { $gte: today }
        });
        
        dashboardData.stats = {
          totalUsers,
          trainers,
          students,
          totalBatches,
          activeBatches,
          totalPPTs,
          totalAssignments,
          todayPPTViews,
          maxDailyViews: 50, // Example value - could be dynamic
          todaySubmissions,
          maxDailySubmissions: 15, // Example value - could be dynamic
          todayAPIRequests,
          maxDailyAPIRequests: 500 // Example value - could be dynamic
        };
        
        dashboardData.recentUsers = recentUsers;
        break;
        
      case 'trainer':
        // Trainer dashboard data
        const trainerBatches = await Batch.find({ trainer: userId })
          .populate('trainer', 'name email')
          .sort({ createdAt: -1 });
        
        // Get IDs of batches this trainer manages
        const batchIds = trainerBatches.map(batch => batch._id);
        
        // Count students in trainer's batches
        const totalTrainerStudents = await User.countDocuments({ 
          batch: { $in: batchIds },
          role: 'student'
        });
        
        // Get PPTs uploaded by this trainer
        const trainerPPTs = await PPT.countDocuments({ 
          uploadedBy: userId 
        });
        
        // Get assignments created by this trainer
        const trainerAssignments = await Assignment.countDocuments({
          uploadedBy: userId
        });
        
        // Get pending submissions that need grading
        const pendingSubmissions = await Submission.find({
          assignment: { 
            $in: await Assignment.find({ 
              batch: { $in: batchIds } 
            }).select('_id')
          },
          status: { $ne: 'graded' }
        })
        .populate('assignment', 'title')
        .populate('student', 'name')
        .sort({ submittedAt: -1 })
        .limit(5);
        
        dashboardData.stats = {
          totalStudents: totalTrainerStudents,
          batchCount: trainerBatches.length,
          pptCount: trainerPPTs,
          assignmentCount: trainerAssignments,
          pendingSubmissions: pendingSubmissions.length
        };
        
        dashboardData.batches = trainerBatches;
        dashboardData.pendingSubmissions = pendingSubmissions;
        break;
        
      case 'student':
        // Student dashboard data
        const student = await User.findById(userId).populate('batch');
        
        if (!student.batch) {
          return res.status(400).json({ message: 'Student not assigned to any batch' });
        }
        
        // Get PPTs for student's batch
        const studentPPTs = await PPT.find({ batch: student.batch._id })
          .sort({ createdAt: -1 })
          .limit(3);
        
        // Get assignments for student's batch
        const studentAssignments = await Assignment.find({ batch: student.batch._id })
          .sort({ deadline: 1 });
        
        // Get student's submissions
        const studentSubmissions = await Submission.find({ student: userId })
          .populate('assignment', 'title maxMarks')
          .sort({ submittedAt: -1 });
        
        // Calculate statistics
        const pendingAssignments = studentAssignments.filter(assignment => {
          return !studentSubmissions.some(sub => 
            sub.assignment._id.toString() === assignment._id.toString()
          );
        }).length;
        
        const completedAssignments = studentSubmissions.length;
        
        // Add trainer name to batch info
        const batchWithTrainer = student.batch.toObject();
        if (student.batch.trainer) {
          const trainer = await User.findById(student.batch.trainer).select('name');
          batchWithTrainer.trainerName = trainer ? trainer.name : 'Unassigned';
        }
        
        dashboardData.stats = {
          batch: batchWithTrainer,
          availablePPTs: studentPPTs.length,
          pendingAssignments,
          completedAssignments
        };
        
        dashboardData.ppts = studentPPTs;
        dashboardData.assignments = studentAssignments;
        dashboardData.submissions = studentSubmissions;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }
    
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
