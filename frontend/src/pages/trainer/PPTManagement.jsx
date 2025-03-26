import { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PPTManagement() {
  const [ppts, setPPTs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch PPTs
        const pptsRes = await axios.get('/api/ppts');
        setPPTs(pptsRes.data);
        
        // Fetch batches
        const batchesRes = await axios.get('/api/batches');
        setBatches(batchesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter PPTs by selected batch
  const filteredPPTs = selectedBatch === 'all' 
    ? ppts 
    : ppts.filter(ppt => ppt.batch?._id === selectedBatch);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">PPT Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="input-field text-sm"
          >
            <option value="all">All Batches</option>
            {batches.map(batch => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
          
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload PPT
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {filteredPPTs.length > 0 ? (
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  PPT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Batch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredPPTs.map((ppt) => (
                <tr key={ppt._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-primary-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{ppt.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {ppt.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-900 bg-opacity-20 text-purple-400">
                      {ppt.batch?.name || 'Unknown batch'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(ppt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-primary-400 hover:text-primary-300 mr-4"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No PPTs Found</h3>
          <p className="text-gray-400">
            {selectedBatch === 'all' ? 
              "You haven't uploaded any PPTs yet." : 
              "No PPTs available for the selected batch."}
          </p>
          <button className="mt-4 btn-primary flex items-center mx-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Your First PPT
          </button>
        </div>
      )}
    </div>
  );
}
