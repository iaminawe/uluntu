import React from 'react';
import { ApplicationSetting } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MessageSquare, MapPin } from 'lucide-react';

interface ContactSectionProps {
  settings: ApplicationSetting[];
  isLoading: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ settings, isLoading }) => {
  const contactSettings = settings.filter(s => s.category === 'contact');
  const locationSettings = settings.filter(s => s.category === 'location');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Contact Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contactSettings.length > 0 ? (
              <div className="space-y-3">
                {contactSettings.map((setting) => (
                  <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="font-medium">{setting.setting_key}</div>
                    <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No contact settings configured.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Location Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationSettings.length > 0 ? (
              <div className="space-y-3">
                {locationSettings.map((setting) => (
                  <div key={setting.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="font-medium">{setting.setting_key}</div>
                    <div className="text-sm text-gray-600">{String(setting.setting_value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No location settings configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactSection;
