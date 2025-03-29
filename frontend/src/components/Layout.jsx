import { Fragment, useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import AuthContext from '../context/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation items based on user role
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, forRoles: ['admin', 'trainer', 'student'] },
    { name: 'PPTs', href: '/ppts', icon: DocumentTextIcon, forRoles: ['admin', 'trainer', 'student'] },
    { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon, forRoles: ['admin', 'trainer', 'student'] },
    { name: 'Batches', href: '/trainer/batches', icon: AcademicCapIcon, forRoles: ['admin', 'trainer'] },
    { name: 'Manage PPTs', href: '/trainer/ppts', icon: DocumentTextIcon, forRoles: ['admin', 'trainer'] },
    { name: 'Manage Assignments', href: '/trainer/assignments', icon: ClipboardDocumentListIcon, forRoles: ['admin', 'trainer'] },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, forRoles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.forRoles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="h-full bg-gray-900">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <div className="flex grow flex-col overflow-y-auto bg-gray-800 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <h1 className="text-2xl font-bold text-white">Acadigo</h1>
                    </div>
                    <nav className="mt-8 flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {filteredNavigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.href}
                                  className={({ isActive }) => classNames(
                                    isActive
                                      ? 'bg-gray-700 text-white'
                                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                                  )}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col overflow-y-auto bg-gray-800 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-2xl font-bold text-white">Acadigo</h1>
            </div>
            <nav className="mt-8 flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {filteredNavigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) => classNames(
                            isActive
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-700 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to="/profile"
                          className={classNames(
                            active ? 'bg-gray-700' : '',
                            'block px-3 py-1 text-sm leading-6 text-white'
                          )}
                        >
                          <div className="flex items-center">
                            <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Profile
                          </div>
                        </NavLink>
                      )}
                    </Menu.Item>
                    {user?.role === 'admin' && (
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink
                            to="/admin/settings"
                            className={classNames(
                              active ? 'bg-gray-700' : '',
                              'block px-3 py-1 text-sm leading-6 text-white'
                            )}
                          >
                            <div className="flex items-center">
                              <Cog6ToothIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                              Settings
                            </div>
                          </NavLink>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active ? 'bg-gray-700' : '',
                            'block w-full text-left px-3 py-1 text-sm leading-6 text-white'
                          )}
                        >
                          <div className="flex items-center">
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Sign out
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
