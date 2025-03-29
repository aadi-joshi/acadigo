import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthContext from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    try {
      console.log('Submitting login with:', email);
      
      await login(email, password);
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login submission error:', err);
      setErrorMessage(error || err.response?.data?.message || 'Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Acadigo</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to your account
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-t-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-b-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
  );
}
