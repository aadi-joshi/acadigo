import { useState, useEffect } from 'react';
import { getBatches, createBatch, updateBatch, deleteBatch, addStudentToBatch, removeStudentFromBatch } from '../../services/batchService';
import { getUsers } from '../../services/userService';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BatchForm from '../../components/trainer/BatchForm';
import StudentAssignmentForm from '../../components/trainer/StudentAssignmentForm';
import { format } from 'date-fns';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [batchesData, studentsData] = await Promise.all([
          getBatches(),
          getUsers('student')
        ]);
        setBatches(batchesData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch batches data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddBatch = () => {
    setSelectedBatch(null);
    setIsBatchModalOpen(true);
  };
  
  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setIsBatchModalOpen(true);
  };
  
  const handleDeleteBatch = async (batchId) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteBatch(batchId);
        setBatches(batches.filter(batch => batch._id !== batchId));
        toast.success('Batch deleted successfully');
      } catch (error) {
        console.error('Error deleting batch:', error);
        toast.error('Failed to delete batch');
      }
    }
  };
  
  const handleManageStudents = (batch) => {
    setSelectedBatch(batch);
    setIsStudentModalOpen(true);
  };
  
  const handleSubmitBatch = async (batchData) => {
    try {
      if (selectedBatch) {
        // Update existing batch
        const updatedBatch = await updateBatch(selectedBatch._id, batchData);
        setBatches(batches.map(batch => (batch._id === selectedBatch._id ? updatedBatch : batch)));
        toast.success('Batch updated successfully');
      } else {
        // Create new batch
        const newBatch = await createBatch(batchData);
        setBatches([...batches, newBatch]);
        toast.success('Batch created successfully');
      }
      setIsBatchModalOpen(false);
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error(error.response?.data?.message || 'Failed to save batch');
    }
  };
  
  const handleAddStudent = async (studentId) => {
    try {
      await addStudentToBatch(selectedBatch._id, studentId);
      
      // Update the batches state
      const updatedBatches = batches.map(batch => {
        if (batch._id === selectedBatch._id) {
          return {
            ...batch,
            students: [...batch.students, studentId]
          };
        }
        return batch;
      });
      
      setBatches(updatedBatches);
      setSelectedBatch({
        ...selectedBatch,
        students: [...selectedBatch.students, studentId]
      });
      
      toast.success('Student added to batch successfully');
    } catch (error) {
      console.error('Error adding student to batch:', error);
      toast.error('Failed to add student to batch');
    }
  };
  
  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromBatch(selectedBatch._id, studentId);
      
      // Update the batches state
      const updatedBatches = batches.map(batch => {
        if (batch._id === selectedBatch._id) {
          return {
            ...batch,
            students: batch.students.filter(id => id !== studentId)
          };
        }
        return batch;
      });
      
      setBatches(updatedBatches);
      setSelectedBatch({
        ...selectedBatch,
        students: selectedBatch.students.filter(id => id !== studentId)
      });
      
      toast.success('Student removed from batch successfully');
    } catch (error) {
      console.error('Error removing student from batch:', error);
      toast.error('Failed to remove student from batch');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <button
          onClick={handleAddBatch}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Batch
        </button>
      </div>
      
      {/* Batches list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.length > 0 ? (
          batches.map((batch) => (
            <div key={batch._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{batch.name}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBatch(batch)}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batch._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{batch.description}</p>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400">Start Date</div>
                <div>{format(new Date(batch.startDate), 'MMM dd, yyyy')}</div>
              </div>
              
              {batch.endDate && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400">End Date</div>
                  <div>{format(new Date(batch.endDate), 'MMM dd, yyyy')}</div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="text-sm text-gray-400">Status</div>
                <div className={`text-${batch.isActive ? 'green' : 'red'}-400`}>
                  {batch.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Students</div>
                  <div className="text-primary-400">{batch.students.length}</div>
                </div>
              </div>
              
              <button
                onClick={() => handleManageStudents(batch)}
                className="btn-secondary w-full mt-4 flex items-center justify-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-1" />
                Manage Students
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400 py-8">
            No batches found. Click "Add Batch" to create your first batch.
          </div>
        )}
      </div>
      
      {/* Batch Form Modal */}
      {isBatchModalOpen && (
        <BatchForm
          batch={selectedBatch}
          onSubmit={handleSubmitBatch}
          onCancel={() => setIsBatchModalOpen(false)}
        />
      )}
      
      {/* Student Assignment Modal */}
      {isStudentModalOpen && selectedBatch && (
        <StudentAssignmentForm
          batch={selectedBatch}
          students={students}
          batchStudents={students.filter(student => 
            selectedBatch.students.includes(student._id)
          )}
          unassignedStudents={students.filter(student => 
            !selectedBatch.students.includes(student._id)
          )}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          onClose={() => setIsStudentModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BatchManagement;
