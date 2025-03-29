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

const resetAdminPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('Admin user not found! Please run the createAdmin.js script first.');
      mongoose.connection.close();
      return;
    }
    
    // Update admin's password directly through save method to ensure hash is correct
    admin.password = 'password123';
    await admin.save();
    
    console.log('Admin password reset successfully!');
    console.log(`Email: ${admin.email}`);
    console.log('Password: password123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting admin password:', error);
    mongoose.connection.close();
  }
};

resetAdminPassword();
