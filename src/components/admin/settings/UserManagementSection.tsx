import React from 'react';
import { ApplicationSetting } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, Shield, Settings } from 'lucide-react';

interface UserManagementSectionProps {
  settings: ApplicationSetting[];
  isLoading: boolean;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  settings,
  isLoading
}) => {
  const communitySettings = settings.filter(s => s.category === 'community');
  const limitSettings = settings.filter(s => s.category === 'limits');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Community Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communitySettings.length > 0 ? (
              <div className="space-y-3">
                {communitySettings.map((setting) => (
                  <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="font-medium">{setting.setting_key}</div>
                    <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No community settings configured.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>User Limits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {limitSettings.length > 0 ? (
              <div className="space-y-3">
                {limitSettings.map((setting) => (
                  <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="font-medium">{setting.setting_key}</div>
                    <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No limit settings configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementSection;
