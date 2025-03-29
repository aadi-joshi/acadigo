import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          // Set auth header for API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Clear error function
  const clearError = () => setError(null);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      clearError,
      setUser, // Export this so App.jsx can use it
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
