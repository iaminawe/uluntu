import React from 'react';
import {
  Settings,
  Globe,
  Users,
  Zap,
  Shield,
  Mail,
  TrendingUp,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search
} from 'lucide-react';
import { RoleGuard, AdminOnly, SuperAdminOnly } from '@/components/auth/PermissionGuard';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import type { UnifiedSettingsSection } from '@/features/admin/hooks/useUnifiedSettings';
import { useTheme } from '@/providers/EnhancedThemeProvider';

interface SettingsNavItem {
  id: UnifiedSettingsSection;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: 'admin' | 'superadmin';
  component: React.ComponentType<any>;
}

interface AdminSettingsLayoutProps {
  children: React.ReactNode;
}

const AdminSettingsLayout: React.FC<AdminSettingsLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const {
    activeSection,
    searchTerm,
    sidebarCollapsed,
    mobileMenuOpen,
    permissions,
    setActiveSection,
    setSearchTerm,
    setSidebarCollapsed,
    setMobileMenuOpen
  } = useUnifiedSettings();

  const settingsNavItems: SettingsNavItem[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Site configuration, branding, and navigation',
      icon: Globe,
      requiredRole: 'admin',
      component: () => <div>General Settings Component</div>
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'User roles, permissions, and community settings',
      icon: Users,
      requiredRole: 'admin',
      component: () => <div>User Management Component</div>
    },
    {
      id: 'features',
      title: 'Feature Management',
      description: 'Feature toggles and module control',
      icon: Zap,
      requiredRole: 'superadmin',
      component: () => <div>Feature Management Component</div>
    },
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Authentication, API keys, and permissions',
      icon: Shield,
      requiredRole: 'superadmin',
      component: () => <div>Security Component</div>
    },
    {
      id: 'email',
      title: 'Email & Communications',
      description: 'Email templates, notifications, and newsletter',
      icon: Mail,
      requiredRole: 'admin',
      component: () => <div>Email Component</div>
    },
    {
      id: 'performance',
      title: 'Performance & Analytics',
      description: 'Metrics, monitoring, and optimization',
      icon: TrendingUp,
      requiredRole: 'superadmin',
      component: () => <div>Performance Component</div>
    },
    {
      id: 'contact',
      title: 'Contact & Support',
      description: 'Contact forms, support settings, and inbox',
      icon: MessageSquare,
      requiredRole: 'admin',
      component: () => <div>Contact Component</div>
    },
    {
      id: 'audit',
      title: 'Audit & History',
      description: 'Change logs and system auditing',
      icon: FileText,
      requiredRole: 'superadmin',
      component: () => <div>Audit Component</div>
    }
  ];

  // Filter navigation items based on permissions
  const availableItems = settingsNavItems.filter(item => {
    switch (item.id) {
      case 'general': return permissions.canViewGeneral;
      case 'users': return permissions.canViewUsers;
      case 'features': return permissions.canViewFeatures;
      case 'security': return permissions.canViewSecurity;
      case 'email': return permissions.canViewEmail;
      case 'performance': return permissions.canViewPerformance;
      case 'contact': return permissions.canViewContact;
      case 'audit': return permissions.canViewAudit;
      default: return false;
    }
  });

  const currentItem = availableItems.find(item => item.id === activeSection);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Admin Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Platform configuration and management
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <Icon className={`
                  h-5 w-5 flex-shrink-0
                  ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                `} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Content Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pl-5 pr-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentItem?.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {currentItem?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body - Tight padding from sidebar */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="w-full pl-5 pr-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsLayout;
