import React, { useState, useCallback } from 'react';
import { AdminOnly } from '@/components/auth/PermissionGuard';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ErrorCode } from '@/utils/errorSanitization';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingCategory, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { 
  Settings, 
  Globe, 
  Users, 
  Shield, 
  Mail, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowLeft,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Bell,
  Key,
  Lock,
  Navigation,
  Image,
  Server
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImprovedSettingsPage: React.FC = () => {
  const {
    settings,
    features,
    isLoading,
    error,
    permissions,
    updateSetting,
    refetch
  } = useUnifiedSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['site']));
  const [updatingSettings, setUpdatingSettings] = useState<Set<string>>(new Set());
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  // Setting management functions
  const handleSettingChange = useCallback((settingId: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  }, []);

  const handleSaveSetting = useCallback(async (setting: ApplicationSetting) => {
    const newValue = localSettings[setting.id] ?? setting.setting_value;
    
    setUpdatingSettings(prev => new Set(prev).add(setting.id));
    
    try {
      await updateSetting({
        setting_key: setting.setting_key,
        setting_value: newValue,
        category: setting.category as SettingCategory,
        data_type: setting.data_type as SettingDataType
      });
      
      setLocalSettings(prev => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
      
      toast.success('Setting saved successfully');
    } catch (error) {
      toast.error('Failed to save setting');
      console.error('Error saving setting:', error);
    } finally {
      setUpdatingSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete(setting.id);
        return newSet;
      });
    }
  }, [updateSetting, localSettings]);

  const handleResetSetting = useCallback((settingId: string) => {
    setLocalSettings(prev => {
      const updated = { ...prev };
      delete updated[settingId];
      return updated;
    });
  }, []);

  const getSettingValue = useCallback((setting: ApplicationSetting) => {
    return localSettings[setting.id] ?? setting.setting_value;
  }, [localSettings]);

  const hasChanges = useCallback((settingId: string) => {
    return settingId in localSettings;
  }, [localSettings]);

  const isImageSetting = useCallback((setting: ApplicationSetting) => {
    const imageKeys = ['logo', 'favicon', 'banner', 'background', 'image'];
    return imageKeys.some(key => setting.setting_key.toLowerCase().includes(key));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Define setting sections with improved organization
  const settingSections = [
    {
      id: 'site',
      title: 'Site Configuration',
      description: 'Basic site information, branding, and identity',
      icon: Globe,
      color: 'blue',
      categories: ['site'],
      priority: 1
    },
    {
      id: 'navigation',
      title: 'Navigation & Layout',
      description: 'Menu structure, navigation, and page layout',
      icon: Navigation,
      color: 'indigo',
      categories: ['navigation', 'header'],
      priority: 2
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'User registration, profiles, and community settings',
      icon: Users,
      color: 'green',
      categories: ['community', 'limits'],
      priority: 3
    },
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Authentication, permissions, and security policies',
      icon: Shield,
      color: 'red',
      categories: ['security'],
      priority: 4
    },
    {
      id: 'email',
      title: 'Email & Communications',
      description: 'SMTP settings, notifications, and email templates',
      icon: Mail,
      color: 'yellow',
      categories: ['integration'],
      priority: 5
    },
    {
      id: 'performance',
      title: 'Performance & Analytics',
      description: 'Caching, monitoring, and performance optimization',
      icon: TrendingUp,
      color: 'orange',
      categories: ['performance'],
      priority: 6
    },
    {
      id: 'integrations',
      title: 'External Integrations',
      description: 'Third-party services, APIs, and webhooks',
      icon: Server,
      color: 'teal',
      categories: ['api'],
      priority: 7
    }
  ];

  // Filter settings based on search and category
  const filteredSections = settingSections.map(section => {
    const sectionSettings = settings.filter(setting => 
      section.categories.includes(setting.category) &&
      (searchTerm === '' || 
       setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
       setting.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showOnlyModified || hasChanges(setting.id))
    );

    return {
      ...section,
      settings: sectionSettings,
      hasContent: sectionSettings.length > 0
    };
  }).filter(section => selectedCategory === 'all' || section.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert
          error={{ userMessage: error, errorCode: ErrorCode.GENERIC_UNKNOWN, debugId: Date.now().toString(), timestamp: new Date().toISOString() }}
          onRetry={refetch}
          canRetry={true}
        />
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Settings Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Configure core platform settings (Features and Themes managed separately)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Categories</option>
                  {settingSections.map(section => (
                    <option key={section.id} value={section.id}>{section.title}</option>
                  ))}
                </select>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowOnlyModified(!showOnlyModified)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    showOnlyModified
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Modified Only</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-6">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            const modifiedCount = section.settings.filter(s => hasChanges(s.id)).length;

            return (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-${section.color}-100 rounded-lg`}>
                        <Icon className={`h-5 w-5 text-${section.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{section.title}</span>
                          {modifiedCount > 0 && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                              {modifiedCount} modified
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {section.settings.length} settings
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-gray-100 dark:border-gray-700">
                    {section.settings.length > 0 ? (
                      <div className="space-y-4">
                        {section.settings.map((setting) => {
                          const currentValue = getSettingValue(setting);
                          const isUpdating = updatingSettings.has(setting.id);
                          const hasChanged = hasChanges(setting.id);

                          return (
                            <SettingItem
                              key={setting.id}
                              setting={setting}
                              currentValue={currentValue}
                              isUpdating={isUpdating}
                              hasChanged={hasChanged}
                              isImageSetting={isImageSetting(setting)}
                              onSettingChange={handleSettingChange}
                              onSaveSetting={handleSaveSetting}
                              onResetSetting={handleResetSetting}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No settings found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          No settings match your current filters.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Settings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{settings.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Settings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.keys(localSettings).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Modified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {settingSections.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {expandedSections.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Expanded Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
};

// Separate component for individual setting items
interface SettingItemProps {
  setting: ApplicationSetting;
  currentValue: any;
  isUpdating: boolean;
  hasChanged: boolean;
  isImageSetting: boolean;
  onSettingChange: (settingId: string, value: any) => void;
  onSaveSetting: (setting: ApplicationSetting) => void;
  onResetSetting: (settingId: string) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  setting,
  currentValue,
  isUpdating,
  hasChanged,
  isImageSetting,
  onSettingChange,
  onSaveSetting,
  onResetSetting
}) => {
  const renderControl = () => {
    if (typeof setting.setting_value === 'boolean') {
      return (
        <Switch
          checked={currentValue || false}
          onCheckedChange={(checked) => onSettingChange(setting.id, checked)}
          disabled={isUpdating}
        />
      );
    }

    if (isImageSetting) {
      return (
        <div className="w-full max-w-md">
          <ImageUploader
            value={String(currentValue)}
            onChange={(url) => onSettingChange(setting.id, url)}
            disabled={isUpdating}
            placeholder={`Upload ${setting.setting_key.replace(/_/g, ' ')}`}
            maxSize={2}
            onError={(error) => toast.error(error)}
          />
        </div>
      );
    }

    const inputType = 
      setting.setting_key.includes('password') ? 'password' :
      setting.setting_key.includes('email') ? 'email' :
      setting.setting_key.includes('url') ? 'url' :
      setting.setting_key.includes('port') || typeof setting.setting_value === 'number' ? 'number' :
      'text';

    return (
      <input
        type={inputType}
        value={String(currentValue)}
        onChange={(e) => onSettingChange(setting.id, 
          typeof setting.setting_value === 'number' 
            ? parseFloat(e.target.value) || 0
            : e.target.value
        )}
        disabled={isUpdating}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
        placeholder={
          setting.setting_key.includes('email') ? 'email@example.com' :
          setting.setting_key.includes('url') ? 'https://example.com' :
          undefined
        }
      />
    );
  };

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      hasChanged ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
    }`}>
      <div className={`${isImageSetting ? 'space-y-4' : 'flex items-start justify-between'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">
              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            {hasChanged && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Modified
              </span>
            )}
          </div>
          {setting.description && (
            <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
          )}
        </div>
        
        <div className={`${isImageSetting ? 'w-full' : 'flex items-center space-x-3'}`}>
          {renderControl()}
          
          {hasChanged && (
            <div className={`flex space-x-2 ${isImageSetting ? 'mt-3' : ''}`}>
              <Button
                size="sm"
                onClick={() => onSaveSetting(setting)}
                disabled={isUpdating}
                className="px-3 py-1"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResetSetting(setting.id)}
                disabled={isUpdating}
                className="px-3 py-1"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedSettingsPage;