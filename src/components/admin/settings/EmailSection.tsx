import React from 'react';
import { ApplicationSetting } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mail } from 'lucide-react';

interface EmailSectionProps {
  settings: ApplicationSetting[];
  isLoading: boolean;
}

const EmailSection: React.FC<EmailSectionProps> = ({ settings, isLoading }) => {
  const integrationSettings = settings.filter(s => s.category === 'integration');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>Email & Communication Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {integrationSettings.length > 0 ? (
            <div className="space-y-3">
              {integrationSettings.map((setting) => (
                <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                  <div className="font-medium">{setting.setting_key}</div>
                  <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No email settings configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSection;
