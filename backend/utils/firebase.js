const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : null;

  admin.initializeApp({
    credential: serviceAccount 
      ? admin.credential.cert(serviceAccount) 
      : admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

// Upload file to Firebase Storage
exports.uploadFile = async (file, folder = '') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const filename = `${folder}/${Date.now()}-${file.originalname}`;
  const fileBuffer = file.buffer;

  // Create a file object in the bucket
  const fileRef = bucket.file(filename);
  
  // Upload the file with proper content type
  await fileRef.save(fileBuffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  // Make file publicly accessible
  await fileRef.makePublic();

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  
  // Create preview URL (using Google Docs Viewer or PDF.js for common formats)
  let previewUrl = null;
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (['.pdf', '.ppt', '.pptx', '.doc', '.docx'].includes(ext)) {
    previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;
  }

  return {
    fileUrl: publicUrl,
    fileName: file.originalname,
    previewUrl
  };
};

// Delete file from Firebase Storage
exports.deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract filename from the URL
    const filename = fileUrl.split(`${bucket.name}/`)[1];
    
    if (!filename) return;
    
    // Delete the file
    await bucket.file(filename).delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    return false;
  }
};
