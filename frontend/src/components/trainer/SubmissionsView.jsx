import { useState, useEffect } from 'react';
import { getSubmissions, gradeSubmission } from '../../services/assignmentService';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const SubmissionsView = ({ assignment, batchName, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsData = await getSubmissions(assignment._id);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [assignment._id]);
  
  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || '');
    setFeedback(submission.feedback || '');
    setIsGradingModalOpen(true);
  };
  
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!score) {
      toast.error('Please enter a score');
      return;
    }
    
    try {
      const updatedSubmission = await gradeSubmission(selectedSubmission._id, { 
        score, 
        feedback 
      });
      
      // Update the submissions state
      setSubmissions(submissions.map(sub => 
        sub._id === updatedSubmission._id ? updatedSubmission : sub
      ));
      
      setIsGradingModalOpen(false);
      toast.success('Submission graded successfully');
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    }
  };
  
  if (loading) {
    return (
      <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full mx-auto p-6 shadow-xl">
            <LoadingSpinner />
          </div>
        </div>
      </Dialog>
    );
  }
  
  return (
    <>
      <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full mx-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold">
                Submissions for {assignment.title}
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-400">Batch</div>
              <div className="font-medium">{batchName}</div>
            </div>
            
            {submissions.length > 0 ? (
              <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
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
                    {submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {submission.student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(submission.submissionTime), 'MMM dd, yyyy h:mm a')}
                          {submission.isLate && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Late
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            submission.status === 'graded' 
                              ? 'bg-green-100 text-green-800' 
                              : submission.status === 'resubmitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.score !== null ? `${submission.score}/${assignment.maxScore}` : 'Not graded'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            {submission.files.map((file, index) => (
                              <a
                                key={index}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                                title={file.fileName}
                              >
                                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
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
              <div className="text-center text-gray-400 py-8">
                No submissions found for this assignment yet.
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      
      {/* Grading Modal */}
      {isGradingModalOpen && selectedSubmission && (
        <Dialog open={true} onClose={() => setIsGradingModalOpen(false)} className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            
            <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-bold">
                  Grade Submission
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400">Student</div>
                <div className="font-medium">{selectedSubmission.student.name}</div>
              </div>
              
              <form onSubmit={handleGradeSubmit}>
                <div className="mb-4">
                  <label htmlFor="score" className="label">
                    Score (out of {assignment.maxScore})
                  </label>
                  <input
                    id="score"
                    type="number"
                    min="0"
                    max={assignment.maxScore}
                    className="input w-full"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="feedback" className="label">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    className="input w-full h-24"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsGradingModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Submit Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SubmissionsView;
