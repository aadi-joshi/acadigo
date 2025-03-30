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
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
  BookOpenIcon
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
              <p className="text-center py-4 text-gray-400">No upcoming assignments.</p>
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
      
      {/* Student Analytics Section */}
      <div className="mt-8 bg-gray-800 rounded-xl shadow">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-white">My Performance Analytics</h2>
        </div>
        <div className="p-6">
          <StudentAnalytics data={data} />
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

// Student Analytics Component
function StudentAnalytics({ data }) {
  const [activeTab, setActiveTab] = useState('performance');
  const { stats = {}, submissions = [] } = data;
  
  // Prepare analytics data
  const performanceData = {
    labels: submissions.slice(-6).map(s => s.assignment?.title?.substring(0, 10) + '...' || 'Assignment'),
    values: submissions.slice(-6).map(s => s.marks || 0),
    maxValues: submissions.slice(-6).map(s => s.assignment?.maxMarks || 100)
  };
  
  const submissionTimeData = {
    onTime: stats.onTimeSubmissions || 4,
    late: stats.lateSubmissions || 2,
    missed: stats.missedAssignments || 1
  };
  
  const activityData = {
    weeklyActivity: [
      { day: 'Mon', hours: stats.mondayHours || 2.5 },
      { day: 'Tue', hours: stats.tuesdayHours || 1.8 },
      { day: 'Wed', hours: stats.wednesdayHours || 3.2 },
      { day: 'Thu', hours: stats.thursdayHours || 2.0 },
      { day: 'Fri', hours: stats.fridayHours || 1.5 },
      { day: 'Sat', hours: stats.saturdayHours || 0.5 },
      { day: 'Sun', hours: stats.sundayHours || 0.2 }
    ]
  };
  
  const materialsData = {
    pptsViewed: stats.pptsViewed || 8,
    totalPPTs: stats.totalAvailablePPTs || 12,
    resourcesAccessed: stats.resourcesAccessed || 15,
    totalResources: stats.totalAvailableResources || 25
  };

  return (
    <div>
      {/* Analytics Navigation Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeTab === 'performance' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-1" />
            <span>Assignment Performance</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeTab === 'submissions' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Submission Timeliness</span>
          </div>
        </button>
        {/* <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeTab === 'activity' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Weekly Activity</span>
          </div>
        </button> */}
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeTab === 'materials' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-1" />
            <span>Learning Materials</span>
          </div>
        </button>
      </div>
      
      {/* Analytics Content */}
      <div className="bg-gray-700 rounded-xl p-4 min-h-[300px]">
        {/* Performance Chart */}
        {activeTab === 'performance' && (
          <div>
            <h3 className="text-white font-medium mb-4">Assignment Scores</h3>
            {performanceData.labels.length > 0 ? (
              <div className="space-y-4">
                {performanceData.labels.map((label, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{label}</span>
                      <span className="text-white">{performanceData.values[index]}/{performanceData.maxValues[index]}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          performanceData.values[index] / performanceData.maxValues[index] >= 0.8 
                            ? 'bg-green-500' 
                            : performanceData.values[index] / performanceData.maxValues[index] >= 0.6 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`} 
                        style={{ 
                          width: `${(performanceData.values[index] / performanceData.maxValues[index]) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Overall Performance</span>
                    <span className="text-white">
                      {Math.round(
                        (performanceData.values.reduce((a, b) => a + b, 0) / 
                        performanceData.maxValues.reduce((a, b) => a + b, 0)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full" 
                      style={{ 
                        width: `${(performanceData.values.reduce((a, b) => a + b, 0) / 
                        performanceData.maxValues.reduce((a, b) => a + b, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                No assignment data available
              </div>
            )}
          </div>
        )}
        
        {/* Submissions Timeliness */}
        {activeTab === 'submissions' && (
          <div>
            <h3 className="text-white font-medium mb-4">Submission Timeliness</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center bg-green-900 bg-opacity-20 mb-3">
                  <CheckCircleIcon className="h-10 w-10 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-white">{submissionTimeData.onTime}</h4>
                <p className="text-sm text-gray-400">On Time</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center bg-yellow-900 bg-opacity-20 mb-3">
                  <ClockIcon className="h-10 w-10 text-yellow-500" />
                </div>
                <h4 className="text-xl font-bold text-white">{submissionTimeData.late}</h4>
                <p className="text-sm text-gray-400">Late</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center bg-red-900 bg-opacity-20 mb-3">
                  <XCircleIcon className="h-10 w-10 text-red-500" />
                </div>
                <h4 className="text-xl font-bold text-white">{submissionTimeData.missed}</h4>
                <p className="text-sm text-gray-400">Missed</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-white text-sm mb-2">Submission Quality Breakdown</h4>
              <div className="w-full bg-gray-600 rounded-full h-6 overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ 
                      width: `${(submissionTimeData.onTime / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ 
                      width: `${(submissionTimeData.late / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ 
                      width: `${(submissionTimeData.missed / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{Math.round((submissionTimeData.onTime / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100)}% On Time</span>
                <span>{Math.round((submissionTimeData.late / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100)}% Late</span>
                <span>{Math.round((submissionTimeData.missed / (submissionTimeData.onTime + submissionTimeData.late + submissionTimeData.missed)) * 100)}% Missed</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Weekly Activity */}
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-white font-medium mb-4">Weekly Platform Activity</h3>
            <div className="flex items-end justify-between h-60 mb-2">
              {activityData.weeklyActivity.map((day, index) => {
                const maxHours = Math.max(...activityData.weeklyActivity.map(d => d.hours));
                const height = (day.hours / maxHours) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center w-1/7">
                    <div 
                      className="w-8 bg-primary-500 rounded-t-md" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-2">{day.day}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h4 className="text-white text-sm mb-3">Activity Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Hours This Week</p>
                  <p className="text-white text-lg font-bold">
                    {activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0).toFixed(1)} hrs
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Most Active Day</p>
                  <p className="text-white text-lg font-bold">
                    {activityData.weeklyActivity.reduce((max, day) => day.hours > max.hours ? day : max, { hours: 0 }).day}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Average Daily Activity</p>
                  <p className="text-white text-lg font-bold">
                    {(activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0) / 7).toFixed(1)} hrs
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Platform Engagement</p>
                  <p className={`text-lg font-bold ${
                    (activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0) > 10) 
                      ? 'text-green-400' 
                      : (activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0) > 5) 
                        ? 'text-yellow-400' 
                        : 'text-red-400'
                  }`}>
                    {(activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0) > 10) 
                      ? 'High' 
                      : (activityData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0) > 5) 
                        ? 'Medium' 
                        : 'Low'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Learning Materials */}
        {activeTab === 'materials' && (
          <div>
            <h3 className="text-white font-medium mb-4">Learning Materials Engagement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-gray-300 font-medium mb-3 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-1 text-green-500" />
                  <span>PPT Materials</span>
                </h4>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">PPTs Viewed</span>
                    <span className="text-white">{materialsData.pptsViewed}/{materialsData.totalPPTs}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${(materialsData.pptsViewed / materialsData.totalPPTs) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border-4 border-green-500 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {Math.round((materialsData.pptsViewed / materialsData.totalPPTs) * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">PPT Completion</p>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-gray-300 font-medium mb-3 flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-1 text-blue-500" />
                  <span>Additional Resources</span>
                </h4>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Resources Accessed</span>
                    <span className="text-white">{materialsData.resourcesAccessed}/{materialsData.totalResources}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${(materialsData.resourcesAccessed / materialsData.totalResources) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border-4 border-blue-500 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {Math.round((materialsData.resourcesAccessed / materialsData.totalResources) * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Resource Usage</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h4 className="text-white text-sm mb-3">Engagement Insights</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You've covered {Math.round((materialsData.pptsViewed / materialsData.totalPPTs) * 100)}% of course PPTs - {materialsData.pptsViewed === materialsData.totalPPTs ? 'Great job!' : 'keep going!'}</span>
                </li>
                <li className="flex items-start text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You've accessed {Math.round((materialsData.resourcesAccessed / materialsData.totalResources) * 100)}% of additional resources - {materialsData.resourcesAccessed > materialsData.totalResources * 0.7 ? 'Excellent!' : 'try exploring more!'}</span>
                </li>
                <li className="flex items-start text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Overall material engagement is {Math.round(((materialsData.pptsViewed / materialsData.totalPPTs) + (materialsData.resourcesAccessed / materialsData.totalResources)) * 50)}%</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
