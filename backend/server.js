// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { authLimiter } = require('./middleware/rateLimitMiddleware');

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const batchRoutes = require('./routes/batchRoutes');
const pptRoutes = require('./routes/pptRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logRoutes = require('./routes/logRoutes');
const debugRoutes = require('./routes/debugRoutes'); // Import debug routes

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting middleware
// Use a more permissive rate limit for authentication-related routes
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Add this debug endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    res.json({ 
      dbConnected: mongoose.connection.readyState === 1,
      collections: collectionNames
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/ppts', pptRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/debug', debugRoutes); // Add this line to mount debug routes

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
