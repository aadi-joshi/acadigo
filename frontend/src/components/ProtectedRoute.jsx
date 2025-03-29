import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check if role restrictions exist and user has allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  // Return children if authenticated and authorized
  return children;
};

export default ProtectedRoute;
