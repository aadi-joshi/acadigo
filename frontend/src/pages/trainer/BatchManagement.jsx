import { useState, useEffect } from 'react';
import axios from 'axios';
import { PencilIcon, UserGroupIcon, PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/batches');
        setBatches(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch batches');
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Batch Management</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Batch
        </button>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch._id} className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-purple-900 bg-opacity-20 p-3 rounded-full mr-4">
                      <AcademicCapIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{batch.name}</h3>
                      <p className="text-sm text-gray-400">Started: {new Date(batch.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="text-primary-400 hover:text-primary-300">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {batch.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center text-sm text-gray-400">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span>{batch.studentCount || 0} Students</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 bg-gray-750 p-4 flex justify-between">
                <button className="text-sm text-primary-400 hover:text-primary-300">
                  Manage Students
                </button>
                <button className="text-sm text-gray-300 hover:text-white">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <AcademicCapIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Batches Found</h3>
          <p className="text-gray-400">
            You don't have any batches yet. Create your first batch to start managing students.
          </p>
          <button className="mt-4 btn-primary">
            Create Your First Batch
          </button>
        </div>
      )}
    </div>
  );
}
