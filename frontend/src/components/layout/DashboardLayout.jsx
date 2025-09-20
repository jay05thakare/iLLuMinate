import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  CpuChipIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Facilities', href: '/facilities', icon: BuildingOfficeIcon, hasAI: true },
  { name: 'Targets & Goals', href: '/targets', icon: ClipboardDocumentListIcon, hasAI: true },
  { name: 'Cement GPT', href: '/cement-gpt', icon: CpuChipIcon, hasAI: true, isAICore: true },
  { name: 'Benchmarking', href: '/benchmarking', icon: ChartBarIcon, hasAI: true, isAICore: true },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <div className="text-xl font-bold text-primary-600">
                  iLLuMinate
                </div>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    // Check if current path matches or starts with the navigation item path
                    const isActive = location.pathname === item.href || 
                                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="relative">
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
                              }`}
                            />
                            {item.hasAI && (
                              <SparklesIcon className="absolute -top-1 -right-1 h-3 w-3 text-purple-500" />
                            )}
                          </div>
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <div className="text-xl font-bold text-primary-600">
              iLLuMinate
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    // Check if current path matches or starts with the navigation item path
                    const isActive = location.pathname === item.href || 
                                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative">
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
                              }`}
                            />
                            {item.hasAI && (
                              <SparklesIcon className="absolute -top-1 -right-1 h-3 w-3 text-purple-500" />
                            )}
                          </div>
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {(() => {
                  // Find the navigation item that matches the current path
                  const matchedItem = navigation.find(item => 
                    location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                  );
                  return matchedItem?.name || 'Dashboard';
                })()}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <BellIcon className="h-6 w-6" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="relative">
                <div className="flex items-center gap-x-2">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="hidden lg:flex lg:flex-col lg:text-sm lg:leading-5">
                    <span className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="text-gray-500">{user?.organization?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
