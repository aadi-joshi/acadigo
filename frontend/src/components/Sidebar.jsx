import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'trainer', 'student'] },
  ];

  // Common routes for all users
  navigation.push(
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['admin', 'trainer', 'student'] }
  );

  // Admin-specific routes
  if (user?.role === 'admin') {
    navigation.push(
      { name: 'User Management', href: '/admin/users', icon: UsersIcon, roles: ['admin'] },
      { name: 'System Settings', href: '/admin/settings', icon: CogIcon, roles: ['admin'] },
      { name: 'System Analytics', href: '/admin/analytics', icon: ChartBarIcon, roles: ['admin'] }
    );
  }

  // Admin and trainer routes
  if (user?.role === 'admin' || user?.role === 'trainer') {
    navigation.push(
      { name: 'Batch Management', href: '/trainer/batches', icon: UserGroupIcon, roles: ['admin', 'trainer'] },
      { name: 'PPT Management', href: '/trainer/ppts', icon: DocumentTextIcon, roles: ['admin', 'trainer'] },
      { name: 'Assignment Management', href: '/trainer/assignments', icon: ClipboardDocumentListIcon, roles: ['admin', 'trainer'] }
    );
  }

  // Common routes for all users
  navigation.push(
    { name: 'PPTs', href: '/ppts', icon: DocumentTextIcon, roles: ['admin', 'trainer', 'student'] },
    { name: 'Assignments', href: '/assignments', icon: AcademicCapIcon, roles: ['admin', 'trainer', 'student'] }
  );

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-lg font-bold text-white">PPT Access Control</span>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        location.pathname === item.href
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon
                        className={`mr-4 flex-shrink-0 h-6 w-6 ${
                          location.pathname === item.href
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
            <span className="text-xl font-bold text-white">PPT Access Control</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.href
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
