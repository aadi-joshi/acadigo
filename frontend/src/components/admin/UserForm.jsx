import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const UserForm = ({ user, batches, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'student',
      batch: user?.batch || '',
    },
  });
  
  const selectedRole = watch('role');
  
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        batch: user.batch || '',
      });
    }
  }, [user, reset]);
  
  const onFormSubmit = (data) => {
    // If it's an edit and password is empty, don't update the password
    if (user && !data.password) {
      const { password, ...restData } = data;
      onSubmit(restData);
    } else {
      onSubmit(data);
    }
  };
  
  return (
    <Dialog open={true} onClose={onCancel} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {user ? 'Edit User' : 'Create User'}
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
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input w-full"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input w-full"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                disabled={!!user} // Disable email editing for existing users
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="label">
                Password {user && <span className="text-gray-400 text-xs">(Leave blank to keep unchanged)</span>}
              </label>
              <input
                id="password"
                type="password"
                className="input w-full"
                {...register('password', {
                  required: !user ? 'Password is required' : false,
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="role" className="label">
                Role
              </label>
              <select
                id="role"
                className="select w-full"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
            
            {selectedRole === 'student' && (
              <div className="mb-4">
                <label htmlFor="batch" className="label">
                  Batch
                </label>
                <select
                  id="batch"
                  className="select w-full"
                  {...register('batch', {
                    required: selectedRole === 'student' ? 'Batch is required for students' : false,
                  })}
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
            )}
            
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
                {user ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default UserForm;
