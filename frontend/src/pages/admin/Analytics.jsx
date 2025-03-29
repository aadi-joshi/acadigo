import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    dailyStats: [],
    pptMetrics: { total: 0, views: 0, avgPerStudent: 0 },
    assignmentMetrics: { total: 0, submitted: 0, lateSubmissions: 0, avgScore: 0 },
    userMetrics: { totalLogins: 0, activeUsers: 0, inactiveUsers: 0 }
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from a real API endpoint
        // const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
        // setAnalyticsData(response.data);
        
        // For now, simulate API response with mock data
        await simulateApiCall();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Simulate API call with mock data
  const simulateApiCall = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate some random data based on timeRange
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      return {
        date: date.toISOString().split('T')[0],
        pptViews: Math.floor(Math.random() * 50) + 10,
        submissions: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 30) + 15,
      };
    });
    
    setAnalyticsData({
      dailyStats,
      pptMetrics: {
        total: 45,
        views: dailyStats.reduce((sum, day) => sum + day.pptViews, 0),
        avgPerStudent: 12.3
      },
      assignmentMetrics: {
        total: 28,
        submitted: 152,
        lateSubmissions: 23,
        avgScore: 78.5
      },
      userMetrics: {
        totalLogins: dailyStats.reduce((sum, day) => sum + day.activeUsers, 0),
        activeUsers: 42,
        inactiveUsers: 8
      }
    });
  };

  const renderMetricCard = (title, value, icon, color, subtext) => (
    <div className={`${color} bg-opacity-20 rounded-lg p-6 border border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-400 uppercase">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
          {subtext && <div className="mt-1 text-xs text-gray-400">{subtext}</div>}
        </div>
        <div className={`${color} bg-opacity-20 rounded-full p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">System Analytics</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'week' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'quarter' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {renderMetricCard(
          'PPT Views', 
          analyticsData.pptMetrics.views, 
          <DocumentTextIcon className="h-6 w-6 text-green-500" />,
          'bg-green-900',
          `${analyticsData.pptMetrics.total} total PPTs`
        )}
        
        {renderMetricCard(
          'Assignment Submissions', 
          analyticsData.assignmentMetrics.submitted, 
          <ClipboardDocumentListIcon className="h-6 w-6 text-amber-500" />,
          'bg-amber-900',
          `${analyticsData.assignmentMetrics.lateSubmissions} late submissions`
        )}
        
        {renderMetricCard(
          'Active Users', 
          analyticsData.userMetrics.activeUsers, 
          <UserGroupIcon className="h-6 w-6 text-blue-500" />,
          'bg-blue-900',
          `${analyticsData.userMetrics.totalLogins} total logins`
        )}
      </div>

      {/* Activity Chart */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Activity Overview</h2>
        <div className="h-80 flex items-end justify-between space-x-2">
          {analyticsData.dailyStats.slice(-14).map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-all cursor-pointer" 
                  style={{ height: `${(day.activeUsers / 50) * 100}%` }}
                  title={`${day.activeUsers} active users`}
                ></div>
                <div 
                  className="w-full bg-amber-600 rounded-t hover:bg-amber-500 transition-all cursor-pointer" 
                  style={{ height: `${(day.submissions / 50) * 100}%` }}
                  title={`${day.submissions} submissions`}
                ></div>
                <div 
                  className="w-full bg-green-600 rounded-t hover:bg-green-500 transition-all cursor-pointer" 
                  style={{ height: `${(day.pptViews / 50) * 100}%` }}
                  title={`${day.pptViews} PPT views`}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8 space-x-8">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span className="text-sm text-gray-300">PPT Views</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-600 rounded mr-2"></div>
            <span className="text-sm text-gray-300">Submissions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm text-gray-300">Active Users</span>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">PPT Analytics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total PPTs</span>
              <span className="text-white font-medium">{analyticsData.pptMetrics.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Views</span>
              <span className="text-white font-medium">{analyticsData.pptMetrics.views}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Average Views per Student</span>
              <span className="text-white font-medium">{analyticsData.pptMetrics.avgPerStudent}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Assignment Analytics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Assignments</span>
              <span className="text-white font-medium">{analyticsData.assignmentMetrics.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Submissions</span>
              <span className="text-white font-medium">{analyticsData.assignmentMetrics.submitted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Late Submissions</span>
              <span className="text-white font-medium">{analyticsData.assignmentMetrics.lateSubmissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Average Score</span>
              <span className="text-white font-medium">{analyticsData.assignmentMetrics.avgScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
