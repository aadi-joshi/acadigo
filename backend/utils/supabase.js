const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check for required environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'acadigo';

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('ERROR: SUPABASE_URL environment variable is not set');
  console.error('Please set this variable in your .env file');
  console.error('Example: SUPABASE_URL=https://your-project-id.supabase.co');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.error('Please set this variable in your .env file');
  console.error('Example: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
}

// Initialize Supabase client with safer initialization
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message);
  // Create a mock client for development if Supabase is not configured
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using mock Supabase client for development...');
    supabase = {
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: 'mock-path' }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com/file.pdf' } }),
          remove: async () => ({ error: null })
        })
      }
    };
  }
}

/**
 * Upload file to Supabase Storage
 * @param {Object} file - Express multer file object
 * @param {String} path - Path to store file in bucket (e.g. 'ppts/filename.pdf')
 * @param {Object} user - User object from request
 * @returns {Object} File data including URL, path, name, and size
 */
const uploadFile = async (file, path, user) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase not configured properly. Using mock file data.');
      return {
        fileUrl: `https://mock-file-url.com/${path}`,
        filePath: path,
        fileName: file.originalname,
        fileSize: file.size
      };
    }

    // Generate unique file path
    const filePath = `${path.split('/')[0]}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return {
      fileUrl: urlData.publicUrl,
      filePath: filePath,
      fileName: file.originalname,
      fileSize: file.size
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 * @param {String} filePath - Path of file in bucket
 * @returns {Boolean} Success status
 */
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return true;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase not configured properly. Skipping file deletion.');
      return true;
    }
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
