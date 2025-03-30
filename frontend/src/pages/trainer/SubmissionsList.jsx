import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ClipboardDocumentListIcon, 
  ArrowLeftIcon,
  DocumentIcon,
  UserCircleIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSubmissions, gradeSubmission } from '../../services/assignmentService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

export default function SubmissionsList() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAssignmentAndSubmissions = async () => {
      try {
        setLoading(true);
        
        // Fetch assignment details
        const assignmentResponse = await api.get(`/assignments/${id}`);
        const assignmentData = assignmentResponse.data;
        setAssignment(assignmentData);
        setBatchName(assignmentData.batch?.name || 'Unknown Batch');
        
        // Fetch submissions for this assignment
        const submissionsData = await getSubmissions(id);
        setSubmissions(submissionsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading assignment submissions:', err);
        setError(err.response?.data?.message || 'Failed to load submissions');
        setLoading(false);
      }
    };
    
    fetchAssignmentAndSubmissions();
  }, [id]);

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.marks || '');
    setFeedback(submission.feedback || '');
    setFeedbackImage(null);
    setImagePreview(submission.feedbackImage?.fileUrl || null);
    setIsGradingModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeedbackImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFeedbackImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!score) {
      toast.error('Please enter a score');
      return;
    }
    
    try {
      setLoadingGrade(true);
      // Make sure we're formatting the data correctly
      const updatedSubmission = await gradeSubmission(selectedSubmission._id, { 
        score: parseInt(score), // Make sure score is sent as a number
        feedback,
        feedbackImage
      });
      
      // Update the submissions state
      setSubmissions(submissions.map(sub => 
        sub._id === updatedSubmission._id ? updatedSubmission : sub
      ));
      
      setIsGradingModalOpen(false);
      toast.success('Submission graded successfully');
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error(err.response?.data?.message || 'Error grading submission');
    } finally {
      setLoadingGrade(false);
    }
  };

  // Filter submissions based on status and search term
  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesSearch = submission.student.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
              onClick={() => navigate('/trainer/assignments')}
              className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/trainer/assignments')}
          className="flex items-center text-primary-400 hover:text-primary-300 mr-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Assignments
        </button>
        <h1 className="text-2xl font-bold text-white">{assignment?.title} - Submissions</h1>
      </div>
      
      {/* Assignment Header */}
      {assignment && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{assignment.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center text-gray-400">
              <DocumentIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>Batch: {batchName}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <ClockIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>Deadline: {format(new Date(assignment.deadline), 'PPP')}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>Max Score: {assignment.maxMarks}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center">
              <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="input-field text-sm bg-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Submissions</option>
                <option value="submitted">Submitted</option>
                <option value="late">Late</option>
                <option value="graded">Graded</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Search by student name..."
              className="input-field text-sm bg-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="text-gray-400 text-sm">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'} found
          </div>
        </div>
      </div>
      
      {/* Submissions List */}
      {filteredSubmissions.length > 0 ? (
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Submission Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {submission.student?.name || 'Unknown Student'}
                    <div className="text-xs text-gray-400">{submission.student?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(submission.submittedAt), 'MMM dd, yyyy h:mm a')}
                    {submission.status === 'late' && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Late
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submission.status === 'graded' 
                        ? 'bg-green-100 text-green-800' 
                        : submission.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {submission.marks !== undefined ? `${submission.marks}/${assignment?.maxMarks}` : 'Not graded'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {submission.files && submission.files.map((file, index) => (
                        <a
                          key={index}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                          title={file.fileName}
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </a>
                      ))}
                      <button
                        onClick={() => handleGradeClick(submission)}
                        className="text-primary-400 hover:text-primary-300 ml-4"
                        title="Grade Submission"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <XMarkIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No Submissions Found</h3>
          <p className="text-gray-400 mt-2">
            {statusFilter !== 'all' || searchTerm
              ? 'Try changing your filters to see more results.'
              : 'There are no submissions for this assignment yet.'}
          </p>
        </div>
      )}
      
      {/* Grading Modal */}
      {isGradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Grade Submission</h2>
              <button 
                onClick={() => setIsGradingModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300">
                <span className="font-medium">Student:</span> {selectedSubmission.student.name}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Submitted:</span> {format(new Date(selectedSubmission.submittedAt), 'MMM dd, yyyy h:mm a')}
              </p>
            </div>
            
            <form onSubmit={handleGradeSubmit}>
              <div className="mb-4">
                <label htmlFor="score" className="block text-sm font-medium text-gray-300 mb-1">
                  Score (out of {assignment?.maxMarks})
                </label>
                <input
                  type="number"
                  id="score"
                  min="0"
                  max={assignment?.maxMarks}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Feedback Image (Optional)
                </label>
                
                {imagePreview ? (
                  <div className="mt-2 relative">
                    <img 
                      src={imagePreview} 
                      alt="Feedback preview" 
                      className="max-h-64 rounded-md mx-auto border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 rounded-full p-1 text-white hover:bg-red-500"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-gray-500"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-400 hover:text-primary-300">
                          <span>Upload an image</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md flex items-center"
                  disabled={loadingGrade}
                >
                  {loadingGrade ? <LoadingSpinner size="small" /> : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Submit Grade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
