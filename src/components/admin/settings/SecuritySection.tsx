import React, { useState } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingDataType, SettingCategory } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Shield, Key, Lock, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SecuritySectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
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
      
      toast.success('Security setting saved successfully');
    } catch (error) {
      toast.error('Failed to save security setting');
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

  // Filter settings by security subcategories
  const authSettings = settings.filter(s => 
    s.category === 'security' && (s.setting_key.includes('auth') || s.setting_key.includes('login'))
  );
  const encryptionSettings = settings.filter(s => 
    s.category === 'security' && (s.setting_key.includes('encrypt') || s.setting_key.includes('ssl'))
  );
  const accessSettings = settings.filter(s => 
    s.category === 'security' && (s.setting_key.includes('access') || s.setting_key.includes('permission'))
  );
  const securityFeatures = features.filter(f => 
    f.feature_key.includes('security') || f.feature_key.includes('auth') || f.feature_key.includes('mfa')
  );

  const settingsSections = [
    {
      title: 'Authentication & Access',
      description: 'User authentication, login policies, and access control',
      icon: Key,
      settings: authSettings,
      color: 'blue'
    },
    {
      title: 'Encryption & Privacy',
      description: 'Data encryption, SSL settings, and privacy controls',
      icon: Lock,
      settings: encryptionSettings,
      color: 'green'
    },
    {
      title: 'Security Policies',
      description: 'Security policies, restrictions, and monitoring',
      icon: AlertTriangle,
      settings: accessSettings,
      color: 'red'
    },
    {
      title: 'Security Features',
      description: 'Enable or disable security-related features',
      icon: Shield,
      settings: [],
      features: securityFeatures,
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
            <Card key={section.title} className="w-full border-l-4 border-l-red-500">
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
                        <div key={setting.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                                  checked={currentValue || false}
                                  onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                  disabled={isUpdating}
                                />
                              ) : (
                                <input
                                  type={setting.setting_key.includes('password') ? 'password' : 
                                        typeof setting.setting_value === 'number' ? 'number' : 'text'}
                                  value={String(currentValue)}
                                  onChange={(e) => handleSettingChange(setting.id, 
                                    typeof setting.setting_value === 'number' 
                                      ? parseFloat(e.target.value) || 0
                                      : e.target.value
                                  )}
                                  disabled={isUpdating}
                                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[200px]"
                                />
                              )}

                              {/* Action Buttons */}
                              {hasChanged && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveSetting(setting)}
                                    disabled={isUpdating}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700"
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
                            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              Unsaved security changes
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
                    <h4 className="font-medium text-gray-900">Security Features</h4>
                    {sectionFeatures.map((feature) => (
                      <div key={feature.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                              toast.success('Security feature toggle functionality coming soon');
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

      {/* Security Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Notice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            Security settings require careful consideration. Changes to authentication, encryption, 
            or access control settings can affect system security and user access. Always test 
            changes in a staging environment before applying to production.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{authSettings.length}</div>
              <div className="text-sm text-gray-600">Auth Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{encryptionSettings.length}</div>
              <div className="text-sm text-gray-600">Encryption Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{accessSettings.length}</div>
              <div className="text-sm text-gray-600">Access Policies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{securityFeatures.filter(f => f.enabled).length}</div>
              <div className="text-sm text-gray-600">Active Features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
