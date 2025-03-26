import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    clearError();
    
    try {
      // If password section is shown, validate passwords
      if (showPasswordSection) {
        if (!currentPassword) {
          setMessage('Current password is required');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setMessage('New passwords do not match');
          return;
        }
        
        if (newPassword && newPassword.length < 6) {
          setMessage('Password must be at least 6 characters');
          return;
        }
      }
      
      const profileData = {
        name
      };
      
      // Only include password fields if the password section is shown and inputs are provided
      if (showPasswordSection && currentPassword && newPassword) {
        profileData.currentPassword = currentPassword;
        profileData.newPassword = newPassword;
      }
      
      await updateProfile(profileData);
      
      setMessage('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('successfully') ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-500' : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-500'}`}>
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-6 rounded-md bg-red-900 bg-opacity-20 text-red-400 border border-red-500">
          {error}
        </div>
      )}
      
      <div className="bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Account Information</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                className="input-field w-full bg-gray-600 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-sm text-gray-400">Your email cannot be changed</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                id="role"
                value={user?.role || ''}
                className="input-field w-full bg-gray-600 cursor-not-allowed"
                disabled
              />
            </div>
            
            {!showPasswordSection ? (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="inline-flex items-center text-primary-400 hover:text-primary-300"
                >
                  <KeyIcon className="h-5 w-5 mr-2" />
                  Change Password
                </button>
              </div>
            ) : (
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                
                <div className="mb-4">
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
