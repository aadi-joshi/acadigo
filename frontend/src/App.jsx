import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext } from 'react';
import Layout from './components/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AuthContext from './context/AuthContext';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const BatchManagement = lazy(() => import('./pages/trainer/BatchManagement'));
const PPTManagement = lazy(() => import('./pages/trainer/PPTManagement'));
const AssignmentManagement = lazy(() => import('./pages/trainer/AssignmentManagement'));
const PPTView = lazy(() => import('./pages/student/PPTView'));
const AssignmentView = lazy(() => import('./pages/student/AssignmentView'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Admin Routes */}
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Trainer Routes */}
          <Route 
            path="trainer/batches" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                <BatchManagement />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="trainer/ppts" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                <PPTManagement />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="trainer/assignments" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                <AssignmentManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Student Routes */}
          <Route path="ppts" element={<PPTView />} />
          <Route path="assignments" element={<AssignmentView />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
