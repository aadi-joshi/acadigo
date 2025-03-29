import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const DebugAuth = () => {
  const { user } = useContext(AuthContext);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      const response = await api.get('/auth/me');
      setResponseData(response.data);
    } catch (err) {
      console.error('Auth test failed:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md mb-4">
      <h3 className="text-white text-lg mb-2">Authentication Debug Panel</h3>
      
      <div className="mb-4">
        <h4 className="text-gray-300 mb-1">Current User:</h4>
        <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-auto max-h-40">
          {user ? JSON.stringify(user, null, 2) : 'Not authenticated'}
        </pre>
      </div>
      
      <button 
        onClick={testAuth} 
        className="bg-blue-600 px-3 py-1 rounded text-white mb-4 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-2 rounded-md mb-2">
          {error}
        </div>
      )}
      
      {responseData && (
        <div>
          <h4 className="text-gray-300 mb-1">Server Response:</h4>
          <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAuth;
