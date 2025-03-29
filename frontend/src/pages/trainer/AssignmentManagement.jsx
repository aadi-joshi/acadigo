import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignmentForm from '../../components/trainer/AssignmentForm';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

export default function AssignmentManagement() {
  const { user } = useContext(AuthContext); // Add user context
  const [loading, setLoading] = useState(true);
  const [assignmentList, setAssignmentList] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch batches first - trainers should only see their batches
        const batchesRes = await api.get('/batches');
        console.log('Batches fetched:', batchesRes.data);
        setBatches(batchesRes.data);
        
        // Fetch assignments - by default will filter based on trainer's permissions
        const assignmentsRes = await api.get('/assignments');
        console.log('Assignments fetched:', assignmentsRes.data);
        setAssignmentList(assignmentsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter assignments by selected batch
  const filteredAssignments = selectedBatch === 'all'
    ? assignmentList
    : assignmentList.filter(a => a.batch?._id === selectedBatch);

  const handleCreateAssignment = () => {
    setCurrentAssignment(null);
    setIsFormOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/assignments/${assignmentId}`);
        setAssignmentList(assignmentList.filter(a => a._id !== assignmentId));
        toast.success('Assignment deleted successfully');
      } catch (err) {
        console.error('Error deleting assignment:', err);
        toast.error(err.response?.data?.message || 'Error deleting assignment');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (currentAssignment) {
        // Update existing assignment
        const response = await api.put(`/assignments/${currentAssignment._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setAssignmentList(assignmentList.map(a => a._id === currentAssignment._id ? response.data : a));
        toast.success('Assignment updated successfully');
      } else {
        // Create new assignment
        const response = await api.post('/assignments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setAssignmentList([...assignmentList, response.data]);
        toast.success('Assignment created successfully');
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving assignment:', err);
      toast.error(err.response?.data?.message || 'Error saving assignment');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Assignment Management</h1>
        
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
            onClick={handleCreateAssignment}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Assignment
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {filteredAssignments.length > 0 ? (
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Batch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Deadline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredAssignments.map((assignment) => {
                const isDeadlinePassed = new Date(assignment.deadline) < new Date();
                
                return (
                  <tr key={assignment._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white">{assignment.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {assignment.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-900 bg-opacity-20 text-purple-400">
                        {assignment.batch?.name || 'Unknown batch'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isDeadlinePassed ? 'text-red-400' : 'text-gray-300'}`}>
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDeadlinePassed 
                          ? 'bg-red-900 bg-opacity-20 text-red-400'
                          : 'bg-green-900 bg-opacity-20 text-green-400'
                      }`}>
                        {isDeadlinePassed ? 'Deadline Passed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/trainer/assignments/${assignment._id}/submissions`}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                        title="View Submissions"
                      >
                        <CheckBadgeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="text-primary-400 hover:text-primary-300 mr-4"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Assignments Found</h3>
          <p className="text-gray-400">
            {selectedBatch === 'all' ? 
              "You haven't created any assignments yet." : 
              "No assignments available for the selected batch."}
          </p>
          <button 
            onClick={handleCreateAssignment}
            className="mt-4 btn-primary flex items-center mx-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Assignment
          </button>
        </div>
      )}

      {isFormOpen && (
        <AssignmentForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          assignment={currentAssignment}
          batches={batches}
        />
      )}
    </div>
  );
}
