const mongoose = require('mongoose');

const pptSchema = new mongoose.Schema({
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
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const PPT = mongoose.model('PPT', pptSchema);
module.exports = PPT;
