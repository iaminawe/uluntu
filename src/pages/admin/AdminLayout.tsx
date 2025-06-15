import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
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
  TrendingUp
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, userRoles } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Check if user is superadmin or admin
  const hasAdminAccess = userRoles?.includes('superadmin') || userRoles?.includes('admin');

  if (!hasAdminAccess) {
    console.log('AdminLayout: No admin access, redirecting. Roles:', userRoles);
    return <Navigate to="/" replace />;
  }

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
      name: 'Users & Roles',
      href: '/admin/users',
      icon: Shield,
      current: location.pathname.startsWith('/admin/users') || location.pathname.startsWith('/admin/roles')
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
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-gray-50"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <div className="px-3 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </div>
                    <div className="space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            location.pathname === child.href
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs font-medium text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;