import React, { useState } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingCategory, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Mail, Send, Bell, Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const EmailSection: React.FC<EmailSectionProps> = ({
  settings,
  features,
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
        category: setting.category as SettingCategory,
        data_type: setting.data_type as SettingDataType
      });
      
      setLocalSettings(prev => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
      
      toast.success('Email setting saved successfully');
    } catch (error) {
      toast.error('Failed to save email setting');
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

  // Filter settings by email subcategories
  const integrationSettings = settings.filter(s => s.category === 'integration');
  const smtpSettings = settings.filter(s => 
    s.setting_key.includes('smtp') || s.setting_key.includes('mail_server')
  );
  const notificationSettings = settings.filter(s => 
    s.setting_key.includes('notification') || s.setting_key.includes('alert')
  );
  const emailFeatures = features.filter(f => 
    f.feature_key.includes('email') || f.feature_key.includes('notification') || f.feature_key.includes('newsletter')
  );

  const settingsSections = [
    {
      title: 'SMTP & Mail Server',
      description: 'Email server configuration and delivery settings',
      icon: Send,
      settings: smtpSettings,
      color: 'blue'
    },
    {
      title: 'Notifications',
      description: 'Email notification preferences and templates',
      icon: Bell,
      settings: notificationSettings,
      color: 'yellow'
    },
    {
      title: 'Integrations',
      description: 'Third-party email service integrations',
      icon: SettingsIcon,
      settings: integrationSettings,
      color: 'green'
    },
    {
      title: 'Email Features',
      description: 'Enable or disable email-related features',
      icon: Mail,
      settings: [],
      features: emailFeatures,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const sectionSettings = section.settings || [];
          const sectionFeatures = section.features || [];
          
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
                {/* Render Settings */}
                {sectionSettings.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium text-gray-900">Configuration Settings</h4>
                    {sectionSettings.map((setting) => {
                      const currentValue = getSettingValue(setting);
                      const isUpdating = updatingSettings.has(setting.id);
                      const hasChanged = hasChanges(setting.id);

                      return (
                        <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                              <h4 className="font-medium text-gray-900">{setting.setting_key}</h4>
                              {setting.description && (
                                <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Interactive Control */}
                              {typeof setting.setting_value === 'boolean' ? (
                                <Switch
                                  checked={currentValue}
                                  onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                  disabled={isUpdating}
                                />
                              ) : (
                                <input
                                  type={setting.setting_key.includes('password') || setting.setting_key.includes('key') ? 'password' : 
                                        setting.setting_key.includes('email') ? 'email' :
                                        setting.setting_key.includes('port') ? 'number' : 'text'}
                                  value={String(currentValue)}
                                  onChange={(e) => handleSettingChange(setting.id, 
                                    setting.setting_key.includes('port') 
                                      ? parseInt(e.target.value) || 0
                                      : e.target.value
                                  )}
                                  disabled={isUpdating}
                                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                                  placeholder={setting.setting_key.includes('email') ? 'email@example.com' : ''}
                                />
                              )}

                              {/* Action Buttons */}
                              {hasChanged && (
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
                )}

                {/* Render Features */}
                {sectionFeatures.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Email Features</h4>
                    {sectionFeatures.map((feature) => (
                      <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-medium text-gray-900">{feature.feature_key}</h4>
                            {feature.description && (
                              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                            )}
                          </div>
                          
                          <Switch
                            checked={feature.enabled || false}
                            onCheckedChange={(checked) => {
                              toast.success('Email feature toggle functionality coming soon');
                            }}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {sectionSettings.length === 0 && sectionFeatures.length === 0 && (
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
          <CardTitle>Email Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{smtpSettings.length}</div>
              <div className="text-sm text-gray-600">SMTP Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{notificationSettings.length}</div>
              <div className="text-sm text-gray-600">Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{integrationSettings.length}</div>
              <div className="text-sm text-gray-600">Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{emailFeatures.filter(f => f.enabled).length}</div>
              <div className="text-sm text-gray-600">Active Features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSection;
