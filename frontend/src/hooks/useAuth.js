import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const useAuth = () => {
  const { user, setUser, setLoading, setError, clearError, api } = useContext(AuthContext);

  // Update profile information
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      clearError();
      
      // If userData is a direct object (from API response), use it directly
      if (userData._id) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
        return userData;
      }
      
      // Otherwise treat it as form data to be sent to the API
      const response = await api.put('/users/profile', userData);
      
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
      throw err;
    }
  };

  return { user, updateProfile };
};

export default useAuth;
