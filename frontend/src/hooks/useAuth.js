import { useState, useEffect, useContext, createContext } from 'react';
import { users } from '../utils/mockData';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('mockUser');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user in mock data
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser || foundUser.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in localStorage
      localStorage.setItem('mockUser', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      setError(null);
      return userWithoutPassword;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear storage and state
    localStorage.removeItem('mockUser');
    setUser(null);
  };

  // Register function (admin only)
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email is already used
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already in use');
      }
      
      // In a real app, this would add to the database
      const newUser = {
        _id: `user${users.length + 1}`,
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      // Add to mock users (this won't persist on refresh)
      users.push(newUser);
      
      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update user data
      const updatedUser = { ...user, ...userData };
      
      // Store updated user in localStorage
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Update failed');
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
