require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    const email = 'admin@example.com';
    const newPassword = 'password123';
    
    console.log(`Resetting password for ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password directly in the database, bypassing any middleware
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password reset successfully!');
    
    // Verify the reset worked
    const updatedUser = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification:', isMatch);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting password:', error);
  }
};

resetAdminPassword();
