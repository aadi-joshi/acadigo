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

// Admin details
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123', // Will be hashed by the User model's pre-save hook
  role: 'admin',
  active: true
};

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists.');
      console.log(`Email: ${existingAdmin.email}`);
      console.log('You can use "password123" to login or reset the password if needed.');
      mongoose.connection.close();
      return;
    }
    
    // Create new admin user
    const admin = await User.create(adminData);
    
    console.log('Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log('Password: password123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
};

createAdmin();
