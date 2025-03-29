import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const SubmissionModal = ({ assignment, onSubmit, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to submit.');
      return;
    }
    
    onSubmit(selectedFiles, comments);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-lg w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-white">
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
            <h3 className="font-medium text-white mb-1">{assignment.title}</h3>
            <p className="text-sm text-gray-400">
              Due: {format(new Date(assignment.deadline), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div 
              className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? 'border-primary-400 bg-primary-900 bg-opacity-10' : 'border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="h-10 w-10 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400 mb-2">Drag and drop your files here, or</p>
              <label className="inline-block px-4 py-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors text-white">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Files:</h4>
                <ul className="bg-gray-700 rounded-md overflow-hidden divide-y divide-gray-600">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-primary-400 mr-2" />
                        <div>
                          <p className="text-sm text-white font-medium">{file.name}</p>
                          <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-2">
                Comments (Optional)
              </label>
              <textarea
                id="comments"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="Add any comments for your submission..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 rounded-md text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Submit Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default SubmissionModal;
