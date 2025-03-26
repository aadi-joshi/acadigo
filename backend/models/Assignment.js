const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  filePath: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true
  },
  allowResubmission: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
