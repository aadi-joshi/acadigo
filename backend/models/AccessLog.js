const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: {
      type: String,
      enum: ['ppt', 'assignment'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'resource.type'
    }
  },
  action: {
    type: String,
    enum: ['view', 'download', 'submit', 'grade'],
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
}, {
  timestamps: true
});

const AccessLog = mongoose.model('AccessLog', accessLogSchema);

module.exports = AccessLog;
