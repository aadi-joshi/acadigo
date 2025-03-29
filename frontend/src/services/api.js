import axios from 'axios';

// Helper function to ensure baseURL has the correct format
const formatBaseUrl = (url) => {
  if (!url) {
    return 'http://localhost:5000/api';
  }
  
  // Fix malformed URLs (missing double slash after protocol)
  if (url.startsWith('http:/') && !url.startsWith('http://')) {
    url = url.replace('http:/', 'http://');
  }
  if (url.startsWith('https:/') && !url.startsWith('https://')) {
    url = url.replace('https:/', 'https://');
  }

  // If it's a complete URL (has protocol)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Make sure it ends with /api
    if (url.endsWith('/api')) {
      return url;
    } else if (url.endsWith('/')) {
      return `${url}api`;
    } else {
      return `${url}/api`;
    }
  }
  
  // Default localhost URL with /api
  return 'http://localhost:5000/api';
};

// Helper function to determine the appropriate base URL based on environment
const getBaseUrl = () => {
  // The current hostname (e.g., localhost, mysite.com)
  const hostname = window.location.hostname;
  
  // If running locally, use local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Running in local development - using local API server');
    return 'http://localhost:5000/api';
  }
  
  // If running on the deployed site, use the configured API URL
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    return formatBaseUrl(configuredUrl);
  }
  
  // Fallback to local API if nothing else is specified
  return 'http://localhost:5000/api';
};

// Get the appropriate API URL based on environment
const apiUrl = getBaseUrl();
console.log('Using API URL:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check both token locations (localStorage and sessionStorage)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log auth header for debugging (remove in production)
    console.log('Auth header:', config.headers.Authorization);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling with retry capability
let isRetrying = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed API errors for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle rate limiting with exponential backoff
    if (error.response?.status === 429 && !isRetrying) {
      isRetrying = true;
      
      // Wait between 1-3 seconds before retrying
      const retryDelay = Math.floor(Math.random() * 2000) + 1000;
      console.log(`Rate limited. Retrying after ${retryDelay}ms delay...`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      isRetrying = false;
      // Retry the request
      return api.request(error.config);
    }
    
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default api;
