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
  console.error('Failed to initialize Supabase client:', error);
  // Create a dummy client that will throw errors when used
  supabase = {
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase client not initialized')),
        remove: () => Promise.reject(new Error('Supabase client not initialized')),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
}

// Upload a file to Supabase Storage
const uploadFile = async (file, path, user = null) => {
  try {
    console.log(`Uploading file to Supabase: ${path}`);
    
    // Get the file buffer and content type
    const fileBuffer = file.buffer;
    const contentType = file.mimetype;
    
    // Upload to Supabase
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    console.log('File uploaded successfully. URL:', urlData.publicUrl);
    
    // Return file data
    return {
      fileUrl: urlData.publicUrl,
      filePath: path,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: user ? user._id : null
    };
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete a file from Supabase Storage
const deleteFile = async (filePath) => {
  try {
    console.log(`Deleting file from Supabase: ${filePath}`);
    
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    
    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw new Error('Failed to delete file');
  }
};

module.exports = {
  supabase,
  uploadFile,
  deleteFile
};
