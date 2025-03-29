import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import AuthContext from '../../context/AuthContext';

const AssignmentForm = ({ assignment, batches, onSubmit, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: assignment?.title || '',
      description: assignment?.description || '',
      batch: assignment?.batch || '',
      deadline: assignment ? format(new Date(assignment.deadline), 'yyyy-MM-dd\'T\'HH:mm') : '',
      allowResubmission: assignment?.allowResubmission ?? true,
      maxMarks: assignment?.maxMarks || 100,
    },
  });
  
  useEffect(() => {
    if (assignment) {
      reset({
        title: assignment.title,
        description: assignment.description,
        batch: assignment.batch._id || assignment.batch,
        deadline: format(new Date(assignment.deadline), 'yyyy-MM-dd\'T\'HH:mm'),
        allowResubmission: assignment.allowResubmission,
        maxMarks: assignment.maxMarks,
      });
    }
  }, [assignment, reset]);
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const onFormSubmit = (data) => {
    // Make sure to include batch in the form data for proper permission validation
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('batch', data.batch);
    formData.append('deadline', new Date(data.deadline).toISOString());
    formData.append('allowResubmission', data.allowResubmission);
    formData.append('maxMarks', data.maxMarks);
    
    // Only append file if one was selected
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
              {assignment ? 'Edit Assignment' : 'Create Assignment'}
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
              <label htmlFor="deadline" className="label">
                Deadline
              </label>
              <input
                id="deadline"
                type="datetime-local"
                className="input w-full"
                {...register('deadline', { required: 'Deadline is required' })}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="maxMarks" className="label">
                Maximum Marks
              </label>
              <input
                id="maxMarks"
                type="number"
                min="1"
                max="1000"
                className="input w-full"
                {...register('maxMarks', { 
                  required: 'Maximum marks is required',
                  min: { value: 1, message: 'Minimum value is 1' },
                  max: { value: 1000, message: 'Maximum value is 1000' }
                })}
              />
              {errors.maxMarks && (
                <p className="mt-1 text-sm text-red-500">{errors.maxMarks.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="file" className="label">
                Instructions File {assignment && <span className="text-gray-400 text-xs">(Leave empty to keep current file)</span>}
              </label>
              <input
                id="file"
                type="file"
                className="input w-full"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              {assignment && assignment.fileName && (
                <p className="text-sm text-gray-400 mt-1">
                  Current file: {assignment.fileName}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  {...register('allowResubmission')}
                />
                <span className="ml-2">Allow Resubmission After Deadline</span>
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
                {assignment ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default AssignmentForm;
