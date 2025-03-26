const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  allowResubmission: {
    type: Boolean,
    default: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  previewUrl: {
    type: String,
  },
  maxScore: {
    type: Number,
    default: 100,
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
