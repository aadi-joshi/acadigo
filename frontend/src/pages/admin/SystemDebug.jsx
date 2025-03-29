import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SystemDebug() {
  const [loading, setLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [testFile, setTestFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const checkSupabaseConnection = async () => {
    try {
      setLoading(true);
      const response = await api.get('/debug/supabase');
      setSupabaseStatus(response.data);
      console.log('Supabase connection info:', response.data);
      toast.success('Supabase connection check completed');
    } catch (error) {
      console.error('Supabase connection check failed:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to check Supabase connection');
      toast.error('Failed to check Supabase connection');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setTestFile(e.target.files[0]);
    }
  };

  const uploadTestFile = async () => {
    try {
      if (!testFile) {
        toast.error('Please select a file first');
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('title', 'Test Document');
      formData.append('description', 'This is a test document for debugging');
      
      // Get the first batch to use for testing
      const batchesResponse = await api.get('/batches');
      if (batchesResponse.data.length === 0) {
        toast.error('No batches found. Create a batch first.');
        setLoading(false);
        return;
      }
      
      formData.append('batch', batchesResponse.data[0]._id);

      // Upload test file as PPT
      const response = await api.post('/ppts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFileUploaded(response.data);
      console.log('File uploaded successfully:', response.data);
      toast.success('Test file uploaded successfully');
    } catch (error) {
      console.error('File upload failed:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to upload test file');
      toast.error('Failed to upload test file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-white mb-6">System Diagnostics</h1>
      
      {errorMessage && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Supabase Storage</h2>
          <button
            onClick={checkSupabaseConnection}
            disabled={loading}
            className="btn-primary mb-4"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Check Supabase Connection'}
          </button>
          
          {supabaseStatus && (
            <div className="mt-4 bg-gray-700 rounded-md p-4">
              <h3 className="text-md font-semibold text-white mb-2">Connection Status:</h3>
              <p className={`text-sm ${supabaseStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                {supabaseStatus.message}
              </p>
              
              {supabaseStatus.buckets && (
                <div className="mt-3">
                  <h3 className="text-md font-semibold text-white mb-1">Available Buckets:</h3>
                  <ul className="text-sm text-gray-300">
                    {supabaseStatus.buckets.map(bucket => (
                      <li key={bucket.id} className="mb-1">
                        {bucket.name} 
                        {bucket.name === supabaseStatus.configuredBucket && 
                          <span className="text-green-400 ml-2">(Configured bucket)</span>
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test File Upload</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Test File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="input w-full"
            />
          </div>
          
          <button
            onClick={uploadTestFile}
            disabled={loading || !testFile}
            className="btn-primary mb-4"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Upload Test File'}
          </button>
          
          {fileUploaded && (
            <div className="mt-4 bg-gray-700 rounded-md p-4">
              <h3 className="text-md font-semibold text-white mb-2">File Uploaded:</h3>
              <p className="text-sm text-gray-300 mb-1">
                <strong>Title:</strong> {fileUploaded.title}
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <strong>URL:</strong> 
                <a 
                  href={fileUploaded.fileUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 ml-1"
                >
                  View File
                </a>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <strong>File Name:</strong> {fileUploaded.fileName}
              </p>
              <p className="text-sm text-gray-300">
                <strong>File Path:</strong> {fileUploaded.filePath}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
