const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity
 * @param {Object} data - Activity data
 * @param {Object} data.user - User object or ID
 * @param {String} data.action - Action performed
 * @param {String} data.resourceType - Type of resource
 * @param {String} data.resourceId - ID of the resource
 * @param {Object} data.details - Additional details
 * @param {String} data.ipAddress - IP address
 * @param {String} data.userAgent - User agent
 */
exports.logActivity = async (data) => {
  try {
    const userId = data.user._id || data.user;
    
    const logData = {
      user: userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };
    
    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw the error to prevent disrupting the main flow
  }
};

/**
 * Log middleware for Express
 */
exports.logMiddleware = (action, resourceType) => {
  return async (req, res, next) => {
    // Store the original end function
    const originalEnd = res.end;
    
    // Override the end function
    res.end = function(chunk, encoding) {
      // Call the original end function
      originalEnd.call(this, chunk, encoding);
      
      // Log the activity after response is sent
      if (req.user) {
        exports.logActivity({
          user: req.user._id,
          action,
          resourceType,
          resourceId: req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });
      }
    };
    
    next();
  };
};
