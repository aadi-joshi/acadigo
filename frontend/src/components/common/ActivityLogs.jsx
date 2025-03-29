import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const ActivityLogs = ({ limit = 5, showTitle = true }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/logs', { params: { limit } });
        setLogs(data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [limit]);

  if (loading) {
    return <div className="py-4 text-center"><LoadingSpinner size="small" /></div>;
  }

  if (error) {
    return <div className="text-red-400 py-4 text-center">{error}</div>;
  }

  if (logs.length === 0) {
    return <div className="text-gray-400 py-4 text-center">No recent activities</div>;
  }

  return (
    <div>
      {showTitle && (
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
      )}
      
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log._id} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-start">
              <div className="bg-gray-600 rounded-full p-2 mr-3">
                <ClockIcon className="h-5 w-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{log.action}</p>
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <UserIcon className="h-3 w-3 mr-1" />
                  <span>{log.user?.name || 'Unknown user'}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogs;
