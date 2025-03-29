import { useState, useEffect, useContext } from 'react';
import { DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PPTForm from '../../components/trainer/PPTForm';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';

export default function PPTManagement() {
  const { user } = useContext(AuthContext);
  const [ppts, setPPTs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPPTFormOpen, setIsPPTFormOpen] = useState(false);
  const [currentPPT, setCurrentPPT] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching PPTs and batches...');
        
        // Fetch batches first to ensure we have them for the form
        const batchesRes = await api.get('/batches');
        console.log('Batches fetched:', batchesRes.data);
        setBatches(batchesRes.data);
        
        // Then fetch PPTs
        const pptsRes = await api.get('/ppts');
        console.log('PPTs fetched:', pptsRes.data);
        setPPTs(pptsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter PPTs by selected batch
  const filteredPPTs = selectedBatch === 'all' 
    ? ppts 
    : ppts.filter(ppt => ppt.batch?._id === selectedBatch);

  const handleCreatePPT = () => {
    setCurrentPPT(null);
    setIsPPTFormOpen(true);
  };

  const handleEditPPT = (ppt) => {
    setCurrentPPT(ppt);
    setIsPPTFormOpen(true);
  };

  const handleDeletePPT = async (pptId) => {
    if (window.confirm('Are you sure you want to delete this PPT?')) {
      try {
        setLoading(true);
        console.log('Deleting PPT:', pptId);
        await api.delete(`/ppts/${pptId}`);
        setPPTs(ppts.filter(ppt => ppt._id !== pptId));
        toast.success('PPT deleted successfully');
      } catch (err) {
        console.error('Error deleting PPT:', err);
        toast.error(err.response?.data?.message || 'Error deleting PPT');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setIsPPTFormOpen(false);
  };

  const handlePPTFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Log form data for debugging (excluding file content)
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        if (key !== 'file' || !value.name) {
          formDataEntries[key] = value;
        } else {
          formDataEntries[key] = `File: ${value.name}`;
        }
      }
      console.log('Submitting form data:', formDataEntries);
      
      if (currentPPT) {
        // Update existing PPT
        console.log('Updating PPT:', currentPPT._id);
        const response = await api.put(`/ppts/${currentPPT._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        console.log('PPT updated:', response.data);
        setPPTs(ppts.map(ppt => ppt._id === currentPPT._id ? response.data : ppt));
        toast.success('PPT updated successfully');
      } else {
        // Create new PPT
        console.log('Creating new PPT');
        const response = await api.post('/ppts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        console.log('PPT created:', response.data);
        setPPTs([...ppts, response.data]);
        toast.success('PPT uploaded successfully');
      }
      
      setIsPPTFormOpen(false);
    } catch (err) {
      console.error('Error saving PPT:', err);
      toast.error(err.response?.data?.message || 'Error saving PPT');
    } finally {
      setLoading(false);
    }
  };

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
          
          <button 
            onClick={handleCreatePPT}
            className="btn-primary flex items-center"
          >
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
                      onClick={() => handleEditPPT(ppt)}
                      className="text-primary-400 hover:text-primary-300 mr-4"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePPT(ppt._id)}
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
          <button 
            onClick={handleCreatePPT}
            className="mt-4 btn-primary flex items-center mx-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Your First PPT
          </button>
        </div>
      )}

      {/* Pass proper props to PPTForm */}
      <PPTForm
        isOpen={isPPTFormOpen}
        onClose={handleCloseForm}
        onSubmit={handlePPTFormSubmit}
        ppt={currentPPT}
        batches={batches}
      />
    </div>
  );
}
