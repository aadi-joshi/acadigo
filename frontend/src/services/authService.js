import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // If login is successful, set auth header for future requests
    if (response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  // Remove auth header
  delete api.defaults.headers.common['Authorization'];
  // Clear storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};
