const User = require('../models/User');
const Batch = require('../models/Batch');

// @desc    Get all users or filtered by role
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    const users = await User.find(filter).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the requesting user is authorized to view this user
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, batch } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Validate batch if role is student
    if (role === 'student' && batch) {
      const batchExists = await Batch.findById(batch);
      if (!batchExists) {
        return res.status(400).json({ message: 'Invalid batch ID' });
      }
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      batch: role === 'student' ? batch : undefined
    });
    
    // If user is student, add to batch
    if (role === 'student' && batch) {
      await Batch.findByIdAndUpdate(batch, {
        $addToSet: { students: user._id }
      });
    }
    
    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or self)
exports.updateUser = async (req, res) => {
  try {
    // Check if user exists
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the requesting user is authorized to update this user
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Non-admin users can only update their name
    if (req.user.role !== 'admin' && req.user._id.toString() === req.params.id) {
      if (Object.keys(req.body).filter(key => key !== 'name').length > 0) {
        return res.status(403).json({ message: 'You can only update your name' });
      }
    }
    
    // Handle batch update for students
    if (req.body.role === 'student' && req.body.batch) {
      const batchExists = await Batch.findById(req.body.batch);
      if (!batchExists) {
        return res.status(400).json({ message: 'Invalid batch ID' });
      }
      
      // If user already has a batch and it's different, remove from old batch
      if (user.batch && user.batch.toString() !== req.body.batch) {
        await Batch.findByIdAndUpdate(user.batch, {
          $pull: { students: user._id }
        });
      }
      
      // Add to new batch
      await Batch.findByIdAndUpdate(req.body.batch, {
        $addToSet: { students: user._id }
      });
    } else if (req.body.role && req.body.role !== 'student' && user.batch) {
      // If user is changing from student to another role, remove from batch
      await Batch.findByIdAndUpdate(user.batch, {
        $pull: { students: user._id }
      });
      req.body.batch = undefined;
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is student, remove from batch
    if (user.role === 'student' && user.batch) {
      await Batch.findByIdAndUpdate(user.batch, {
        $pull: { students: user._id }
      });
    }
    
    await user.remove();
    
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};
