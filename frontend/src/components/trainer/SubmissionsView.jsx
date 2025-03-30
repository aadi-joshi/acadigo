import { useState, useEffect, useRef } from 'react';
import { getSubmissions, gradeSubmission } from '../../services/assignmentService';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ArrowTopRightOnSquareIcon, PhotoIcon, XCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
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
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
      const updatedSubmission = await gradeSubmission(selectedSubmission._id, {
        score,
        feedback,
        feedbackImage,
      });

      setSubmissions(
        submissions.map((sub) =>
          sub._id === updatedSubmission._id ? updatedSubmission : sub
        )
      );

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
                          <div className="flex items-center">
                            {submission.student?.photo?.fileUrl ? (
                              <img 
                                src={submission.student.photo.fileUrl} 
                                alt={submission.student.name} 
                                className="h-8 w-8 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                            )}
                            <div>
                              <div>{submission.student.name}</div>
                              <div className="text-xs text-gray-400">{submission.student.email}</div>
                              {submission.student?.contactNumber && (
                                <div className="text-xs text-gray-400">{submission.student.contactNumber}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(submission.submittedAt), 'MMM dd, yyyy h:mm a')}
                          {submission.status === 'late' && (
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
                          {submission.marks !== undefined ? `${submission.marks}/${assignment.maxMarks}` : 'Not graded'}
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
                    Score (out of {assignment.maxMarks})
                  </label>
                  <input
                    id="score"
                    type="number"
                    min="0"
                    max={assignment.maxMarks}
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

                <div className="mb-4">
                  <label className="label">
                    Feedback Image (Optional)
                  </label>

                  {imagePreview ? (
                    <div className="mt-2 relative">
                      <img 
                        src={imagePreview} 
                        alt="Feedback preview" 
                        className="max-h-48 rounded-md mx-auto border border-gray-600"
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
