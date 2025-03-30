import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api'; // Import the configured API service
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BatchForm from '../../components/trainer/BatchForm';
import StudentAssignmentForm from '../../components/trainer/StudentAssignmentForm';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [ppts, setPPTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        
        // Fetch batch details - using api service instead of axios
        const batchResponse = await api.get(`/batches/${id}`);
        setBatch(batchResponse.data);
        
        // Fetch students in batch - explicitly ask for full profile data
        const studentsResponse = await api.get(`/batches/${id}/students?includeProfile=true`);
        setStudents(studentsResponse.data);
        
        // Fetch assignments for this batch - using api service instead of axios
        const assignmentsResponse = await api.get(`/assignments?batchId=${id}`);
        setAssignments(assignmentsResponse.data);
        
        // Fetch PPTs for this batch - using api service instead of axios
        const pptsResponse = await api.get(`/ppts?batchId=${id}`);
        setPPTs(pptsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching batch data:', err);
        setError(err.response?.data?.message || 'Failed to load batch details');
        setLoading(false);
      }
    };
    
    fetchBatchData();
  }, [id]);
  
  const handleEditBatch = async () => {
    try {
      // If admin, fetch list of trainers for the dropdown
      if (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'admin') {
        // Use api service instead of axios
        const trainersResponse = await api.get('/users?role=trainer');
        setTrainers(trainersResponse.data);
      }
      
      setIsEditFormOpen(true);
    } catch (err) {
      console.error('Error preparing edit form:', err);
      toast.error('Failed to prepare edit form');
    }
  };
  
  const handleBatchUpdate = async (formData) => {
    try {
      // Use api service instead of axios
      const response = await api.put(`/batches/${id}`, formData);
      setBatch(response.data);
      toast.success('Batch updated successfully');
      setIsEditFormOpen(false);
    } catch (err) {
      console.error('Error updating batch:', err);
      toast.error(err.response?.data?.message || 'Error updating batch');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Enhanced resume link display with error handling
  const renderResumeLink = (student) => {
    if (!student.resume) return <div className="text-sm text-gray-400">-</div>;
    
    try {
      return student.resume.fileUrl ? (
        <a 
          href={student.resume.fileUrl}
          target="_blank"
          rel="noopener noreferrer" 
          className="text-primary-400 hover:text-primary-300 flex items-center"
          onClick={() => logResumeView(student._id)}
        >
          <DocumentIcon className="h-4 w-4 mr-1" />
          View
        </a>
      ) : (
        <div className="text-sm text-gray-400">Upload pending</div>
      );
    } catch (e) {
      console.error("Error rendering resume link:", e);
      return <div className="text-sm text-red-400">Error loading resume</div>;
    }
  };

  // Log when a resume is viewed
  const logResumeView = async (studentId) => {
    try {
      await api.post(`/logs/user/${studentId}/resume/view`);
    } catch (err) {
      console.error("Failed to log resume view:", err);
      // Non-critical error, don't show to user
    }
  };
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md">
          {error}
          <div className="mt-4">
            <button
              onClick={() => navigate('/trainer/batches')}
              className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
            >
              Back to Batches
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!batch) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="text-white">Batch not found.</div>
        <button
          onClick={() => navigate('/trainer/batches')}
          className="mt-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
        >
          Back to Batches
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/trainer/batches')}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Batches
        </button>
      </div>
      
      {/* Batch Header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-primary-500" />
              {batch.name}
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                batch.active 
                  ? 'bg-green-900 bg-opacity-20 text-green-400' 
                  : 'bg-red-900 bg-opacity-20 text-red-400'
              }`}>
                {batch.active ? 'Active' : 'Inactive'}
              </span>
            </h1>
            {batch.description && (
              <p className="mt-2 text-gray-300">{batch.description}</p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setIsStudentFormOpen(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Manage Students
            </button>
            <button
              onClick={handleEditBatch}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit Batch
            </button>
          </div>
        </div>
        
        {/* Batch Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-gray-300 font-medium">Dates</h3>
            </div>
            <div className="mt-2">
              <div className="text-sm"><span className="text-gray-400">Start:</span> {formatDate(batch.startDate)}</div>
              <div className="text-sm"><span className="text-gray-400">End:</span> {batch.endDate ? formatDate(batch.endDate) : 'Ongoing'}</div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-gray-300 font-medium">Students</h3>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-white">{students.length}</div>
              <div className="text-sm text-gray-400">enrolled in this batch</div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-gray-300 font-medium">Materials</h3>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-2xl font-bold text-white">{ppts.length}</div>
                <div className="text-sm text-gray-400">PPTs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{assignments.length}</div>
                <div className="text-sm text-gray-400">Assignments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students List */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Enrolled Students</h2>
          <button
            onClick={() => setIsStudentFormOpen(true)}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            Manage Students
          </button>
        </div>
        
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {students.map(student => (
                  <tr key={student._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.photo?.fileUrl ? (
                        <img 
                          src={student.photo.fileUrl} 
                          alt={student.name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{student.contactNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.parentName ? (
                        <div>
                          <div className="text-sm text-gray-300">{student.parentName}</div>
                          <div className="text-xs text-gray-400">{student.parentContactNumber || '-'}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderResumeLink(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.active
                          ? 'bg-green-900 bg-opacity-20 text-green-400'
                          : 'bg-red-900 bg-opacity-20 text-red-400'
                      }`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            No students enrolled in this batch yet.
          </div>
        )}
      </div>
      
      {/* Learning Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PPTs */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">PPTs</h2>
            <Link to="/trainer/ppts" className="text-sm text-primary-400 hover:text-primary-300">
              Manage PPTs
            </Link>
          </div>
          
          {ppts.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {ppts.slice(0, 5).map(ppt => (
                <li key={ppt._id} className="py-3">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-primary-500 mt-0.5 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-white">{ppt.title}</div>
                      <div className="text-xs text-gray-400">
                        Added on {new Date(ppt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {ppts.length > 5 && (
                <li className="py-3 text-center">
                  <Link to="/trainer/ppts" className="text-sm text-primary-400 hover:text-primary-300">
                    View all {ppts.length} PPTs
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No PPTs added to this batch yet.
            </div>
          )}
        </div>
        
        {/* Assignments */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Assignments</h2>
            <Link to="/trainer/assignments" className="text-sm text-primary-400 hover:text-primary-300">
              Manage Assignments
            </Link>
          </div>
          
          {assignments.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {assignments.slice(0, 5).map(assignment => (
                <li key={assignment._id} className="py-3">
                  <div className="flex items-start">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-white">{assignment.title}</div>
                      <div className="text-xs text-gray-400">
                        Due on {new Date(assignment.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {assignments.length > 5 && (
                <li className="py-3 text-center">
                  <Link to="/trainer/assignments" className="text-sm text-primary-400 hover:text-primary-300">
                    View all {assignments.length} assignments
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No assignments added to this batch yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {isEditFormOpen && (
        <BatchForm
          batch={batch}
          trainers={trainers}
          onSubmit={handleBatchUpdate}
          onCancel={() => setIsEditFormOpen(false)}
        />
      )}
      
      {isStudentFormOpen && (
        <StudentAssignmentForm
          isOpen={isStudentFormOpen}
          onClose={() => setIsStudentFormOpen(false)}
          batchId={id}
        />
      )}
    </div>
  );
}
