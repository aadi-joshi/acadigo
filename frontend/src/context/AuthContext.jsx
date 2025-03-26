import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in when component mounts
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // Set the authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          fetchUserData();
        }
      } catch (err) {
        console.error('Invalid token', err);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data', err);
      logout();
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Save the token to local storage
      localStorage.setItem('token', token);
      
      // Set the authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update the user state
      setUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');
    
    // Remove the authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear the user state
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
