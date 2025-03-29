const ActivityLog = require('../models/ActivityLog');

// @desc    Log user activity
// @access  Private
exports.logActivity = (activityType) => async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create activity log
    await ActivityLog.create({
      user: req.user._id,
      type: activityType,
      metadata: {
        itemId: id,
        // Additional data can be added from request body if needed
        ...req.body
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error logging ${activityType}:`, error);
    // Still return success to client even if logging fails
    // This is to prevent disrupting the user experience
    res.status(200).json({ success: true });
  }
};
