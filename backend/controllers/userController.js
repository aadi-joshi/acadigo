const User = require('../models/User');
const Batch = require('../models/Batch');
const { uploadFile, deleteFile } = require('../config/firebase');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
exports.getUsers = async (req, res) => {
  try {
    let query;

    // For admin, return all users
    if (req.user.role === 'admin') {
      query = User.find();
    } 
    // For trainers, return only students in their batches
    else if (req.user.role === 'trainer') {
      // Get batches assigned to this trainer
      const batches = await Batch.find({ trainer: req.user._id }).select('_id');
      const batchIds = batches.map(batch => batch._id);
      
      query = User.find({ 
        $or: [
          { role: 'student', batch: { $in: batchIds } },
          { _id: req.user._id } // Include themselves
        ]
      });
    } else {
      return res.status(403).json({ message: 'Not authorized to view all users' });
    }

    // Add filtering
    if (req.query.role) {
      query = query.find({ role: req.query.role });
    }

    if (req.query.batch) {
      query = query.find({ batch: req.query.batch });
    }

    // Add population
    if (req.query.populate === 'batch') {
      query = query.populate('batch', 'name');
    }

    // Execute query
    const users = await query;

    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin, trainer if student is in their batch, or self)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('batch', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is authorized to view this user
    if (req.user.role !== 'admin') {
      // Allow trainers to view students in their batch
      if (req.user.role === 'trainer' && user.role === 'student') {
        const batch = await Batch.findById(user.batch);
        if (!batch || !batch.trainer.equals(req.user._id)) {
          return res.status(403).json({ message: 'Not authorized to view this user' });
        }
      } 
      // Allow users to view themselves
      else if (!user._id.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view this user' });
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error retrieving user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, batch, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }

    // Validate batch for students
    if (role === 'student' && !batch) {
      return res.status(400).json({ message: 'Students must be assigned to a batch' });
    }

    // Create user with specified role
    const userData = {
      name,
      email,
      password,
      role,
      phone
    };

    if (role === 'student') {
      userData.batch = batch;
    }

    // Upload profile image if provided
    if (req.file) {
      const fileName = `profiles/${Date.now()}-${req.file.originalname}`;
      const fileData = await uploadFile(req.file, fileName);
      userData.profileImage = fileData.fileUrl;
    }

    const user = await User.create(userData);

    // Remove password from response
    user.password = undefined;

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to PPT Access Control System',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Welcome to PPT Access Control System</h2>
            <p>Hello ${user.name},</p>
            <p>Your account has been created successfully with the role of <strong>${user.role}</strong>.</p>
            <p>You can now log in using your email and the password provided by the administrator.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Login to Your Account</a>
            <p style="margin-top: 20px;">If you have any questions, please contact the administrator.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Server error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin, or self)
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is authorized to update this user
    if (req.user.role !== 'admin' && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, email, role, batch, phone, password } = req.body;
    
    // Prevent users from changing their own role
    if (user._id.equals(req.user._id) && role && role !== user.role) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }

    // Update basic fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (phone) updatedData.phone = phone;
    
    // Only admin can change roles
    if (req.user.role === 'admin' && role) {
      updatedData.role = role;
      
      // If changing to student, batch is required
      if (role === 'student' && !batch && !user.batch) {
        return res.status(400).json({ message: 'Students must be assigned to a batch' });
      }
      
      // If changing from student, remove batch
      if (role !== 'student' && user.role === 'student') {
        updatedData.batch = null;
      }
    }
    
    // Only admin can change batch
    if (req.user.role === 'admin' && batch) {
      // Verify batch exists
      const batchExists = await Batch.findById(batch);
      if (!batchExists) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      updatedData.batch = batch;
    }
    
    // Update password if provided (with additional security check)
    if (password && (req.user.role === 'admin' || await user.matchPassword(req.body.currentPassword))) {
      // User will need to be saved to trigger the password hashing middleware
      user.password = password;
      await user.save();
    }
    
    // Upload profile image if provided
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        try {
          const oldFilePath = user.profileImage.split('/').slice(-1)[0];
          await deleteFile(`profiles/${oldFilePath}`);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
          // Continue even if deletion fails
        }
      }
      
      const fileName = `profiles/${Date.now()}-${req.file.originalname}`;
      const fileData = await uploadFile(req.file, fileName);
      updatedData.profileImage = fileData.fileUrl;
    }
    
    // Apply updates (excluding password which was handled separately)
    user = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete profile image if exists
    if (user.profileImage) {
      try {
        const filePath = user.profileImage.split('/').slice(-1)[0];
        await deleteFile(`profiles/${filePath}`);
      } catch (error) {
        console.error('Error deleting profile image:', error);
        // Continue even if deletion fails
      }
    }

    await user.remove();

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('batch', 'name');
    res.status(200).json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      message: 'Server error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'No user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Reset Your Password</h2>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 10 minutes.</p>
          </div>
        `
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error('Error sending password reset email:', err);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Server error processing password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Send confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Successful',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Password Reset Successful</h2>
            <p>Your password has been successfully reset.</p>
            <p>You can now log in with your new password.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Log In</a>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending password reset confirmation:', emailError);
      // Continue even if email fails
    }

    // Return token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Server error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password (when logged in)
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
