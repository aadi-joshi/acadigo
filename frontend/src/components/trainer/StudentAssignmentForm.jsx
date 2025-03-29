import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify'; // Make sure react-toastify is installed: npm install react-toastify

const StudentAssignmentForm = ({ isOpen, onClose, batchId }) => {
  const [batchStudents, setBatchStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [searchBatchTerm, setSearchBatchTerm] = useState('');
  const [searchUnassignedTerm, setSearchUnassignedTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !batchId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch students currently in the batch
        const batchStudentsResponse = await axios.get(`/api/batches/${batchId}/students`);
        setBatchStudents(batchStudentsResponse.data);
        
        // Fetch all students without a batch or that could be reassigned
        const unassignedResponse = await axios.get('/api/users?role=student&unassigned=true');
        setUnassignedStudents(unassignedResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching students');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isOpen, batchId]);

  const filteredBatchStudents = batchStudents.filter(student => {
    const searchText = `${student.name} ${student.email}`.toLowerCase();
    return searchText.includes(searchBatchTerm.toLowerCase());
  });
  
  const filteredUnassignedStudents = unassignedStudents.filter(student => {
    const searchText = `${student.name} ${student.email}`.toLowerCase();
    return searchText.includes(searchUnassignedTerm.toLowerCase());
  });

  const handleAddStudent = async (studentId) => {
    try {
      await axios.post(`/api/batches/${batchId}/students`, { studentId });
      
      // Update local state
      const student = unassignedStudents.find(s => s._id === studentId);
      setBatchStudents([...batchStudents, student]);
      setUnassignedStudents(unassignedStudents.filter(s => s._id !== studentId));
      
      toast.success('Student added to batch successfully');
    } catch (err) {
      console.error('Error adding student to batch:', err);
      toast.error(err.response?.data?.message || 'Error adding student to batch');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/batches/${batchId}/students/${studentId}`);
      
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
          
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students in batch */}
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search students in batch..."
                    className="input w-full"
                    value={searchBatchTerm}
                    onChange={(e) => setSearchBatchTerm(e.target.value)}
                  />
                </div>
                
                <h3 className="text-lg font-medium mb-3">Students in Batch</h3>
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
                  <p className="text-gray-400">No students in this batch</p>
                )}
              </div>
              
              {/* Unassigned students */}
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search available students..."
                    className="input w-full"
                    value={searchUnassignedTerm}
                    onChange={(e) => setSearchUnassignedTerm(e.target.value)}
                  />
                </div>
                
                <h3 className="text-lg font-medium mb-3">Available Students</h3>
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
            </div>
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
