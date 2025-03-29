import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AuthContext from '../../context/AuthContext';

const PPTForm = ({ ppt, batches, onSubmit, onClose, isOpen }) => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: ppt?.title || '',
      description: ppt?.description || '',
      batch: ppt?.batch?._id || ppt?.batch || '',
    },
  });
  
  useEffect(() => {
    if (ppt) {
      console.log('Editing PPT:', ppt);
      reset({
        title: ppt.title,
        description: ppt.description,
        batch: ppt.batch._id || ppt.batch,
      });
    } else {
      console.log('Creating new PPT');
      reset({
        title: '',
        description: '',
        batch: batches.length > 0 ? batches[0]._id : '',
      });
    }
  }, [ppt, reset, batches]);
  
  const handleFileChange = (e) => {
    setFileError(null);
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Only PPT, PPTX, PDF, DOC, and DOCX files are allowed.');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size exceeds 10MB limit.');
        return;
      }
      
      console.log('File selected:', file.name);
      setSelectedFile(file);
    }
  };
  
  const onFormSubmit = (data) => {
    try {
      // Validate file selection for new PPTs
      if (!ppt && !selectedFile) {
        setFileError('Please select a file to upload.');
        return;
      }
      
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('batch', data.batch);
      
      // Only append file if a new one was selected or if creating a new PPT
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      console.log('Submitting form with batch:', data.batch);
      onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {ppt ? 'Edit PPT' : 'Upload PPT'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="mb-4">
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="input w-full"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                className="input w-full"
                rows="3"
                {...register('description')}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="batch" className="label">
                Batch
              </label>
              <select
                id="batch"
                className="select w-full"
                {...register('batch', { required: 'Batch is required' })}
              >
                <option value="">Select a batch</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
              {errors.batch && (
                <p className="mt-1 text-sm text-red-500">{errors.batch.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="file" className="label">
                PPT File {ppt && <span className="text-gray-400 text-xs">(Leave empty to keep current file)</span>}
              </label>
              <input
                id="file"
                type="file"
                className="input w-full"
                accept=".ppt,.pptx,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="mt-1 text-sm text-red-500">{fileError}</p>
              )}
              {ppt && (
                <p className="text-sm text-gray-400 mt-1">
                  Current file: {ppt.fileName}
                </p>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {ppt ? 'Update' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default PPTForm;
