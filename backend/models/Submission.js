const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
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
});

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  files: [fileSchema],
  submissionTime: {
    type: Date,
    default: Date.now,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'resubmitted'],
    default: 'submitted',
  }
}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
