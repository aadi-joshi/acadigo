import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthContext from '../context/AuthContext';
import NavLinks from '../components/common/NavLinks';
import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon, 
  XCircleIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    ppts: [],
    assignments: [],
    batches: [],
    submissions: [],
    stats: {}
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Make API call to get dashboard data
        const response = await api.get('/dashboard');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  // Render dashboard based on user role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard data={data} />;
    case 'trainer':
      return <TrainerDashboard data={data} />;
    case 'student':
      return <StudentDashboard data={data} />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Acadigo</h2>
          <p className="text-gray-400 mb-4">Your role hasn't been properly assigned.</p>
          <p className="text-gray-400">Please contact an administrator for assistance.</p>
        </div>
      );
  }
}

// Admin Dashboard Component
function AdminDashboard({ data }) {
  const { stats, recentUsers } = data;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900 bg-opacity-20">
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total Users</h2>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-900 bg-opacity-20">
              <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Active Batches</h2>
              <p className="text-2xl font-bold text-white">{stats?.activeBatches || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900 bg-opacity-20">
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total PPTs</h2>
              <p className="text-2xl font-bold text-white">{stats?.totalPPTs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-900 bg-opacity-20">
              <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total Assignments</h2>
              <p className="text-2xl font-bold text-white">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-gray-800 rounded-xl p-6 shadow mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <NavLinks />
      </div>
      
      {/* Recent Users */}
      <div className="bg-gray-800 rounded-xl shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Recent Users</h2>
          <Link to="/admin/users" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
        </div>
        <div className="divide-y divide-gray-700">
          {recentUsers && recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div key={user._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">{user.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-red-900 bg-opacity-20 text-red-400' 
                      : user.role === 'trainer' 
                        ? 'bg-blue-900 bg-opacity-20 text-blue-400'
                        : 'bg-green-900 bg-opacity-20 text-green-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-gray-400">No recent users found.</div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link to="/admin/users/new" className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm text-white">Add User</span>
            </Link>
            <Link to="/trainer/batches/new" className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <AcademicCapIcon className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm text-white">Create Batch</span>
            </Link>
            <Link to="/trainer/ppts/new" className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <DocumentTextIcon className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm text-white">Upload PPT</span>
            </Link>
            <Link to="/trainer/assignments/new" className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500 mb-2" />
              <span className="text-sm text-white">Create Assignment</span>
            </Link>
          </div>
        </div>
        
        {/* System Stats */}
        <div className="bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">System Activity</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">PPT Views Today</span>
                <span className="text-white">{stats?.todayPPTViews || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats?.todayPPTViews || 0) / (stats?.maxDailyViews || 1) * 100)}%` }}></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Assignments Submitted Today</span>
                <span className="text-white">{stats?.todaySubmissions || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats?.todaySubmissions || 0) / (stats?.maxDailySubmissions || 1) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">API Requests Today</span>
                <span className="text-white">{stats?.todayAPIRequests || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats?.todayAPIRequests || 0) / (stats?.maxDailyAPIRequests || 1) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trainer Dashboard Component
function TrainerDashboard({ data }) {
  const { batches, stats, pendingSubmissions } = data;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Trainer Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900 bg-opacity-20">
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">My Students</h2>
              <p className="text-2xl font-bold text-white">{stats?.totalStudents || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900 bg-opacity-20">
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">PPTs Uploaded</h2>
              <p className="text-2xl font-bold text-white">{stats?.pptCount || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-900 bg-opacity-20">
              <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Pending Reviews</h2>
              <p className="text-2xl font-bold text-white">{stats?.pendingSubmissions || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Batches */}
      <div className="bg-gray-800 rounded-xl shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">My Batches</h2>
          <Link to="/trainer/batches" className="text-sm text-primary-400 hover:text-primary-300">Manage Batches</Link>
        </div>
        <div>
          {batches && batches.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {batches.map((batch) => (
                <div key={batch._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">{batch.name}</h3>
                    <p className="text-sm text-gray-400">{batch.studentCount} students</p>
                  </div>
                  <Link 
                    to={`/trainer/batches/${batch._id}`}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-4 text-gray-400">No batches assigned yet.</div>
          )}
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-gray-800 rounded-xl p-6 shadow mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
        <NavLinks />
      </div>
      
      {/* Pending Submissions */}
      <div className="bg-gray-800 rounded-xl shadow">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Pending Assignment Reviews</h2>
          <Link to="/trainer/assignments" className="text-sm text-primary-400 hover:text-primary-300">View All Assignments</Link>
        </div>
        <div>
          {pendingSubmissions && pendingSubmissions.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {pendingSubmissions.map((submission) => (
                <div key={submission._id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">{submission.assignment.title}</h3>
                      <p className="text-sm text-gray-400">
                        Submitted by <span className="text-primary-400">{submission.student.name}</span> on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to={`/trainer/assignments/submissions/${submission._id}`}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-4 text-gray-400">No pending submissions to review.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard({ data }) {
  const { ppts, assignments, submissions, stats } = data;
  
  // Calculate upcoming assignment deadlines
  const upcomingAssignments = assignments
    ?.filter(assignment => {
      const deadline = new Date(assignment.deadline);
      return deadline > new Date();
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);
  
  // Filter recently submitted assignments
  const recentSubmissions = submissions
    ?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3);
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Student Dashboard</h1>
      
      {/* Batch Info */}
      {stats?.batch && (
        <div className="bg-gray-800 rounded-xl p-6 shadow mb-8">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-900 bg-opacity-20">
              <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">My Batch</h2>
              <p className="text-2xl font-bold text-white">{stats.batch.name}</p>
              <p className="text-sm text-gray-400">
                {stats.batch.description || `Trainer: ${stats.batch.trainerName}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900 bg-opacity-20">
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Available PPTs</h2>
              <p className="text-2xl font-bold text-white">{stats?.availablePPTs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-900 bg-opacity-20">
              <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Pending Assignments</h2>
              <p className="text-2xl font-bold text-white">{stats?.pendingAssignments || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900 bg-opacity-20">
              <CheckCircleIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Completed Assignments</h2>
              <p className="text-2xl font-bold text-white">{stats?.completedAssignments || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Assignment Deadlines */}
        <div className="bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Upcoming Deadlines</h2>
            <Link to="/assignments" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
          </div>
          <div>
            {upcomingAssignments && upcomingAssignments.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {upcomingAssignments.map((assignment) => {
                  const deadline = new Date(assignment.deadline);
                  const now = new Date();
                  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={assignment._id} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">{assignment.title}</h3>
                          <p className="text-sm text-gray-400">
                            Due on {deadline.toLocaleDateString()} ({daysLeft} days left)
                          </p>
                        </div>
                        <Link 
                          to={`/assignments/${assignment._id}`}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            daysLeft <= 1 
                              ? 'bg-red-600 text-white' 
                              : daysLeft <= 3
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          View Assignment
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-4 text-gray-400">No upcoming deadlines.</div>
            )}
          </div>
        </div>
        
        {/* Recent Submissions */}
        <div className="bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Recent Submissions</h2>
          </div>
          <div>
            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {recentSubmissions.map((submission) => (
                  <div key={submission._id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">{submission.assignment.title}</h3>
                        <p className="text-sm text-gray-400">
                          Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {submission.status === 'graded' ? (
                          <div className="px-3 py-1 text-xs font-medium rounded-md bg-green-900 bg-opacity-20 text-green-400">
                            Graded: {submission.marks}/{submission.assignment.maxMarks}
                          </div>
                        ) : submission.status === 'late' ? (
                          <div className="px-3 py-1 text-xs font-medium rounded-md bg-yellow-900 bg-opacity-20 text-yellow-400">
                            Late Submission
                          </div>
                        ) : (
                          <div className="px-3 py-1 text-xs font-medium rounded-md bg-blue-900 bg-opacity-20 text-blue-400">
                            Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-gray-400">No recent submissions.</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent PPTs */}
      <div className="mt-8 bg-gray-800 rounded-xl shadow">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Recent PPTs</h2>
          <Link to="/ppts" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
        </div>
        <div>
          {ppts && ppts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {ppts.slice(0, 3).map((ppt) => (
                <div key={ppt._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex-1">
                      <DocumentTextIcon className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="text-white font-medium">{ppt.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Added on {new Date(ppt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to={`/ppts/${ppt._id}`}
                      className="w-full px-3 py-2 text-xs font-medium rounded-md bg-gray-600 text-white hover:bg-gray-500 text-center"
                    >
                      View PPT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-4 text-gray-400">No PPTs available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
