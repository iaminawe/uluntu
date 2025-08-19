import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Palette, 
  Users, 
  MapPin, 
  Mail, 
  Shield, 
  Sliders,
  Save,
  RefreshCw,
  Download,
  Upload,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { settingsApi } from '@/features/admin/api/settings';
import { useAdminSettings } from '@/hooks/useSettings';
import { FeatureTogglePanel } from '@/components/admin/settings/FeatureTogglePanel';
import { SiteConfigurationPanel } from '@/components/admin/settings/SiteConfigurationPanel';
import { AppearancePanel } from '@/components/admin/settings/AppearancePanel';
import { CommunityPanel } from '@/components/admin/settings/CommunityPanel';
import { LocationPanel } from '@/components/admin/settings/LocationPanel';
import { ContactPanel } from '@/components/admin/settings/ContactPanel';
import { SecurityPanel } from '@/components/admin/settings/SecurityPanel';
import { SettingsHistoryPanel } from '@/components/admin/settings/SettingsHistoryPanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SuperAdminOnly } from '@/components/auth/PermissionGuard';

type SettingsTab = 
  | 'features' 
  | 'site' 
  | 'appearance' 
  | 'community' 
  | 'location' 
  | 'contact' 
  | 'security' 
  | 'history';

interface SettingsNavItem {
  id: SettingsTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<any>;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('features');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings, features, history, loading, error, refetch } = useAdminSettings();

  const navigationItems: SettingsNavItem[] = [
    {
      id: 'features',
      title: 'Feature Toggles',
      icon: Sliders,
      description: 'Manage feature availability and rollouts',
      component: FeatureTogglePanel,
    },
    {
      id: 'site',
      title: 'Site Configuration',
      icon: Globe,
      description: 'Basic site settings and branding',
      component: SiteConfigurationPanel,
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Visual customization and theming',
      component: AppearancePanel,
    },
    {
      id: 'community',
      title: 'Community',
      icon: Users,
      description: 'Member management and permissions',
      component: CommunityPanel,
    },
    {
      id: 'location',
      title: 'Location & Coverage',
      icon: MapPin,
      description: 'Geographic settings and service areas',
      component: LocationPanel,
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: Mail,
      description: 'Contact details and social links',
      component: ContactPanel,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Security settings and permissions',
      component: SecurityPanel,
    },
    {
      id: 'history',
      title: 'Change History',
      icon: History,
      description: 'View all configuration changes',
      component: SettingsHistoryPanel,
    },
  ];

  const currentItem = navigationItems.find(item => item.id === activeTab);
  const CurrentComponent = currentItem?.component;

  const handleExportSettings = async () => {
    try {
      const exportData = await settingsApi.exportSettings();
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    }
  };

  const handleImportSettings = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.settings || !importData.feature_toggles) {
          throw new Error('Invalid settings file format');
        }
        
        const result = await settingsApi.importSettings(importData);
        
        if (result.success) {
          toast.success('Settings imported successfully');
          refetch();
        } else {
          throw new Error(result.error || 'Import failed');
        }
      } catch (error) {
        console.error('Error importing settings:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to import settings');
      } finally {
        document.body.removeChild(fileInput);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load settings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{typeof error === 'string' ? error : 'An error occurred while loading settings.'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminOnly fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Super Admin Access Required</h2>
          <p className="text-gray-600">This area is restricted to super administrators only.</p>
        </div>
      </div>
    }>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 bg-white shadow-sm border-r border-gray-200 transition-all duration-300
          w-64 sm:w-72 lg:w-80
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed && 'lg:w-16'}
        `}>
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Super Admin Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                    Manage platform configuration
                  </p>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2.5 sm:py-2 rounded-lg text-left transition-colors
                    min-h-[44px]
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <Icon className={`
                    h-5 w-5 flex-shrink-0
                    ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate hidden sm:block">
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200 space-y-2 hidden sm:block">
              <button
                onClick={handleExportSettings}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </button>
              <button
                onClick={handleImportSettings}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </button>
              <button
                onClick={refetch}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`
          flex-1 flex flex-col
          lg:ml-80
          ${sidebarCollapsed && 'lg:ml-16'}
        `}>
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentItem?.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentItem?.description}
                </p>
              </div>
              
              {/* Quick Stats - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{settings.length}</div>
                  <div className="text-gray-500">Settings</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{features.length}</div>
                  <div className="text-gray-500">Features</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {features.filter(f => f.enabled).length}
                  </div>
                  <div className="text-gray-500">Enabled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
            {CurrentComponent && (
              <CurrentComponent
                settings={settings}
                features={features}
                history={history}
                onRefresh={refetch}
              />
            )}
          </div>
        </div>
      </div>
    </SuperAdminOnly>
  );
};


export default SettingsPage;