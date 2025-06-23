import React from 'react';
import { ApplicationSetting } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shield } from 'lucide-react';

interface SecuritySectionProps {
  settings: ApplicationSetting[];
  isLoading: boolean;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ settings, isLoading }) => {
  const securitySettings = settings.filter(s => s.category === 'security');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securitySettings.length > 0 ? (
            <div className="space-y-3">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                  <div className="font-medium">{setting.setting_key}</div>
                  <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No security settings configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
