import { useState, useEffect } from 'react';
import { getAssignments, submitAssignment, getStudentSubmissions } from '../../services/assignmentService';
import { toast } from 'react-toastify';
import { 
  ClipboardDocumentListIcon, 
  ArrowTopRightOnSquareIcon, 
  PaperClipIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import useAuth from '../../hooks/useAuth';
import SubmissionModal from '../../components/student/SubmissionModal';

const AssignmentView = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For students, only get assignments for their batch
        const assignmentsData = user.role === 'student' 
          ? await getAssignments(user.batch)
          : await getAssignments();
        
        // Get student's submissions
        const submissionsData = await getStudentSubmissions();
        
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to fetch assignments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (files) => {
    if (!files || files.length === 0) {
      toast.error('Please select at least one file to submit');
      return;
    }
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const submission = await submitAssignment(selectedAssignment._id, formData);
      
      // Update submissions state
      setSubmissions([...submissions, submission]);
      
      setIsModalOpen(false);
      toast.success('Assignment submitted successfully');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };
  
  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(submission => submission.assignment._id === assignmentId);
  };
  
  const getDeadlineStatus = (deadline) => {
    const deadlineDate = new Date(deadline);
    if (isPast(deadlineDate)) {
      return { status: 'passed', text: 'Deadline passed' };
    } else {
      return { 
        status: 'upcoming', 
        text: `Due in ${formatDistanceToNow(deadlineDate)}` 
      };
    }
  };
  
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>
      
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for assignments..."
          className="input w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Assignments grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const submission = getSubmissionForAssignment(assignment._id);
            const deadlineInfo = getDeadlineStatus(assignment.deadline);
            
            return (
              <div key={assignment._id} className="card flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-green-400 mr-2" />
                    <h2 className="text-lg font-semibold">{assignment.title}</h2>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 flex-grow">
                  {assignment.description || 'No description provided'}
                </p>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Deadline</div>
                  <div className="flex items-center">
                    <span>{format(new Date(assignment.deadline), 'MMM dd, yyyy h:mm a')}</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      deadlineInfo.status === 'passed' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deadlineInfo.status === 'passed' 
                        ? <ClockIcon className="h-3 w-3 mr-1" /> 
                        : <ClockIcon className="h-3 w-3 mr-1" />}
                      {deadlineInfo.text}
                    </span>
                  </div>
                </div>
                
                {submission && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400">Submission Status</div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        submission.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                      </span>
                      {submission.status === 'graded' && (
                        <span className="ml-2">
                          Score: {submission.score}/{assignment.maxScore}
                        </span>
                      )}
                    </div>
                    {submission.feedback && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-400">Feedback</div>
                        <p className="text-sm">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-auto">
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex-1 flex items-center justify-center"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-1" />
                    View
                  </a>
                  
                  {user.role === 'student' && deadlineInfo.status !== 'passed' && (
                    (!submission || assignment.allowResubmission) && (
                      <button
                        onClick={() => handleSubmitClick(assignment)}
                        className="btn-primary flex-1 flex items-center justify-center"
                      >
                        <PaperClipIcon className="h-5 w-5 mr-1" />
                        {submission ? 'Resubmit' : 'Submit'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {searchTerm 
            ? 'No assignments found matching your search'
            : 'No assignments available for you at the moment'}
        </div>
      )}
      
      {/* Submission Modal */}
      {isModalOpen && selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AssignmentView;
