import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

const StudentAssignmentForm = ({
  batch,
  batchStudents,
  unassignedStudents,
  onAddStudent,
  onRemoveStudent,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filterStudents = (students) => {
    if (!searchTerm) return students;
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredBatchStudents = filterStudents(batchStudents);
  const filteredUnassignedStudents = filterStudents(unassignedStudents);
  
  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full mx-auto p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              Manage Students in {batch.name}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search for students..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students in batch */}
            <div>
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
                        onClick={() => onRemoveStudent(student._id)}
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
                        onClick={() => onAddStudent(student._id)}
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
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default StudentAssignmentForm;
