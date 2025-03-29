const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['login', 'logout', 'ppt_view', 'ppt_download', 'assignment_view', 'assignment_download', 'assignment_submit'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
