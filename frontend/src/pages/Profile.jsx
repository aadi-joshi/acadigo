import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import { updateUser } from '../services/userService';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });
  
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updatedUser = await updateUser(user._id, {
        name: data.name,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
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
              className="input w-full bg-gray-800"
              readOnly
              disabled
              {...register('email')}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="label">
              Role
            </label>
            <input
              id="role"
              type="text"
              className="input w-full bg-gray-800"
              readOnly
              disabled
              value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
