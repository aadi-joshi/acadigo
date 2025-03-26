const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['ppt', 'assignment'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceType'
  },
  action: {
    type: String,
    enum: ['view', 'download', 'submit'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Index for faster queries by user
accessLogSchema.index({ user: 1, timestamp: -1 });
// Index for faster queries by resource 
accessLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
module.exports = AccessLog;
