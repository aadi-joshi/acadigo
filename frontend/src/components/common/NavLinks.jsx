import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';

const NavLinks = ({ onClickLink }) => {
  const { user } = useAuth();
  
  // Define route mapping for quick actions based on user role
  const getRouteForAction = (action) => {
    // For admin, map to appropriate routes
    if (user.role === 'admin') {
      switch (action) {
        case 'addUser': return '/admin/users';
        case 'createBatch': return '/trainer/batches';
        case 'uploadPPT': return '/trainer/ppts';
        case 'createAssignment': return '/trainer/assignments';
        default: return '/dashboard';
      }
    }
    
    // For trainer, use trainer routes
    if (user.role === 'trainer') {
      switch (action) {
        case 'createBatch': return '/trainer/batches';
        case 'uploadPPT': return '/trainer/ppts';
        case 'createAssignment': return '/trainer/assignments';
        default: return '/dashboard';
      }
    }
    
    return '/dashboard';
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {user.role === 'admin' && (
        <Link 
          to={getRouteForAction('addUser')}
          className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          onClick={onClickLink}
        >
          <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm text-white">Add User</span>
        </Link>
      )}
      
      {(user.role === 'admin' || user.role === 'trainer') && (
        <>
          <Link 
            to={getRouteForAction('createBatch')}
            className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={onClickLink}
          >
            <AcademicCapIcon className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm text-white">Create Batch</span>
          </Link>
          
          <Link 
            to={getRouteForAction('uploadPPT')}
            className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={onClickLink}
          >
            <DocumentTextIcon className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm text-white">Upload PPT</span>
          </Link>
          
          <Link 
            to={getRouteForAction('createAssignment')}
            className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={onClickLink}
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-amber-500 mb-2" />
            <span className="text-sm text-white">Create Assignment</span>
          </Link>
        </>
      )}
    </div>
  );
};

export default NavLinks;
