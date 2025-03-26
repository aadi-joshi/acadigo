import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getPPTs } from '../services/pptService';
import { getAssignments } from '../services/assignmentService';
import { getBatches } from '../services/batchService';
import { getStudentSubmissions } from '../services/assignmentService';
import { format } from 'date-fns';
import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ppts, setPpts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Common data for all roles
        let pptData = [];
        let assignmentData = [];
        
        // Role-specific data
        if (user.role === 'admin' || user.role === 'trainer') {
          const batchesResponse = await getBatches();
          setBatches(batchesResponse);
          
          // For admin and trainer, get all PPTs and assignments
          pptData = await getPPTs();
          assignmentData = await getAssignments();
        } else if (user.role === 'student') {
          // For students, get their submissions
          const submissionsData = await getStudentSubmissions();
          setSubmissions(submissionsData);
          
          // For students, get PPTs and assignments for their batch
          pptData = await getPPTs(user.batch);
          assignmentData = await getAssignments(user.batch);
        }
        
        setPpts(pptData);
        setAssignments(assignmentData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick stats cards */}
        <div className="card">
          <div className="flex items-center mb-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold">PPTs</h2>
          </div>
          <p className="text-3xl font-bold">{ppts.length}</p>
          <Link to="/ppts" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
            View all PPTs
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-green-400 mr-2" />
            <h2 className="text-lg font-semibold">Assignments</h2>
          </div>
          <p className="text-3xl font-bold">{assignments.length}</p>
          <Link to="/assignments" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
            View all assignments
          </Link>
        </div>
        
        {(user.role === 'admin' || user.role === 'trainer') && (
          <div className="card">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-lg font-semibold">Batches</h2>
            </div>
            <p className="text-3xl font-bold">{batches.length}</p>
            <Link to="/trainer/batches" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
              Manage batches
            </Link>
          </div>
        )}
        
        {user.role === 'student' && (
          <div className="card">
            <div className="flex items-center mb-2">
              <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-400 mr-2" />
              <h2 className="text-lg font-semibold">My Submissions</h2>
            </div>
            <p className="text-3xl font-bold">{submissions.length}</p>
            <Link to="/assignments" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
              View my submissions
            </Link>
          </div>
        )}
      </div>
      
      {/* Recent items sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent PPTs</h2>
          {ppts.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {ppts.slice(0, 5).map((ppt) => (
                <li key={ppt._id} className="py-3">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">{ppt.title}</h3>
                      <p className="text-sm text-gray-400">
                        Uploaded: {format(new Date(ppt.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No PPTs available</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {user.role === 'student' ? 'Upcoming Assignments' : 'Recent Assignments'}
          </h2>
          {assignments.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {assignments.slice(0, 5).map((assignment) => (
                <li key={assignment._id} className="py-3">
                  <div className="flex items-start">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-gray-400">
                        Deadline: {format(new Date(assignment.deadline), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No assignments available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
