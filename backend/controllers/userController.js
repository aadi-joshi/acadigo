const User = require('../models/User');
const Batch = require('../models/Batch');
const { uploadFile, deleteFile } = require('../utils/supabase');
const multer = require('multer');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
exports.getUsers = async (req, res) => {
  try {
    let query = {};
    
    // Filter by role if specified
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter unassigned students if requested
    if (req.query.unassigned === 'true' && req.query.role === 'student') {
      // Students with no batch or students not in the specified excludeBatch
      const orConditions = [{ batch: { $exists: false } }, { batch: null }];
      
      if (req.query.excludeBatch) {
        orConditions.push({ batch: { $ne: req.query.excludeBatch } });
      }
      
      query.$or = orConditions;
    }
    
    const users = await User.find(query).populate('batch', 'name');
    
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
// @access  Private (admin, trainer for students in their batch)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('batch', 'name trainer');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trainer is trying to access student from another batch
    if (req.user.role === 'trainer' && user.role === 'student') {
      // If batch exists and the trainer is not the owner
      if (user.batch && !user.batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to access this student' });
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
// @access  Private (admin)
exports.createUser = async (req, res) => {
  try {
    // Check if user is authorized to create
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }

    const { name, email, password, role, batch } = req.body;

    // Check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Prevent creating admin users regardless of the role value sent
    const userRole = role === 'admin' ? 'trainer' : role;
    
    // Check if student role has a batch
    if (userRole === 'student' && !batch) {
      return res.status(400).json({ message: 'Students must be assigned to a batch' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      batch: userRole === 'student' ? batch : undefined
    });
    
    // Send success response - don't include password
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        batch: user.batch
      }
    });
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
// @access  Private (admin, or self for limited fields)
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating themselves or is admin
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // If not admin, restrict what can be updated
    if (!isAdmin) {
      const { name, password } = req.body;
      const updateFields = {};
      
      if (name) updateFields.name = name;
      if (password) updateFields.password = password;
      
      user = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
    } else {
      // Admin can update all fields except changing role to admin
      const { name, email, role, batch, active } = req.body;
      
      // Prevent changing role to admin (unless user is already admin)
      const userRole = role === 'admin' ? (user.role === 'admin' ? 'admin' : 'trainer') : role;
      
      // Check if student role has a batch
      if (userRole === 'student' && !batch) {
        return res.status(400).json({ message: 'Students must be assigned to a batch' });
      }

      // If changing batch, check if it exists
      if (userRole === 'student' && batch) {
        const batchExists = await Batch.findById(batch);
        if (!batchExists) {
          return res.status(400).json({ message: 'Batch not found' });
        }
      }

      user = await User.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email,
          role: userRole,
          batch: userRole === 'student' ? batch : undefined,
          active
        },
        { new: true, runValidators: true }
      );
    }
    
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
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

// @desc    Update user profile (self)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, parentName, contactNumber, parentContactNumber } = req.body;
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (parentName) updateFields.parentName = parentName;
    if (contactNumber) updateFields.contactNumber = contactNumber;
    if (parentContactNumber) updateFields.parentContactNumber = parentContactNumber;
    
    // If updating password, verify current password
    if (currentPassword && newPassword) {
      const user = await User.findById(req.user._id).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if current password matches
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      updateFields.password = newPassword;
    }
    
    // Handle file uploads if they exist
    if (req.files) {
      const user = await User.findById(req.user._id);
      
      // Handle profile photo
      if (req.files.photo) {
        // Delete old photo if exists
        if (user.photo && user.photo.filePath) {
          await deleteFile(user.photo.filePath);
        }
        
        const photoFile = req.files.photo[0];
        const photoData = await uploadFile(
          photoFile,
          `users/${req.user._id}/photos/${Date.now()}-${photoFile.originalname}`,
          req.user
        );
        
        updateFields.photo = {
          fileName: photoData.fileName,
          fileUrl: photoData.fileUrl,
          filePath: photoData.filePath,
          fileSize: photoData.fileSize,
          uploadedAt: new Date()
        };
      }
      
      // Handle resume upload
      if (req.files.resume) {
        // Delete old resume if exists
        if (user.resume && user.resume.filePath) {
          await deleteFile(user.resume.filePath);
        }
        
        const resumeFile = req.files.resume[0];
        const resumeData = await uploadFile(
          resumeFile,
          `users/${req.user._id}/resumes/${Date.now()}-${resumeFile.originalname}`,
          req.user
        );
        
        updateFields.resume = {
          fileName: resumeData.fileName,
          fileUrl: resumeData.fileUrl,
          filePath: resumeData.filePath,
          fileSize: resumeData.fileSize,
          uploadedAt: new Date()
        };
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get users for a specific batch
// @route   GET /api/users/batch/:batchId
// @access  Private (admin, trainer)
exports.getUsersByBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    
    // If trainer, verify they are assigned to this batch
    if (req.user.role === 'trainer') {
      const batch = await Batch.findById(batchId);
      
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      if (!batch.trainer.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to access this batch' });
      }
    }
    
    const users = await User.find({ batch: batchId, role: 'student' });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users by batch error:', error);
    res.status(500).json({
      message: 'Server error retrieving users by batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
