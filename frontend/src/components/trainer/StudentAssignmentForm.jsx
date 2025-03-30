import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Import the configured API service

const StudentAssignmentForm = ({ isOpen, onClose, batchId }) => {
  const [batchStudents, setBatchStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Use the api service with proper endpoint and parameters
        const batchStudentsRes = await api.get(`/batches/${batchId}/students`);
        setBatchStudents(batchStudentsRes.data);
        
        // Make sure we get all unassigned students plus exclude current batch
        const allStudentsRes = await api.get(`/users?role=student&unassigned=true&excludeBatch=${batchId}`);
        setUnassignedStudents(allStudentsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || 'Failed to load students');
        setLoading(false);
      }
    };
    
    if (isOpen && batchId) {
      fetchData();
    }
  }, [isOpen, batchId]);

  // Filter students based on search term
  const filteredBatchStudents = batchStudents.filter(student => {
    const searchFields = `${student.name} ${student.email}`.toLowerCase();
    return searchFields.includes(searchTerm.toLowerCase());
  });

  const filteredUnassignedStudents = unassignedStudents.filter(student => {
    const searchFields = `${student.name} ${student.email}`.toLowerCase();
    return searchFields.includes(searchTerm.toLowerCase());
  });

  const handleAddStudent = async (studentId) => {
    try {
      setError(null); // Clear any errors
      
      // Add loading indicator for better UX
      const studentIndex = unassignedStudents.findIndex(s => s._id === studentId);
      if (studentIndex === -1) return;
      
      // Optimistic UI update
      const student = unassignedStudents[studentIndex];
      setBatchStudents(prev => [...prev, student]);
      setUnassignedStudents(prev => prev.filter(s => s._id !== studentId));
      
      // Make the API call
      await api.post(`/batches/${batchId}/students`, { studentId });
      toast.success('Student added to batch successfully');
    } catch (err) {
      console.error('Error adding student to batch:', err);
      toast.error(err.response?.data?.message || 'Error adding student to batch');
      
      // Revert the optimistic update
      fetchData();
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      // Use the api service instead of axios
      await api.delete(`/batches/${batchId}/students/${studentId}`);
      
      // Update local state
      const student = batchStudents.find(s => s._id === studentId);
      setUnassignedStudents([...unassignedStudents, student]);
      setBatchStudents(batchStudents.filter(s => s._id !== studentId));
      
      toast.success('Student removed from batch successfully');
    } catch (err) {
      console.error('Error removing student from batch:', err);
      toast.error(err.response?.data?.message || 'Error removing student from batch');
    }
  };

  // Helper function to reload data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const batchStudentsRes = await api.get(`/batches/${batchId}/students`);
      setBatchStudents(batchStudentsRes.data);
      
      const allStudentsRes = await api.get(`/users?role=student&unassigned=true&excludeBatch=${batchId}`);
      setUnassignedStudents(allStudentsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-gray-800 p-6">
          <Dialog.Title className="text-xl font-semibold text-white mb-4">
            Manage Students in Batch
          </Dialog.Title>
          
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'assigned' 
                  ? 'text-primary-400 border-b-2 border-primary-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned Students ({batchStudents.length})
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'unassigned' 
                  ? 'text-primary-400 border-b-2 border-primary-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('unassigned')}
            >
              Available Students ({unassignedStudents.length})
            </button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <div className="loader mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading students...</p>
            </div>
          ) : (
            activeTab === 'assigned' ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Students in Batch</h3>
                {filteredBatchStudents.length > 0 ? (
                  <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                    {filteredBatchStudents.map(student => (
                      <li key={student._id} className="py-3 px-2 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-400">{student.email}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          className="text-red-400 hover:text-red-300"
                          title="Remove from batch"
                        >
                          <UserMinusIcon className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No students currently assigned to this batch</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Available Students</h3>
                {filteredUnassignedStudents.length > 0 ? (
                  <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                    {filteredUnassignedStudents.map(student => (
                      <li key={student._id} className="py-3 px-2 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-400">{student.email}</div>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student._id)}
                          className="text-green-400 hover:text-green-300"
                          title="Add to batch"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No available students to add</p>
                )}
              </div>
            )
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
            >
              Done
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StudentAssignmentForm;
