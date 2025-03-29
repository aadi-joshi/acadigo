import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api'; // Import api service instead of axios

const UserForm = ({ isOpen, onClose, onSubmit, user, batches = [] }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      batch: '',
    },
  });

  const [selectedRole, setSelectedRole] = useState('student');
  const [batchOptions, setBatchOptions] = useState(batches);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we are editing a user, fetch their current data
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '', // Don't pre-fill password for security
        role: user.role,
        batch: user.batch?._id || user.batch || '',
      });
    } else {
      // If creating a new user, reset form
      reset({
        name: '',
        email: '',
        password: '',
        role: 'student',
        batch: '',
      });
    }

    // Update selectedRole when user.role changes
    if (user?.role) {
      setSelectedRole(user.role);
    } else {
      setSelectedRole('student');
    }
  }, [user, reset]);

  // Handle role change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Fetch batches if they're not provided
  useEffect(() => {
    if (batches.length === 0) {
      const fetchBatches = async () => {
        try {
          // Use api service instead of axios
          const { data } = await api.get('/batches');
          setBatchOptions(data);
        } catch (err) {
          console.error('Error fetching batches:', err);
        }
      };

      fetchBatches();
    } else {
      setBatchOptions(batches);
    }
  }, [batches]);

  const onFormSubmit = (data) => {
    try {
      // For debugging - log the form data
      console.log('Form submission data:', data);
      
      // Ensure password is provided for new users
      if (!user && !data.password) {
        setError('Password is required for new users');
        return;
      }
      
      // Ensure that student has a batch
      if (data.role === 'student' && !data.batch) {
        setError('Students must be assigned to a batch');
        return;
      }

      // Call the onSubmit function with the form data
      onSubmit(data);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred while submitting the form');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {user ? 'Edit User' : 'Create User'}
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
            {error && (
              <p className="mb-4 text-sm text-red-500">{error}</p>
            )}
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
                onChange={handleRoleChange}
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
                  {batchOptions.map((batch) => (
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
                onClick={onClose}
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
