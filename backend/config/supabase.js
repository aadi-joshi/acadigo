const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not provided. File storage will not work.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default bucket name to store files
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'acadigo';

// Upload file to Supabase Storage
const uploadFile = async (file, destination, user = null) => {
  try {
    // Prepare destination path and get filename
    const filename = path.basename(destination);
    let folderPath = path.dirname(destination);
    
    // Enforce folder structure based on user role
    if (user) {
      if (user.role === 'student') {
        // Student uploads should always go to submissions folder
        folderPath = folderPath.startsWith('submissions') ? folderPath : `submissions/${folderPath}`;
      }
    }
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${folderPath}/${filename}`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading file to Supabase:', error);
      throw new Error('Failed to upload file');
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${folderPath}/${filename}`);

    // Create file metadata
    return {
      fileName: file.originalname,
      fileUrl: publicUrlData.publicUrl,
      filePath: `${folderPath}/${filename}`,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from Supabase Storage
const deleteFile = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from Supabase:', error);
      throw new Error('Failed to delete file');
    }

    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw new Error('Failed to delete file');
  }
};

// Get a file preview URL (for documents, PDFs, etc.)
const getPreviewUrl = (fileUrl) => {
  // For common document formats, you might want to use a viewer service
  const ext = path.extname(fileUrl).toLowerCase();
  
  if (['.pdf', '.ppt', '.pptx', '.doc', '.docx'].includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }
  
  return null;
};

module.exports = {
  supabase,
  uploadFile,
  deleteFile,
  getPreviewUrl
};
