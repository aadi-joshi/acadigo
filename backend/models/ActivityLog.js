const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: ['login', 'ppt_view', 'assignment_view', 'assignment_submit', 'logout'],
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  resourceType: {
    type: String,
    enum: ['ppt', 'assignment', 'submission', null],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
