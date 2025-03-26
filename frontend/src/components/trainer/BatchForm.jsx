import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const BatchForm = ({ batch, onSubmit, onCancel }) => {
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: batch?.name || '',
      description: batch?.description || '',
      startDate: batch?.startDate 
        ? new Date(batch.startDate).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      endDate: batch?.endDate 
        ? new Date(batch.endDate).toISOString().split('T')[0] 
        : '',
      isActive: batch?.isActive ?? true,
    },
  });
  
  useEffect(() => {
    if (batch) {
      reset({
        name: batch.name,
        description: batch.description,
        startDate: new Date(batch.startDate).toISOString().split('T')[0],
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
        isActive: batch.isActive,
      });
    }
  }, [batch, reset]);
  
  const onFormSubmit = (data) => {
    const formattedData = {
      ...data,
      trainer: user._id, // Set current user as trainer
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <Dialog open={true} onClose={onCancel} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {batch ? 'Edit Batch' : 'Create Batch'}
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
              <label htmlFor="name" className="label">
                Batch Name
              </label>
              <input
                id="name"
                type="text"
                className="input w-full"
                {...register('name', { required: 'Batch name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
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
              <label htmlFor="startDate" className="label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="input w-full"
                {...register('startDate', { required: 'Start date is required' })}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="endDate" className="label">
                End Date (Optional)
              </label>
              <input
                id="endDate"
                type="date"
                className="input w-full"
                {...register('endDate')}
              />
            </div>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-700 bg-gray-700 focus:ring-primary-500"
                  {...register('isActive')}
                />
                <span className="ml-2">Active</span>
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
                {batch ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default BatchForm;
