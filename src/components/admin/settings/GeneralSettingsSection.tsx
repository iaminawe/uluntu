import React from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Globe, Eye, Navigation, Palette } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.title} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${section.color}-600`} />
                  <span>{section.title}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardHeader>
              <CardContent>
                {section.settings.length > 0 ? (
                  <div className="space-y-3">
                    {section.settings.map((setting) => (
                      <div key={setting.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{setting.setting_key}</h4>
                            {setting.description && (
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {typeof setting.setting_value === 'boolean' 
                              ? setting.setting_value ? 'Enabled' : 'Disabled'
                              : String(setting.setting_value)
                            }
                          </div>
                        </div>
                      </div>
                    ))}
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
