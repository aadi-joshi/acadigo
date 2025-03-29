const Batch = require('../models/Batch');
const User = require('../models/User');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private (admin, trainer)
exports.getBatches = async (req, res) => {
  try {
    let query;
    
    // If admin, get all batches
    if (req.user.role === 'admin') {
      query = Batch.find();
    } 
    // If trainer, only get batches they are assigned to
    else if (req.user.role === 'trainer') {
      query = Batch.find({ trainer: req.user._id });
    }
    
    // Add population and sorting
    query = query.populate({
      path: 'trainer',
      select: 'name email'
    }).sort({ createdAt: -1 });
    
    const batches = await query;
    
    // Get student counts for each batch
    const batchesWithStats = await Promise.all(batches.map(async (batch) => {
      const studentCount = await User.countDocuments({ batch: batch._id, role: 'student' });
      return {
        ...batch.toObject(),
        studentCount
      };
    }));
    
    res.status(200).json(batchesWithStats);
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      message: 'Server error retrieving batches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private (admin, trainer of this batch, student in this batch)
exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate({
      path: 'trainer',
      select: 'name email'
    });
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user is authorized to view this batch
    if (req.user.role === 'trainer' && !batch.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this batch' });
    }
    
    if (req.user.role === 'student' && (!req.user.batch || !req.user.batch.equals(batch._id))) {
      return res.status(403).json({ message: 'Not authorized to view this batch' });
    }
    
    // Get student count
    const studentCount = await User.countDocuments({ batch: batch._id, role: 'student' });
    
    // Include student count in response
    const batchWithStats = {
      ...batch.toObject(),
      studentCount
    };
    
    res.status(200).json(batchWithStats);
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      message: 'Server error retrieving batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create batch
// @route   POST /api/batches
// @access  Private (admin)
exports.createBatch = async (req, res) => {
  try {
    const { name, description, trainer, startDate, endDate, active } = req.body;

    // Validate required fields
    if (!name || !trainer || !startDate) {
      return res.status(400).json({ message: 'Please provide name, trainer, and start date' });
    }

    // Check if trainer exists and is a trainer
    const trainerUser = await User.findById(trainer);
    if (!trainerUser || trainerUser.role !== 'trainer') {
      return res.status(400).json({ message: 'Invalid trainer selected' });
    }

    // Create batch
    const batch = await Batch.create({
      name,
      description,
      trainer,
      startDate,
      endDate,
      active: active !== undefined ? active : true
    });

    res.status(201).json(batch);
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ message: 'Server error creating batch' });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (admin, trainer of this batch)
exports.updateBatch = async (req, res) => {
  try {
    let batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user is authorized to update this batch
    if (req.user.role === 'trainer' && !batch.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this batch' });
    }
    
    const { name, description, trainer, startDate, endDate, active } = req.body;
    
    // If changing trainer, check if new trainer exists and is a trainer
    if (trainer && trainer !== batch.trainer.toString()) {
      // Only admin can change trainer
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can change batch trainer' });
      }
      
      const trainerUser = await User.findById(trainer);
      
      if (!trainerUser) {
        return res.status(404).json({ message: 'Trainer not found' });
      }
      
      if (trainerUser.role !== 'trainer') {
        return res.status(400).json({ message: 'Selected user is not a trainer' });
      }
    }
    
    // Update batch
    batch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        trainer,
        startDate,
        endDate,
        active
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(batch);
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      message: 'Server error updating batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (admin)
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if any students are assigned to this batch
    const studentCount = await User.countDocuments({ batch: batch._id, role: 'student' });
    
    if (studentCount > 0) {
      return res.status(400).json({ message: 'Cannot delete batch with assigned students' });
    }
    
    await batch.remove();
    
    res.status(200).json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      message: 'Server error deleting batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get students in batch
// @route   GET /api/batches/:id/students
// @access  Private (admin, trainer of this batch)
exports.getBatchStudents = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user is authorized to view this batch's students
    if (req.user.role === 'trainer' && !batch.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view students in this batch' });
    }
    
    const students = await User.find({ batch: batch._id, role: 'student' }).select('-password');
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Get batch students error:', error);
    res.status(500).json({
      message: 'Server error retrieving batch students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add student to batch
// @route   POST /api/batches/:id/students
// @access  Private (admin, trainer of this batch)
exports.addStudentToBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user is authorized to add students to this batch
    if (req.user.role === 'trainer' && !batch.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add students to this batch' });
    }
    
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Please provide a student ID' });
    }
    
    // Check if student exists and is a student
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Selected user is not a student' });
    }
    
    // Update student's batch
    student.batch = batch._id;
    await student.save();
    
    res.status(200).json({ success: true, message: 'Student added to batch' });
  } catch (error) {
    console.error('Add student to batch error:', error);
    res.status(500).json({
      message: 'Server error adding student to batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove student from batch
// @route   DELETE /api/batches/:id/students/:studentId
// @access  Private (admin, trainer of this batch)
exports.removeStudentFromBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user is authorized to remove students from this batch
    if (req.user.role === 'trainer' && !batch.trainer.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to remove students from this batch' });
    }
    
    const { studentId } = req.params;
    
    // Check if student exists, is a student, and is in this batch
    const student = await User.findOne({ _id: studentId, role: 'student', batch: batch._id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found in this batch' });
    }
    
    // Remove student from batch
    student.batch = undefined;
    await student.save();
    
    res.status(200).json({ success: true, message: 'Student removed from batch' });
  } catch (error) {
    console.error('Remove student from batch error:', error);
    res.status(500).json({
      message: 'Server error removing student from batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
