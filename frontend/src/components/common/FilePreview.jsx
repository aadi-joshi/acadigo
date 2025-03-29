import { useState, useEffect } from 'react';
import {
  DocumentIcon,
  ArrowPathIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const FilePreview = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const getFileExtension = (url) => {
    return url.split('.').pop().toLowerCase();
  };
  
  const getPreviewUrl = (url) => {
    const extension = getFileExtension(url);
    
    // For Google Docs Viewer (works for ppt, pdf, doc, etc)
    if (['ppt', 'pptx', 'pdf', 'doc', 'docx'].includes(extension)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    
    // For images
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
      return url;
    }
    
    // For other files, return null (no preview available)
    return null;
  };
  
  const previewUrl = getPreviewUrl(fileUrl);
  const isPpt = ['ppt', 'pptx'].includes(getFileExtension(fileUrl));
  const isPdf = getFileExtension(fileUrl) === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(getFileExtension(fileUrl));
  
  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 bg-opacity-95">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center">
          <DocumentIcon className="h-5 w-5 text-primary-400 mr-2" />
          <h2 className="text-lg font-medium text-white">{fileName || 'File Preview'}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            title="Download"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {previewUrl ? (
          <>
            {isPpt || isPdf ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                onError={() => setError("Failed to load preview")}
              ></iframe>
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt={fileName || "Preview"} 
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => setLoading(false)}
                  onError={() => setError("Failed to load image")}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <DocumentIcon className="h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-300">This file type cannot be previewed</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
                >
                  Download Instead
                </button>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-6 w-6 text-primary-400 animate-spin" />
                  <span className="text-white">Loading preview...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-50">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
                >
                  Download Instead
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <DocumentIcon className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-300">Preview not available for this file type</p>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
            >
              Download Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
