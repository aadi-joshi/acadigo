import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/dashboard/StatCard';
import DebugAuth from '../../components/common/DebugAuth';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/dashboard');
        setStats(data.stats || {});
        setRecentUsers(data.recentUsers || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  const managementCards = [
    {
      title: 'User Management',
      description: 'Create, edit, and manage users of all roles',
      icon: UsersIcon,
      color: 'bg-blue-900',
      link: '/admin/users'
    },
    {
      title: 'Batch Management',
      description: 'Create and manage batches and assign trainers',
      icon: UserGroupIcon,
      color: 'bg-purple-900',
      link: '/trainer/batches'
    },
    {
      title: 'PPT Management',
      description: 'Upload and manage presentations for all batches',
      icon: DocumentTextIcon,
      color: 'bg-green-900',
      link: '/trainer/ppts'
    },
    {
      title: 'Assignment Management',
      description: 'Create and manage assignments for all batches',
      icon: ClipboardDocumentListIcon,
      color: 'bg-amber-900',
      link: '/trainer/assignments'
    },
    {
      title: 'System Analytics',
      description: 'View system-wide usage and performance metrics',
      icon: ChartBarIcon,
      color: 'bg-red-900',
      link: '/admin/analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings and defaults',
      icon: CogIcon,
      color: 'bg-gray-900',
      link: '/admin/settings'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      {/* Add Debug Panel in development only */}
      {process.env.NODE_ENV !== 'production' && <DebugAuth />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers || 0} icon={UsersIcon} color="bg-blue-900" />
        <StatCard title="Trainers" value={stats.trainers || 0} icon={UserGroupIcon} color="bg-purple-900" />
        <StatCard title="Students" value={stats.students || 0} icon={UserGroupIcon} color="bg-green-900" />
        <StatCard title="Active Batches" value={stats.activeBatches || 0} icon={UserGroupIcon} color="bg-amber-900" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {managementCards.map((card, index) => (
          <Link key={index} to={card.link} className="block">
            <div className={`${card.color} bg-opacity-20 rounded-lg p-6 border border-gray-700 hover:border-gray-500 transition duration-150`}>
              <div className="flex items-center mb-4">
                <card.icon className="h-8 w-8 text-gray-400" />
                <h3 className="ml-3 text-lg font-medium text-white">{card.title}</h3>
              </div>
              <p className="text-gray-400">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Batch
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {recentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-900 bg-opacity-20 text-red-400' 
                        : user.role === 'trainer' 
                          ? 'bg-blue-900 bg-opacity-20 text-blue-400'
                          : 'bg-green-900 bg-opacity-20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.batch ? user.batch.name : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
