const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
if (!admin.apps.length) {
  // This uses the service account credentials from environment variables
  // In production, these would be set in the server's environment
  // For development, they can be loaded from a .env file
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Parse the JSON string from the environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Load from a file path
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      console.error('Firebase credentials not provided. File storage will not work.');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

const bucket = admin.storage().bucket();

// Upload file to Firebase Storage
const uploadFile = async (file, destination) => {
  try {
    const fileUpload = bucket.file(destination);

    // Upload file to Firebase Storage
    await fileUpload.save(file.buffer, {
      contentType: file.mimetype,
      metadata: {
        metadata: {
          originalname: file.originalname
        }
      }
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get public URL
    const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

    return {
      fileName: file.originalname,
      fileUrl: url,
      filePath: destination,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from Firebase Storage
const deleteFile = async (filePath) => {
  try {
    await bucket.file(filePath).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    throw new Error('Failed to delete file');
  }
};

module.exports = {
  bucket,
  uploadFile,
  deleteFile
};
