import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SubmissionModal from '../../components/student/SubmissionModal';
import { 
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  PaperAirplaneIcon,
  ArrowTopRightOnSquareIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { format, isPast, formatDistanceToNow } from 'date-fns';

export default function AssignmentView() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin and trainer to the correct page
    if (user && (user.role === 'admin' || user.role === 'trainer')) {
      navigate('/trainer/assignments');
      return;
    }

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        console.log('Fetching assignments...');
        
        // Use the proper API endpoint based on role
        let endpoint = '/assignments';
        if (user.role === 'trainer' || user.role === 'admin') {
          // For trainers and admins, we can use the same endpoint but may add query params if needed
          endpoint = '/assignments';
        }
        
        const { data } = await api.get(endpoint);
        console.log('Assignments fetched:', data);
        setAssignments(data);
        
        // Only fetch submissions for students
        if (user.role === 'student') {
          // Get submissions for each assignment
          const submissionsData = {};
          await Promise.all(data.map(async (assignment) => {
            try {
              // For students, we need to check if they've submitted something
              const res = await api.get('/submissions/my-submissions');
              const mySubmissions = res.data;
              
              // Find submissions for this particular assignment
              const assignmentSubmission = mySubmissions.find(
                sub => sub.assignment._id === assignment._id
              );
              
              if (assignmentSubmission) {
                submissionsData[assignment._id] = assignmentSubmission;
              }
            } catch (err) {
              console.error(`Error fetching submissions for assignment ${assignment._id}:`, err);
            }
          }));
          
          setSubmissions(submissionsData);
        }
        
        // If ID is provided in URL, select that specific assignment
        if (id) {
          const assignment = data.find(a => a._id === id);
          if (assignment) {
            setSelectedAssignment(assignment);
            // Log the view
            await api.post(`/logs/assignment/${id}/view`);
          }
        } else if (data.length > 0) {
          // Select the first assignment if no specific one is requested
          setSelectedAssignment(data[0]);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.response?.data?.message || 'Failed to fetch assignments');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAssignments();
    } else {
      setError('You must be logged in to view assignments');
      setLoading(false);
    }
  }, [id, isAuthenticated, user, navigate]);

  const handleAssignmentClick = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      // Log the view
      await api.post(`/logs/assignment/${assignment._id}/view`);
    } catch (err) {
      console.error('Error logging assignment view:', err);
    }
  };

  const handleDownload = async (e, assignment) => {
    e.stopPropagation();
    try {
      window.open(assignment.fileUrl, '_blank');
      // Log the download
      await api.post(`/logs/assignment/${assignment._id}/download`);
    } catch (err) {
      console.error('Error downloading assignment:', err);
    }
  };

  const handleSubmitAssignment = () => {
    if (selectedAssignment) {
      setShowSubmitModal(true);
    }
  };

  const handleSubmit = async (files) => {
    try {
      setLoading(true);
      
      // Create form data
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Submit assignment
      const { data } = await api.post(
        `/assignments/${selectedAssignment._id}/submit`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update submissions
      setSubmissions(prev => ({
        ...prev,
        [selectedAssignment._id]: data
      }));
      
      setShowSubmitModal(false);
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.description && assignment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort assignments by deadline (closest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)]">
      {/* Assignment List Sidebar */}
      <div className="w-full lg:w-1/3 bg-gray-800 rounded-xl p-4 overflow-hidden flex flex-col lg:mr-4 mb-4 lg:mb-0">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments..."
              className="w-full bg-gray-700 rounded-md py-2 pl-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-lg font-medium text-white mb-4">Assignments</h2>
        
        {sortedAssignments.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedAssignments.map((assignment) => {
              const isSubmitted = submissions[assignment._id];
              const isDeadlinePassed = isPast(new Date(assignment.deadline));
              const canSubmit = !isDeadlinePassed || assignment.allowResubmission;
              
              return (
                <div 
                  key={assignment._id} 
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedAssignment && selectedAssignment._id === assignment._id 
                      ? 'bg-primary-900 bg-opacity-20 border border-primary-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleAssignmentClick(assignment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-white">{assignment.title}</h3>
                        <div className="flex items-center mt-1">
                          <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className={`text-xs ${
                            isDeadlinePassed ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {isDeadlinePassed 
                              ? `Deadline passed: ${format(new Date(assignment.deadline), 'MMM dd, yyyy')}`
                              : `Due: ${format(new Date(assignment.deadline), 'MMM dd, yyyy')}`
                            }
                          </span>
                        </div>
                        
                        {/* Submission status */}
                        <div className="mt-1 flex items-center">
                          {isSubmitted ? (
                            <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-3 w-3 mr-1 text-red-500" />
                          )}
                          <span className="text-xs text-gray-400">
                            {isSubmitted ? 'Submitted' : 'Not submitted'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-center">
              {searchTerm ? 'No assignments match your search.' : 'No assignments available.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Assignment Detail View */}
      <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden flex flex-col">
        {selectedAssignment ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">{selectedAssignment.title}</h1>
              
              <div className="flex items-center mt-2 text-sm text-gray-400">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span className={`${isPast(new Date(selectedAssignment.deadline)) ? 'text-red-400' : ''}`}>
                  Due: {format(new Date(selectedAssignment.deadline), 'MMMM dd, yyyy h:mm a')}
                  {!isPast(new Date(selectedAssignment.deadline)) && (
                    <span className="ml-2 text-primary-400">
                      ({formatDistanceToNow(new Date(selectedAssignment.deadline), { addSuffix: true })})
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-between mt-4">
                <div className="mb-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 bg-opacity-20 text-blue-400">
                    Max Score: {selectedAssignment.maxMarks}
                  </span>
                  
                  {selectedAssignment.allowResubmission && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-900 bg-opacity-20 text-green-400">
                      Resubmission Allowed
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {selectedAssignment.fileUrl && (
                    <a
                      href={selectedAssignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
                      onClick={() => api.post(`/logs/assignment/${selectedAssignment._id}/download`)}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download Instructions
                    </a>
                  )}
                  
                  <button
                    onClick={handleSubmitAssignment}
                    disabled={isPast(new Date(selectedAssignment.deadline)) && !selectedAssignment.allowResubmission}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                    {submissions[selectedAssignment._id] ? 'Resubmit' : 'Submit Assignment'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {/* Assignment Description */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-white mb-2">Description</h2>
                <div className="bg-gray-700 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                  {selectedAssignment.description || 'No description provided.'}
                </div>
              </div>
              
              {/* Submission Status */}
              <div>
                <h2 className="text-lg font-medium text-white mb-2">Submission Status</h2>
                
                {submissions[selectedAssignment._id] ? (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-white font-medium">
                        Submitted on {format(new Date(submissions[selectedAssignment._id].submittedAt), 'MMMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                    
                    {submissions[selectedAssignment._id].status === 'late' && (
                      <div className="mt-2 text-yellow-400 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Late submission</span>
                      </div>
                    )}
                    
                    {submissions[selectedAssignment._id].status === 'graded' && (
                      <div className="mt-4 p-3 bg-gray-800 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Grade:</span>
                          <span className="text-primary-400 font-bold">
                            {submissions[selectedAssignment._id].marks}/{selectedAssignment.maxMarks}
                          </span>
                        </div>
                        
                        {submissions[selectedAssignment._id].feedback && (
                          <div className="mb-3">
                            <span className="text-gray-300">Feedback:</span>
                            <p className="mt-1 text-white whitespace-pre-wrap">{submissions[selectedAssignment._id].feedback}</p>
                          </div>
                        )}
                        
                        {submissions[selectedAssignment._id].feedbackImage && (
                          <div className="mt-3">
                            <span className="text-gray-300">Feedback Image:</span>
                            <div className="mt-2 bg-gray-900 p-2 rounded">
                              <img 
                                src={submissions[selectedAssignment._id].feedbackImage.fileUrl} 
                                alt="Feedback" 
                                className="max-h-64 rounded mx-auto"
                                onClick={() => window.open(submissions[selectedAssignment._id].feedbackImage.fileUrl, '_blank')}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <h3 className="text-white font-medium mt-4 mb-2">Submitted Files:</h3>
                    <ul className="space-y-2">
                      {submissions[selectedAssignment._id].files.map((file, index) => (
                        <li key={index} className="bg-gray-800 rounded p-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-gray-300">{file.fileName}</span>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300"
                          >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <XCircleIcon className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-300">You haven't submitted this assignment yet.</p>
                    {isPast(new Date(selectedAssignment.deadline)) && !selectedAssignment.allowResubmission ? (
                      <p className="text-red-400 mt-2">The deadline has passed and resubmission is not allowed.</p>
                    ) : (
                      <button
                        onClick={handleSubmitAssignment}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Submit Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No Assignment Selected</h2>
            <p className="text-gray-400 text-center max-w-md">
              Select an assignment from the list to view details and submit your work.
            </p>
          </div>
        )}
      </div>
      
      {/* Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onSubmit={handleSubmit}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}
