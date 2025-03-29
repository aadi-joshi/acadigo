const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a batch name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a trainer to this batch']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for students
batchSchema.virtual('students', {
  ref: 'User',
  localField: '_id',
  foreignField: 'batch',
  justOne: false
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
