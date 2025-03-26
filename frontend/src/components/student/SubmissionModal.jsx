import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const SubmissionModal = ({ assignment, onSubmit, onClose }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  const handleFiles = (newFiles) => {
    // Add files with support for multi-file
    setFiles([...files, ...newFiles]);
  };
  
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const handleSubmit = () => {
    onSubmit(files);
  };
  
  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              Submit Assignment
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-400">Assignment</div>
            <div className="font-medium">{assignment.title}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-400">Deadline</div>
            <div className="font-medium">{format(new Date(assignment.deadline), 'MMM dd, yyyy h:mm a')}</div>
          </div>
          
          {/* File upload area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              dragActive ? 'border-primary-500 bg-primary-900 bg-opacity-10' : 'border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <ArrowUpTrayIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="mb-1">Drag files here or click to upload</p>
            <p className="text-sm text-gray-400">Support for multiple files</p>
            <input
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </div>
          
          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Files to upload:</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="bg-gray-700 rounded p-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm truncate max-w-[200px]">{file.name}</div>
                        <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
              disabled={files.length === 0}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SubmissionModal;
