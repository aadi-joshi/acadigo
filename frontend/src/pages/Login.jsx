import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthContext from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Clear error messages when user starts typing
  useEffect(() => {
    if (email || password) {
      setPasswordError(false);
      setErrorMessage('');
    }
  }, [email, password]);

  // Show error message from context if available
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      if (error.toLowerCase().includes('credential') || error.toLowerCase().includes('invalid')) {
        setPasswordError(true);
      }
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(false);
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    try {
      console.log('Submitting login with:', email);
      
      const user = await login(email, password);
      
      // Only navigate if we actually got a user back
      if (user) {
        console.log('Login successful, navigating to dashboard');
        // Use setTimeout to ensure state updates are complete before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } else {
        // This should not happen normally, but just in case
        setPasswordError(true);
        setErrorMessage('Login failed. Invalid credentials.');
      }
    } catch (err) {
      console.error('Login submission error:', err);
      // Extract the most specific error message available
      const errorMsg = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        error || 
        'Failed to log in. Please check your credentials.';
      
      console.log('Detailed error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: errorMsg
      });
      
      // Provide more specific error feedback
      if (err.response?.status === 429) {
        setErrorMessage('Too many login attempts. Please wait a moment before trying again.');
      } else if (err.response?.status === 401 || 
          errorMsg.toLowerCase().includes('credential') || 
          errorMsg.toLowerCase().includes('invalid')) {
        setPasswordError(true);
        setErrorMessage('Invalid email or password. Please try again.');
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Information Column */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome to Acadigo</h1>
          <p className="text-xl text-gray-300 mb-8">Your comprehensive learning management platform</p>
          
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-400 mb-2">Seamless Learning</h3>
              <p className="text-gray-400">Access assignments, presentations, and track your progress in one place</p>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-400 mb-2">Role-Based Experience</h3>
              <p className="text-gray-400">Specialized interfaces for admins, trainers, and students</p>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-400 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-400">Monitor your learning journey with comprehensive analytics</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Acadigo</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Sign in to your account
            </p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                <span className="block sm:inline">{errorMessage}</span>
              </div>
              {passwordError && (
                <p className="text-sm mt-2">
                  Please check your email and password combination. If you're having trouble, contact your administrator.
                </p>
              )}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-700'
                  } rounded-t-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-700'
                  } rounded-b-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
                </span>
                {loading ? <LoadingSpinner size="small" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
