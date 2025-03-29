const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'acadigo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file to Supabase Storage
exports.uploadFile = async (file, folder = '', user = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // If it's a student submission, ensure it goes to submissions folder
    if (user && user.role === 'student' && folder !== 'submissions') {
      folder = 'submissions';
    }
    
    // Create filename with timestamp to ensure uniqueness
    const filename = `${folder}/${Date.now()}-${file.originalname}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      throw new Error('Failed to upload file to storage');
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    const fileUrl = publicUrlData.publicUrl;
    
    // Create preview URL for documents if necessary
    let previewUrl = null;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (['.pdf', '.ppt', '.pptx', '.doc', '.docx'].includes(ext)) {
      previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }

    return {
      fileUrl,
      fileName: file.originalname, 
      filePath: filename,
      fileSize: file.size,
      previewUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from Supabase Storage
exports.deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract filename from the URL - adjust this based on your Supabase URL format
    const urlParts = fileUrl.split(bucketName + '/');
    if (urlParts.length < 2) return;
    
    const filename = urlParts[1];
    
    // Delete the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filename]);
    
    if (error) {
      console.error('Error deleting file from Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    return false;
  }
};
