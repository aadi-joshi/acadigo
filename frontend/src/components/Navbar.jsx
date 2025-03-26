import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Navbar = ({ onMenuButtonClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={onMenuButtonClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="text-xl font-bold text-white">PPT Access Control</div>
          </div>
          
          <div className="flex items-center">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none mr-4"
            >
              <BellIcon className="h-6 w-6" />
            </button>
            
            <Menu as="div" className="relative">
              <Menu.Button className="flex text-sm rounded-full focus:outline-none">
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-300 hidden md:block">{user?.name}</span>
                </div>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/profile')}
                          className={`${
                            active ? 'bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-300`}
                        >
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-300`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
