import { useState } from 'react';
import ActivityLogs from '../../components/admin/ActivityLogs';

const ActivityLogsPage = () => {
  const [userFilter, setUserFilter] = useState(null);
  const [limit, setLimit] = useState(100);
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Activity Logs</h1>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="limit" className="block text-sm text-gray-400 mb-1">Records to show</label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-gray-700 text-white rounded-md border-gray-600 w-full sm:w-auto py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={200}>200 records</option>
              <option value={500}>500 records</option>
            </select>
          </div>
        </div>
      </div>
      
      <ActivityLogs userId={userFilter} limit={limit} />
    </div>
  );
};

export default ActivityLogsPage;
