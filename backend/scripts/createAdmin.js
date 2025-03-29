require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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

const createAdmin = async () => {
  try {
    // Admin details
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // This will be hashed by the User model pre-save hook
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Creating a new one with a different email.');
      adminData.email = 'admin2@example.com';
    }

    // Create new admin user
    const admin = await User.create(adminData);
    
    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password: password123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdmin();
