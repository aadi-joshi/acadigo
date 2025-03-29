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
const BatchDetail = lazy(() => import('./pages/trainer/BatchDetail'));
const PPTManagement = lazy(() => import('./pages/trainer/PPTManagement'));
const AssignmentManagement = lazy(() => import('./pages/trainer/AssignmentManagement'));
const SubmissionsList = lazy(() => import('./pages/trainer/SubmissionsList'));
const PPTView = lazy(() => import('./pages/student/PPTView'));
const AssignmentView = lazy(() => import('./pages/student/AssignmentView'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const SystemDebug = lazy(() => import('./pages/admin/SystemDebug'));

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin Routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/debug"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemDebug />
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
            path="trainer/batches/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                <BatchDetail />
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
          <Route
            path="trainer/assignments/:id/submissions"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                <SubmissionsList />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="ppts"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer', 'student']}>
                <PPTView />
              </ProtectedRoute>
            }
          />
          <Route
            path="ppts/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer', 'student']}>
                <PPTView />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer', 'student']}>
                <AssignmentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'trainer', 'student']}>
                <AssignmentView />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
