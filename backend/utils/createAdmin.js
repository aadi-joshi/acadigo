require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Admin credentials - change these
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'securepassword123', // Will be hashed
  role: 'admin'
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create new admin user
    const user = new User({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password, // Will be hashed by User model pre-save hook
      role: adminData.role,
      active: true
    });
    
    await user.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
