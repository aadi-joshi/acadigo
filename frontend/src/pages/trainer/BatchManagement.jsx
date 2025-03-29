import { useState, useEffect, useContext } from 'react';
import { AcademicCapIcon, PlusIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import BatchForm from '../../components/trainer/BatchForm';
import StudentAssignmentForm from '../../components/trainer/StudentAssignmentForm';
import AuthContext from '../../context/AuthContext';

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/batches');
        setBatches(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching batches');
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    const searchText = `${batch.name} ${batch.description || ''}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const handleCreateBatch = () => {
    setCurrentBatch(null);
    setIsBatchFormOpen(true);
  };

  const handleEditBatch = (batch) => {
    setCurrentBatch(batch);
    setIsBatchFormOpen(true);
  };

  const handleManageStudents = (batch) => {
    setCurrentBatch(batch);
    setIsStudentFormOpen(true);
  };

  const handleViewDetails = (batchId) => {
    navigate(`/trainer/batches/${batchId}`);
  };

  const handleBatchFormSubmit = async (batchData) => {
    try {
      if (currentBatch) {
        // Update existing batch
        const response = await axios.put(`/api/batches/${currentBatch._id}`, batchData);
        setBatches(batches.map(batch => batch._id === currentBatch._id ? response.data : batch));
        toast.success('Batch updated successfully');
      } else {
        // Create new batch
        const data = {
          ...batchData,
          trainer: user.role === 'admin' ? batchData.trainer : user._id
        };
        const response = await axios.post('/api/batches', data);
        setBatches([...batches, response.data]);
        toast.success('Batch created successfully');
      }
      
      setIsBatchFormOpen(false);
    } catch (err) {
      console.error('Error saving batch:', err);
      toast.error(err.response?.data?.message || 'Error saving batch');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Batch Management</h1>
        <button
          onClick={handleCreateBatch}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Batch
        </button>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search batches..."
          className="input w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <div key={batch._id} className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white truncate">{batch.name}</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    batch.active 
                      ? 'bg-green-900 bg-opacity-20 text-green-400' 
                      : 'bg-red-900 bg-opacity-20 text-red-400'
                  }`}>
                    {batch.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 mt-1 line-clamp-2">{batch.description || 'No description provided'}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(batch.startDate)} - {batch.endDate ? formatDate(batch.endDate) : 'Ongoing'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{batch.studentCount || 0} Students</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 bg-gray-750 p-4 flex justify-between">
                <button 
                  onClick={() => handleManageStudents(batch)}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Manage Students
                </button>
                <button 
                  onClick={() => handleViewDetails(batch._id)}
                  className="text-sm text-gray-300 hover:text-white"
                >
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
          <button 
            onClick={handleCreateBatch}
            className="mt-4 btn-primary"
          >
            Create Your First Batch
          </button>
        </div>
      )}
      
      <BatchForm 
        isOpen={isBatchFormOpen}
        onClose={() => setIsBatchFormOpen(false)}
        onSubmit={handleBatchFormSubmit}
        batch={currentBatch}
      />
      
      {currentBatch && (
        <StudentAssignmentForm
          isOpen={isStudentFormOpen}
          onClose={() => setIsStudentFormOpen(false)}
          batchId={currentBatch._id}
        />
      )}
    </div>
  );
}
