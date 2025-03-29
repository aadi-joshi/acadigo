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

const testLogin = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'password123';
    
    console.log(`Testing login for ${email}`);
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found:', user.name, user.role);
    
    // Test password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('Login would be successful!');
    } else {
      console.log('Password does not match!');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing login:', error);
  }
};

testLogin();
