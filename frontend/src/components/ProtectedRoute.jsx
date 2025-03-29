import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  // Show loading spinner while authentication state is being determined
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified and user's role is not included, redirect to dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not in allowed roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" />;
  }

  // Otherwise, show the protected component
  return children;
};

export default ProtectedRoute;
