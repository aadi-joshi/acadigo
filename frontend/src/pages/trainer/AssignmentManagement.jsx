import { useState, useEffect } from 'react';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getSubmissions } from '../../services/assignmentService';
import { getBatches } from '../../services/batchService';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon, ArrowTopRightOnSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignmentForm from '../../components/trainer/AssignmentForm';
import SubmissionsView from '../../components/trainer/SubmissionsView';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentsData, batchesData] = await Promise.all([
          getAssignments(),
          getBatches()
        ]);
        setAssignments(assignmentsData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch assignments data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setIsFormModalOpen(true);
  };
  
  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsFormModalOpen(true);
  };
  
  const handleDeleteAssignment = async (assignmentId) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(assignmentId);
        setAssignments(assignments.filter(a => a._id !== assignmentId));
        toast.success('Assignment deleted successfully');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };
  
  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsModalOpen(true);
  };
  
  const handleSubmit = async (formData) => {
    try {
      if (selectedAssignment) {
        // Update existing assignment
        const updatedAssignment = await updateAssignment(selectedAssignment._id, formData);
        setAssignments(assignments.map(a => (a._id === selectedAssignment._id ? updatedAssignment : a)));
        toast.success('Assignment updated successfully');
      } else {
        // Create new assignment
        const newAssignment = await createAssignment(formData);
        setAssignments([...assignments, newAssignment]);
        toast.success('Assignment created successfully');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    }
  };
  
  const filteredAssignments = selectedBatch === 'all' 
    ? assignments 
    : assignments.filter(a => a.batch === selectedBatch);
  
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Management</h1>
        <button
          onClick={handleAddAssignment}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Create Assignment
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
      
      {/* Assignments list */}
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
                Deadline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {assignment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {batches.find(batch => batch._id === assignment.batch)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(assignment.deadline), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isDeadlinePassed(assignment.deadline) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isDeadlinePassed(assignment.deadline) ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewSubmissions(assignment)}
                      className="text-purple-400 hover:text-purple-300 mr-4"
                      title="View Submissions"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                    </button>
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 mr-4"
                      title="View"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                  No assignments found. Click "Create Assignment" to add a new assignment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Assignment Form Modal */}
      {isFormModalOpen && (
        <AssignmentForm
          assignment={selectedAssignment}
          batches={batches}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      )}
      
      {/* Submissions Modal */}
      {isSubmissionsModalOpen && selectedAssignment && (
        <SubmissionsView
          assignment={selectedAssignment}
          batchName={batches.find(batch => batch._id === selectedAssignment.batch)?.name || 'Unknown'}
          onClose={() => setIsSubmissionsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AssignmentManagement;
