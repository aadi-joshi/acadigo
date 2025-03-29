import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const PPTForm = ({ ppt, batches, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: ppt?.title || '',
      description: ppt?.description || '',
      batch: ppt?.batch || '',
      isPublic: ppt?.isPublic ?? false,
    },
  });
  
  useEffect(() => {
    if (ppt) {
      reset({
        title: ppt.title,
        description: ppt.description,
        batch: ppt.batch,
        isPublic: ppt.isPublic,
      });
    }
  }, [ppt, reset]);
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const onFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('batch', data.batch);
    formData.append('isPublic', data.isPublic);
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    
    onSubmit(formData);
  };
  
  return (
    <Dialog open={true} onClose={onCancel} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {ppt ? 'Edit PPT' : 'Upload PPT'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onCancel}
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
                Description
              </label>
              <textarea
                id="description"
                className="input w-full h-24"
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
                {batches.map((batch) => (
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
                PPT File {ppt && '(Leave empty to keep current file)'}
              </label>
              <input
                id="file"
                type="file"
                className="input w-full"
                onChange={handleFileChange}
                accept=".ppt,.pptx,.pdf"
                {...(!ppt && register('file', { required: 'File is required' }))}
              />
              {errors.file && (
                <p className="mt-1 text-sm text-red-500">{errors.file.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-700 bg-gray-700 focus:ring-primary-500"
                  {...register('isPublic')}
                />
                <span className="ml-2">Make available to all batches</span>
              </label>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={onCancel}
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
