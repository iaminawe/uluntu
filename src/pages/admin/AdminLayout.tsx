import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/providers/ThemeProvider';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileCheck,
  Settings,
  FileText,
  Building2,
  UsersRound,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  ChevronRight,
  Menu,
  X,
  FileSearch,
  Mail,
  TrendingUp,
  Inbox,
  BarChart3
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const location = useLocation();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Get site name from settings
  const siteName = settings?.site?.site_name?.value || 'Nelson Tech';

  // Debug logging for troubleshooting (disabled)
  /*
  console.log('🔍 AdminLayout Debug:', {
    user: user?.email,
    userRoles,
    hasUser: !!user,
    hasRoles: !!userRoles,
    rolesLength: userRoles?.length
  });
  */

  // Check if user is superadmin or admin
  const hasAdminAccess = userRoles?.includes('superadmin') || userRoles?.includes('admin');
  
  console.log('🔍 Admin Access Check:', {
    hasAdminAccess,
    isSuper: userRoles?.includes('superadmin'),
    isAdmin: userRoles?.includes('admin')
  });

  if (!hasAdminAccess) {
    console.log('❌ Access denied, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Check if user is superadmin
  const isSuperAdmin = userRoles?.includes('superadmin');

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin'
    },
    {
      name: 'Entity Management',
      icon: FileText,
      children: [
        { name: 'Members', href: '/admin/entities/members', icon: Users },
        { name: 'Companies', href: '/admin/entities/companies', icon: Building2 },
        { name: 'Groups', href: '/admin/entities/groups', icon: UsersRound },
        { name: 'Events', href: '/admin/entities/events', icon: Calendar },
        { name: 'News', href: '/admin/entities/news', icon: Newspaper },
        { name: 'Resources', href: '/admin/entities/resources', icon: BookOpen },
        { name: 'Marketplace', href: '/admin/entities/marketplace', icon: ShoppingBag },
        { name: 'Opportunities', href: '/admin/entities/opportunities', icon: Briefcase }
      ]
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname.startsWith('/admin/users')
    },
    {
      name: 'Roles',
      href: '/admin/roles',
      icon: Shield,
      current: location.pathname === '/admin/roles'
    },
    {
      name: 'Moderation',
      href: '/admin/moderation',
      icon: FileCheck,
      current: location.pathname.startsWith('/admin/moderation')
    },
    {
      name: 'Contact Inbox',
      href: '/admin/contact-inbox',
      icon: Inbox,
      current: location.pathname.startsWith('/admin/contact-inbox')
    },
    {
      name: 'Newsletter',
      icon: Mail,
      children: [
        { name: 'Dashboard', href: '/admin/newsletter', icon: LayoutDashboard },
        { name: 'Campaigns', href: '/admin/newsletter/campaigns', icon: Mail },
        { name: 'Subscribers', href: '/admin/newsletter/subscribers', icon: Users },
        { name: 'Analytics', href: '/admin/newsletter/analytics', icon: TrendingUp }
      ]
    },
    {
      name: 'Audit Log',
      href: '/admin/audit',
      icon: FileSearch,
      current: location.pathname === '/admin/audit'
    },
    {
      name: 'Performance',
      href: '/admin/performance',
      icon: BarChart3,
      current: location.pathname === '/admin/performance'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings')
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`min-h-[44px] min-w-[44px] p-2 rounded-lg shadow-lg transition-colors flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-50 text-gray-900'
          }`}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-900'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center h-16 px-4 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'
          }`}>
            <h1 className="text-xl font-bold text-white">{siteName} Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </div>
                    <div className="space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                            location.pathname === child.href
                              ? theme === 'dark' 
                                ? 'bg-gray-700 text-white shadow-sm'
                                : 'bg-gray-800 text-white shadow-sm'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <child.icon className="mr-3 h-5 w-5" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                      item.current
                        ? theme === 'dark'
                          ? 'bg-gray-700 text-white shadow-sm'
                          : 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 border-t border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                <p className="text-xs font-medium text-gray-400">
                  {userRoles?.includes('superadmin') ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <Link
                to="/admin/settings"
                className="ml-3 p-2 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-200">
        <main className="min-h-screen py-4 sm:py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;