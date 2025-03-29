const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { supabase } = require('../utils/supabase');

// Test Supabase connection - Admin only
router.get('/supabase', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if Supabase client is initialized
    if (!supabase || !supabase.storage) {
      return res.status(500).json({ 
        success: false, 
        message: 'Supabase client not properly initialized' 
      });
    }
    
    // Attempt to list buckets to verify connection
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to Supabase',
        error: error.message
      });
    }
    
    // Check if the configured bucket exists
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'acadigo';
    const bucketExists = data.some(bucket => bucket.name === bucketName);
    
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to Supabase',
      buckets: data,
      configuredBucket: bucketName,
      bucketExists: bucketExists
    });
  } catch (error) {
    console.error('Supabase debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing Supabase connection',
      error: error.message
    });
  }
});

module.exports = router;
