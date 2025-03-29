import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;

// BUCKET_NAME should match the same bucket used in backend
export const BUCKET_NAME = 'acadigo';

/**
 * Upload a file to Supabase Storage
 * @param {File} file - File object
 * @param {String} path - Path within the bucket to store the file
 * @returns {Promise<Object>} - Upload result with path and URL
 */
export const uploadFile = async (file, path) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const fullPath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fullPath);
    
    return {
      filePath: fullPath,
      fileUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {String} path - Full path to the file in the bucket
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFile = async (path) => {
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
