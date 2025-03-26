import { useState, useEffect } from 'react';
import { getPPTs, uploadPPT, updatePPT, deletePPT } from '../../services/pptService';
import { getBatches } from '../../services/batchService';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PPTForm from '../../components/trainer/PPTForm';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';

const PPTManagement = () => {
  const { user } = useAuth();
  const [ppts, setPpts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPPT, setSelectedPPT] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pptsData, batchesData] = await Promise.all([
          getPPTs(),
          getBatches()
        ]);
        setPpts(pptsData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch PPTs data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddPPT = () => {
    setSelectedPPT(null);
    setIsModalOpen(true);
  };
  
  const handleEditPPT = (ppt) => {
    setSelectedPPT(ppt);
    setIsModalOpen(true);
  };
  
  const handleDeletePPT = async (pptId) => {
    if (confirm('Are you sure you want to delete this PPT?')) {
      try {
        await deletePPT(pptId);
        setPpts(ppts.filter(ppt => ppt._id !== pptId));
        toast.success('PPT deleted successfully');
      } catch (error) {
        console.error('Error deleting PPT:', error);
        toast.error('Failed to delete PPT');
      }
    }
  };
  
  const handleSubmit = async (formData) => {
    try {
      if (selectedPPT) {
        // Update existing PPT
        const updatedPPT = await updatePPT(selectedPPT._id, formData);
        setPpts(ppts.map(ppt => (ppt._id === selectedPPT._id ? updatedPPT : ppt)));
        toast.success('PPT updated successfully');
      } else {
        // Create new PPT
        const newPPT = await uploadPPT(formData);
        setPpts([...ppts, newPPT]);
        toast.success('PPT uploaded successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving PPT:', error);
      toast.error(error.response?.data?.message || 'Failed to save PPT');
    }
  };
  
  const filteredPPTs = selectedBatch === 'all' 
    ? ppts 
    : ppts.filter(ppt => ppt.batch === selectedBatch);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PPT Management</h1>
        <button
          onClick={handleAddPPT}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Upload PPT
        </button>
      </div>
      
      {/* Batch filter */}
      <div className="mb-6">
        <label htmlFor="batch-filter" className="label">
          Filter by Batch
        </label>
        <select
          id="batch-filter"
          className="select w-full md:w-64"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="all">All Batches</option>
          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* PPTs list */}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Uploaded
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Views
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredPPTs.length > 0 ? (
              filteredPPTs.map((ppt) => (
                <tr key={ppt._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {ppt.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {batches.find(batch => batch._id === ppt.batch)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(ppt.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {ppt.accessCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={ppt.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 mr-4"
                      title="View"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                  No PPTs found. Click "Upload PPT" to add your first presentation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* PPT Form Modal */}
      {isModalOpen && (
        <PPTForm
          ppt={selectedPPT}
          batches={batches}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PPTManagement;
