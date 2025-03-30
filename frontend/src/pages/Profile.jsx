import { useState, useEffect, useRef, useContext } from 'react';
import { XCircleIcon, KeyIcon, UserCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import AuthContext from '../context/AuthContext'; // Changed from named import to default import
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser, error: authError, clearError } = useContext(AuthContext); // Changed updateProfile to updateUser
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  
  // Student specific fields
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [parentName, setParentName] = useState(user?.parentName || '');
  const [parentContactNumber, setParentContactNumber] = useState(user?.parentContactNumber || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo?.fileUrl || null);
  const [resume, setResume] = useState(null);
  const [resumeDetails, setResumeDetails] = useState(user?.resume || null);
  
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Update local state when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setContactNumber(user.contactNumber || '');
      setParentName(user.parentName || '');
      setParentContactNumber(user.parentContactNumber || '');
      setPhotoPreview(user.photo?.fileUrl || null);
      setResumeDetails(user.resume || null);
    }
  }, [user]);

  // Local version of clearError to handle both contexts and local state
  const handleClearError = () => {
    // Clear local error state
    setLocalError(null);
    
    // If the context provides clearError, use it too
    if (typeof clearError === 'function') {
      clearError();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      setPhoto(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume must be less than 10MB');
        return;
      }
      
      setResume(file);
      
      // Update resume details
      setResumeDetails({
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      });
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removeResume = () => {
    setResume(null);
    setResumeDetails(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    handleClearError(); // Use our safe wrapper function
    
    try {
      // Set loading state to true when starting the update
      setLoading(true);
      
      // If password section is shown, validate passwords
      if (showPasswordSection) {
        if (!currentPassword) {
          setMessage('Current password is required');
          setLoading(false); // Reset loading state
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setMessage('New passwords do not match');
          setLoading(false); // Reset loading state
          return;
        }
        
        if (newPassword && newPassword.length < 6) {
          setMessage('Password must be at least 6 characters');
          setLoading(false); // Reset loading state
          return;
        }
      }
      
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('name', name);
      
      if (user.role === 'student') {
        if (contactNumber) formData.append('contactNumber', contactNumber);
        if (parentName) formData.append('parentName', parentName);
        if (parentContactNumber) formData.append('parentContactNumber', parentContactNumber);
        if (photo) formData.append('photo', photo);
        if (resume) formData.append('resume', resume);
      }
      
      // Only include password fields if the password section is shown and inputs are provided
      if (showPasswordSection && currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }
      
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update local state with the response data
      if (response.data) {
        updateUser(response.data); // Changed updateProfile to updateUser
      }
      
      setMessage('Profile updated successfully');
      toast.success('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPhoto(null);
      setResume(null);
    } catch (err) {
      console.error('Profile update error:', err);
      setLocalError(err.response?.data?.message || 'Failed to update profile');
      setMessage(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      // Always reset loading state when done
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('successfully') ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-500' : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-500'}`}>
          {message}
        </div>
      )}
      
      {(authError || localError) && (
        <div className="p-4 mb-6 rounded-md bg-red-900 bg-opacity-20 text-red-400 border border-red-500">
          {authError || localError}
        </div>
      )}
      
      <div className="bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Account Information</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileUpdate}>
            {/* Profile Photo - Only for students */}
            {user?.role === 'student' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Photo
                </label>
                
                <div className="flex items-start">
                  <div className="mr-4">
                    {photoPreview ? (
                      <div className="relative w-24 h-24">
                        <img 
                          src={photoPreview} 
                          alt="Profile preview" 
                          className="w-24 h-24 rounded-full object-cover border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-gray-900 bg-opacity-70 rounded-full p-1 text-white hover:bg-red-500"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserCircleIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div
                      onClick={() => photoInputRef.current.click()}
                      className="py-2 px-3 border border-gray-600 rounded-md cursor-pointer hover:border-primary-500 text-center"
                    >
                      <span className="text-primary-400">Upload a photo</span>
                      <input
                        ref={photoInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
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
            
            {/* Student specific fields */}
            {user?.role === 'student' && (
              <>
                <div className="mb-6">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-300 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="parentContactNumber" className="block text-sm font-medium text-gray-300 mb-2">
                    Parent/Guardian Contact Number
                  </label>
                  <input
                    type="text"
                    id="parentContactNumber"
                    value={parentContactNumber}
                    onChange={(e) => setParentContactNumber(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resume / CV
                  </label>
                  
                  {resumeDetails ? (
                    <div className="bg-gray-700 rounded-md p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentIcon className="h-6 w-6 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-white">{resumeDetails.fileName}</div>
                            <div className="text-xs text-gray-400">
                              {resumeDetails.fileSize && formatFileSize(resumeDetails.fileSize)}
                              {resumeDetails.uploadedAt && ` • Uploaded on ${new Date(resumeDetails.uploadedAt).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {resumeDetails.fileUrl && (
                            <a
                              href={resumeDetails.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300"
                            >
                              View
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={removeResume}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  <div
                    onClick={() => resumeInputRef.current.click()}
                    className="py-2 px-3 border border-gray-600 rounded-md cursor-pointer hover:border-primary-500 text-center"
                  >
                    <span className="text-primary-400">
                      {resumeDetails ? 'Replace resume' : 'Upload your resume'}
                    </span>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    PDF, DOC, or DOCX. Max 10MB.
                  </p>
                </div>
              </>
            )}
            
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
