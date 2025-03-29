import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  UserCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const ActivityLogs = ({ userId = null, limit = 50 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = { limit };
        if (userId) params.userId = userId;
        if (filter !== 'all') params.type = filter;
        
        const { data } = await axios.get('/api/logs', { params });
        setLogs(data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [userId, filter, limit]);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <UserCircleIcon className="h-5 w-5 text-blue-400" />;
      case 'ppt_view':
        return <EyeIcon className="h-5 w-5 text-green-400" />;
      case 'ppt_download':
        return <ArrowDownTrayIcon className="h-5 w-5 text-purple-400" />;
      case 'assignment_view':
        return <EyeIcon className="h-5 w-5 text-yellow-400" />;
      case 'assignment_submit':
        return <PaperAirplaneIcon className="h-5 w-5 text-primary-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const formatActivityMessage = (log) => {
    switch (log.type) {
      case 'login':
        return `${log.user.name} logged in`;
      case 'ppt_view':
        return `${log.user.name} viewed ${log.resource?.title || 'a PPT'}`;
      case 'ppt_download':
        return `${log.user.name} downloaded ${log.resource?.title || 'a PPT'}`;
      case 'assignment_view':
        return `${log.user.name} viewed ${log.resource?.title || 'an assignment'}`;
      case 'assignment_submit':
        return `${log.user.name} submitted ${log.resource?.title || 'an assignment'}`;
      default:
        return log.message || 'Activity recorded';
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Activity Logs</h2>
        
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-white rounded-md border-gray-600 py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="ppt_view">PPT Views</option>
            <option value="ppt_download">PPT Downloads</option>
            <option value="assignment_view">Assignment Views</option>
            <option value="assignment_submit">Assignment Submissions</option>
          </select>
        </div>
      </div>
      
      {logs.length > 0 ? (
        <div className="divide-y divide-gray-700">
          {logs.map((log) => (
            <div key={log._id} className="px-6 py-4">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getActivityIcon(log.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white">{formatActivityMessage(log)}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{format(new Date(log.timestamp), 'MMMM dd, yyyy h:mm a')}</span>
                  </div>
                </div>
                {log.type.includes('ppt') && (
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                )}
                {log.type.includes('assignment') && (
                  <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <ClockIcon className="h-10 w-10 mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400">No activity logs found{filter !== 'all' ? ' for the selected filter' : ''}.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
