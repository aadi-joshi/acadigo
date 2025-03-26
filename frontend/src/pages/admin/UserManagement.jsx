import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { getBatches } from '../../services/batchService';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserForm from '../../components/admin/UserForm';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, batchesData] = await Promise.all([
          getUsers(),
          getBatches()
        ]);
        setUsers(usersData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch users data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };
  
  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        // Update existing user
        const updatedUser = await updateUser(selectedUser._id, userData);
        setUsers(users.map(user => (user._id === selectedUser._id ? updatedUser : user)));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const newUser = await createUser(userData);
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };
  
  const filterUsers = () => {
    if (currentTab === 'all') return users;
    return users.filter(user => user.role === currentTab);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={handleAddUser}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add User
        </button>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['all', 'admin', 'trainer', 'student'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === tab
                  ? 'border-primary-400 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Users table */}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filterUsers().length > 0 ? (
              filterUsers().map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'trainer'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.role === 'student' 
                      ? batches.find(b => b._id === user.batch)?.name || 'No Batch'
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary-400 hover:text-primary-300 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* User Modal */}
      {isModalOpen && (
        <UserForm
          user={selectedUser}
          batches={batches}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
