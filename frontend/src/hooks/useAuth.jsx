import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const { data } = await axios.get('/api/auth/me');
          setUser(data);
        } catch (err) {
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setError(err.response?.data?.message || 'Authentication failed');
        }
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data.user);
      setError(null);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  // Register function (admin only)
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/register', userData);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/users/profile', userData);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    clearError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export default function useAuth() {
  return useContext(AuthContext);
}
