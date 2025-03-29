import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';

const BatchForm = ({ isOpen, onClose, batch, trainers = [], onSubmit }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user.role === 'admin';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: batch?.name || '',
      description: batch?.description || '',
      trainer: batch?.trainer?._id || batch?.trainer || (isAdmin ? '' : user._id),
      startDate: batch?.startDate 
        ? format(new Date(batch.startDate), 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd'),
      endDate: batch?.endDate 
        ? format(new Date(batch.endDate), 'yyyy-MM-dd') 
        : '',
      active: batch?.active ?? true,
    },
  });
  
  useEffect(() => {
    if (batch) {
      reset({
        name: batch.name,
        description: batch.description,
        trainer: batch.trainer?._id || batch.trainer || (isAdmin ? '' : user._id),
        startDate: format(new Date(batch.startDate), 'yyyy-MM-dd'),
        endDate: batch.endDate ? format(new Date(batch.endDate), 'yyyy-MM-dd') : '',
        active: batch.active ?? true,
      });
    }
  }, [batch, reset, user._id, isAdmin]);
  
  const onFormSubmit = (data) => {
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {batch ? 'Edit Batch' : 'Create Batch'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">Close</span>
              ✕
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
            
            {isAdmin && (
              <div className="mb-4">
                <label htmlFor="trainer" className="label">
                  Trainer
                </label>
                <select
                  id="trainer"
                  className="select w-full"
                  {...register('trainer', { required: 'Trainer is required' })}
                >
                  <option value="">Select a trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer._id} value={trainer._id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {errors.trainer && (
                  <p className="mt-1 text-sm text-red-500">{errors.trainer.message}</p>
                )}
              </div>
            )}
            
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
                  className="form-checkbox h-5 w-5 text-primary-600"
                  {...register('active')}
                />
                <span className="ml-2">Active</span>
              </label>
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
