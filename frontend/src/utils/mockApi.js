import axios from 'axios';
import { 
  users, 
  batches, 
  ppts, 
  assignments, 
  submissions, 
  dashboardData 
} from './mockData';

// Intercept all axios requests for mock implementation
export const setupMockAPI = () => {
  // Setup axios mock interceptor
  axios.interceptors.request.use(request => {
    const mockHandlers = {
      '/api/dashboard': handleDashboard,
      '/api/ppts': handleGetPPTs,
      '/api/batches': handleGetBatches,
      '/api/assignments': handleGetAssignments,
    };

    // Custom handlers for specific endpoints
    for (const [endpoint, handler] of Object.entries(mockHandlers)) {
      if (request.url.startsWith(endpoint)) {
        return mockResponse(request, handler);
      }
    }

    // Generic mock response for other endpoints
    return mockResponse(request, () => ({ success: true, message: 'Operation successful' }));
  });

  function mockResponse(request, handler) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          const mockData = handler(request);
          
          // Mock successful response
          const response = {
            data: mockData,
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            config: request,
            request: {}
          };
          
          resolve(response);
        } catch (error) {
          // Mock error response
          reject({
            response: {
              data: { message: error.message },
              status: error.status || 500,
              statusText: error.statusText || 'Error',
              headers: {},
              config: request,
              request: {}
            }
          });
        }
      }, 500); // Simulate 500ms delay
    });
  }
};

// Mock endpoint handlers
function handleDashboard(request) {
  const user = JSON.parse(localStorage.getItem('mockUser'));
  
  if (!user) {
    throw { message: 'Unauthorized', status: 401 };
  }
  
  return dashboardData[user.role];
}

function handleGetPPTs(request) {
  return ppts;
}

function handleGetBatches(request) {
  return batches;
}

function handleGetAssignments(request) {
  return assignments;
}
