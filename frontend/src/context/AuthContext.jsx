import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (token && storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login user
  const login = async (email, password) => {
    setError(null);
    try {
      console.log('Attempting login with API URL:', api.defaults.baseURL);
      
      // Try a simple request to check API connectivity
      try {
        await api.get('/auth/test', { timeout: 5000 })
          .catch(err => {
            if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
              // Provide more specific error info based on environment
              const hostname = window.location.hostname;
              const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
              
              if (isLocalDev) {
                throw new Error(`Cannot connect to API server at ${api.defaults.baseURL}. Make sure your backend server is running at http://localhost:5000`);
              } else {
                throw new Error(`Cannot connect to API server at ${api.defaults.baseURL}. Please check your network connection and server status.`);
              }
            }
            // If it's not a network error, continue with login
          });
      } catch (pingError) {
        console.error('API connectivity test failed:', pingError);
        setError(pingError.message);
        throw pingError;
      }
      
      // Proceed with login if API is reachable
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to login. Please check your credentials.';
      setError(errorMessage);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Clear errors
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        error,
        clearError,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
