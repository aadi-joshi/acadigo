import { useState, useEffect } from 'react';
import { UserCircleIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import UserForm from '../../components/admin/UserForm';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [batches, setBatches] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users and batches on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data);
        
        const batchesResponse = await api.get('/batches');
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

  // Enhanced filtering logic with multiple criteria
  const filteredUsers = users.filter(user => {
    const searchFields = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesBatch = batchFilter === 'all' || 
      (batchFilter === 'none' && (!user.batch)) ||
      (user.batch && user.batch._id === batchFilter);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.active !== false) || 
      (statusFilter === 'inactive' && user.active === false);
    
    return matchesSearch && matchesRole && matchesBatch && matchesStatus;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setBatchFilter('all');
    setStatusFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || roleFilter !== 'all' || batchFilter !== 'all' || statusFilter !== 'all';
  };

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
        await api.delete(`/users/${userId}`);
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
        const response = await api.put(`/users/${currentUser._id}`, userData);
        setUsers(users.map(user => user._id === currentUser._id ? response.data : user));
        toast.success('User updated successfully');
      } else {
        const response = await api.post('/users', userData);
        setUsers([response.data, ...users]);
        toast.success('User created successfully');
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.message || 'Error saving user';
      toast.error(errorMessage);
      setError(errorMessage);
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search users..."
            className="input w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center ${showFilters ? 'bg-gray-700' : ''}`}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          {hasActiveFilters() ? `Filters (${
            (searchTerm ? 1 : 0) + 
            (roleFilter !== 'all' ? 1 : 0) + 
            (batchFilter !== 'all' ? 1 : 0) + 
            (statusFilter !== 'all' ? 1 : 0)
          })` : 'Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white">Filter Users</h3>
            {hasActiveFilters() && (
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="roleFilter" className="block text-xs text-gray-400 mb-1">Role</label>
              <select
                id="roleFilter"
                className="select w-full"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="batchFilter" className="block text-xs text-gray-400 mb-1">Batch</label>
              <select
                id="batchFilter"
                className="select w-full"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <option value="all">All Batches</option>
                <option value="none">No Batch</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="statusFilter" className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                id="statusFilter"
                className="select w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-400 mb-4 flex justify-between items-center">
        <div>
          Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          {hasActiveFilters() && ' matching filters'}
        </div>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.active !== false
                        ? 'bg-green-900 bg-opacity-20 text-green-400'
                        : 'bg-gray-700 bg-opacity-40 text-gray-400'
                    }`}>
                      {user.active !== false ? 'Active' : 'Inactive'}
                    </span>
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
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No users found matching your filters
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
