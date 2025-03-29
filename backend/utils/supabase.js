const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main storage bucket name
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'acadigo';

/**
 * Upload a file to Supabase Storage
 * @param {Object} file - File object with buffer and originalname
 * @param {String} path - Path within the bucket to store the file
 * @param {Object} user - User object with role information
 * @returns {Object} - Upload result with path and URL
 */
exports.uploadFile = async (file, path, user) => {
  try {
    // Ensure the path is appropriate based on user role
    let finalPath = path;
    if (user && user.role === 'student') {
      // Ensure student uploads go to submissions folder
      if (!finalPath.startsWith('submissions/')) {
        finalPath = `submissions/${finalPath}`;
      }
    }
    
    // Create the full path
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;
    const fullPath = `${finalPath}/${fileName}`;
    
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fullPath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fullPath);
    
    return {
      fileName: file.originalname,
      filePath: fullPath,
      fileUrl: urlData.publicUrl,
      fileSize: file.size
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {String} path - Full path to the file in the bucket
 * @returns {Object} - Deletion result
 */
exports.deleteFile = async (path) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error(`Error deleting file: ${error.message}`);
  }
};
