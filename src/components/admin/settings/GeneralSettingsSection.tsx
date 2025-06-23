import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { Globe, Eye, Navigation, Palette, Save, RotateCcw, EyeOff, Info, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GeneralSettingsSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  settings,
  onUpdateSetting,
  onRefresh,
  isLoading
}) => {
  const [updatingSettings, setUpdatingSettings] = useState<Set<string>>(new Set());
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const handleSettingChange = (settingId: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const handleSaveSetting = async (setting: ApplicationSetting) => {
    const newValue = localSettings[setting.id] ?? setting.setting_value;
    
    setUpdatingSettings(prev => new Set(prev).add(setting.id));
    
    try {
      await onUpdateSetting({
        setting_key: setting.setting_key,
        setting_value: newValue,
        category: setting.category,
        data_type: setting.data_type
      });
      
      // Remove from local state after successful save
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
  };

  const handleResetSetting = (settingId: string) => {
    setLocalSettings(prev => {
      const updated = { ...prev };
      delete updated[settingId];
      return updated;
    });
  };

  const getSettingValue = (setting: ApplicationSetting) => {
    return localSettings[setting.id] ?? setting.setting_value;
  };

  const hasChanges = (settingId: string) => {
    return settingId in localSettings;
  };
  // Filter settings by relevant categories
  const siteSettings = settings.filter(s => s.category === 'site');
  const headerSettings = settings.filter(s => s.category === 'header');
  const navigationSettings = settings.filter(s => s.category === 'navigation');
  const appearanceSettings = settings.filter(s => s.category === 'appearance');

  const settingsSections = [
    {
      title: 'Site Configuration',
      description: 'Basic site information and branding',
      icon: Globe,
      settings: siteSettings,
      color: 'blue'
    },
    {
      title: 'Header Settings',
      description: 'Header layout and visibility options',
      icon: Eye,
      settings: headerSettings,
      color: 'green'
    },
    {
      title: 'Navigation',
      description: 'Navigation menu configuration',
      icon: Navigation,
      settings: navigationSettings,
      color: 'purple'
    },
    {
      title: 'Appearance',
      description: 'Visual customization and theming',
      icon: Palette,
      settings: appearanceSettings,
      color: 'orange'
    }
  ];

  // Helper to determine if setting is an image type
  const isImageSetting = (setting: ApplicationSetting) => {
    const imageKeys = ['site_logo', 'site_favicon', 'header_logo', 'banner_image', 'background_image'];
    return imageKeys.some(key => setting.setting_key.toLowerCase().includes(key.toLowerCase()));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.title} className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${section.color}-600`} />
                  <span>{section.title}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardHeader>
              <CardContent>
                {section.settings.length > 0 ? (
                  <div className="space-y-4">
                    {section.settings.map((setting) => {
                      const currentValue = getSettingValue(setting);
                      const isUpdating = updatingSettings.has(setting.id);
                      const hasChanged = hasChanges(setting.id);

                      return (
                        <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                          <div className={`${isImageSetting(setting) ? 'space-y-4' : 'flex items-start justify-between'}`}>
                            <div className="flex-1 min-w-0 mr-4">
                              <h4 className="font-medium text-gray-900">{setting.setting_key}</h4>
                              {setting.description && (
                                <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                              )}
                            </div>
                            
                            <div className={`${isImageSetting(setting) ? 'w-full' : 'flex items-center space-x-3'}`}>
                              {/* Interactive Control */}
                              {typeof setting.setting_value === 'boolean' ? (
                                <Switch
                                  checked={currentValue}
                                  onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                  disabled={isUpdating}
                                />
                              ) : isImageSetting(setting) ? (
                                <div className="flex items-center justify-between">
                                  <div className="w-64">
                                    <ImageUploader
                                      value={String(currentValue)}
                                      onChange={(url) => handleSettingChange(setting.id, url)}
                                      disabled={isUpdating}
                                      placeholder={`Upload ${setting.setting_key.replace(/_/g, ' ')}`}
                                      maxSize={2} // 2MB limit for admin images
                                      onError={(error) => toast.error(error)}
                                    />
                                  </div>
                                  {/* Action Buttons for images */}
                                  {hasChanged && (
                                    <div className="flex space-x-1 ml-4">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveSetting(setting)}
                                        disabled={isUpdating}
                                        className="px-2 py-1"
                                      >
                                        {isUpdating ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Save className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleResetSetting(setting.id)}
                                        disabled={isUpdating}
                                        className="px-2 py-1"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type={typeof setting.setting_value === 'number' ? 'number' : 'text'}
                                  value={String(currentValue)}
                                  onChange={(e) => handleSettingChange(setting.id, 
                                    typeof setting.setting_value === 'number' 
                                      ? parseFloat(e.target.value) || 0
                                      : e.target.value
                                  )}
                                  disabled={isUpdating}
                                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                                />
                              )}

                              {/* Action Buttons - only for non-image settings */}
                              {hasChanged && !isImageSetting(setting) && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveSetting(setting)}
                                    disabled={isUpdating}
                                    className="px-2 py-1"
                                  >
                                    {isUpdating ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResetSetting(setting.id)}
                                    disabled={isUpdating}
                                    className="px-2 py-1"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {hasChanged && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Unsaved changes
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No {section.title.toLowerCase()} configured yet.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{siteSettings.length}</div>
              <div className="text-sm text-gray-600">Site Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{headerSettings.length}</div>
              <div className="text-sm text-gray-600">Header Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{navigationSettings.length}</div>
              <div className="text-sm text-gray-600">Navigation Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{appearanceSettings.length}</div>
              <div className="text-sm text-gray-600">Appearance Settings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettingsSection;
