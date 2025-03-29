import { useState, useEffect } from 'react';
import { UserCircleIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import UserForm from '../../components/admin/UserForm';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users and batches on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);
        
        // Fetch batches for dropdown in form
        const batchesResponse = await axios.get('/api/batches');
        setBatches(batchesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchFields = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    return searchFields.includes(searchTerm.toLowerCase());
  });

  const handleCreateUser = () => {
    setCurrentUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (currentUser) {
        // Update existing user
        const response = await axios.put(`/api/users/${currentUser._id}`, userData);
        setUsers(users.map(user => user._id === currentUser._id ? response.data : user));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const response = await axios.post('/api/users', userData);
        setUsers([...users, response.data]);
        toast.success('User created successfully');
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.message || 'Error saving user');
    }
  };

  if (loading) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">User Management</h1>
        <button
          onClick={handleCreateUser}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="input w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-gray-300" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-900 bg-opacity-20 text-red-400' 
                        : user.role === 'trainer' 
                          ? 'bg-blue-900 bg-opacity-20 text-blue-400'
                          : 'bg-green-900 bg-opacity-20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.batch ? (
                      <span>{user.batch.name || 'Unknown batch'}</span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary-400 hover:text-primary-300 mr-4"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={currentUser}
        batches={batches}
      />
    </div>
  );
}
