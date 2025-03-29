const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'trainer', 'student'],
    default: 'student'
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: function() {
      return this.role === 'student';
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Need to select password explicitly since we have select: false above
    const user = this;
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
