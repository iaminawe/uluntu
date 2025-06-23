import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone,
  Globe,
  MapPin,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';
import type { ApplicationSetting, UpdateSettingRequest } from '@/types/settings';
import { useAdminSettings } from '@/hooks/useSettings';

interface ContactPanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  website: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
    discord?: string;
    slack?: string;
  };
  business_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  support_email: string;
  contact_form_enabled: boolean;
  public_contact_info: boolean;
}

const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/yourpage' },
  { key: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/yourusername' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/yourcompany' },
  { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/yourusername' },
  { key: 'youtube', label: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/c/yourchannel' },
  { key: 'github', label: 'GitHub', icon: '💻', placeholder: 'https://github.com/yourusername' },
  { key: 'discord', label: 'Discord', icon: '🎮', placeholder: 'https://discord.gg/yourinvite' },
  { key: 'slack', label: 'Slack', icon: '💬', placeholder: 'https://yourworkspace.slack.com' }
];

const weekDays = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const ContactPanel: React.FC<ContactPanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { updateSetting } = useAdminSettings();
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: '',
    phone: '',
    address: '',
    website: '',
    social_links: {},
    business_hours: {},
    support_email: '',
    contact_form_enabled: true,
    public_contact_info: true,
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize settings from props
  useEffect(() => {
    const contactData = settings.filter(s => s.category === 'contact');
    const newSettings: any = { ...contactSettings };
    
    contactData.forEach(setting => {
      let value = setting.setting_value;
      
      // Parse JSON values
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      
      newSettings[setting.setting_key] = value;
    });
    
    setContactSettings(newSettings);
  }, [settings]);

  const handleSettingChange = (key: keyof ContactSettings, value: any) => {
    setContactSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    const updatedSocialLinks = {
      ...contactSettings.social_links,
      [platform]: url || undefined
    };
    
    // Remove empty links
    Object.keys(updatedSocialLinks).forEach(key => {
      if (!updatedSocialLinks[key as keyof typeof updatedSocialLinks]) {
        delete updatedSocialLinks[key as keyof typeof updatedSocialLinks];
      }
    });
    
    handleSettingChange('social_links', updatedSocialLinks);
  };

  const handleBusinessHoursChange = (day: string, hours: string) => {
    const updatedHours = {
      ...contactSettings.business_hours,
      [day]: hours || undefined
    };
    
    // Remove empty hours
    Object.keys(updatedHours).forEach(key => {
      if (!updatedHours[key as keyof typeof updatedHours]) {
        delete updatedHours[key as keyof typeof updatedHours];
      }
    });
    
    handleSettingChange('business_hours', updatedHours);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: UpdateSettingRequest[] = Object.entries(contactSettings).map(([key, value]) => ({
        category: 'contact',
        setting_key: key,
        setting_value: value,
        data_type: typeof value === 'boolean' ? 'boolean' : 
                  typeof value === 'object' ? 'object' : 'string',
        is_public: contactSettings.public_contact_info || key === 'social_links'
      }));
      
      await Promise.all(updates.map(update => updateSetting(update)));
      
      setHasChanges(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const contactData = settings.filter(s => s.category === 'contact');
    const resetSettings: any = { ...contactSettings };
    
    contactData.forEach(setting => {
      resetSettings[setting.setting_key] = setting.setting_value;
    });
    
    setContactSettings(resetSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization's contact details and social media presence
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Basic Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Basic Contact Information</h4>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Email
            </label>
            <input
              type="email"
              value={contactSettings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
              placeholder="info@yourorganization.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Support Email
            </label>
            <input
              type="email"
              value={contactSettings.support_email}
              onChange={(e) => handleSettingChange('support_email', e.target.value)}
              placeholder="support@yourorganization.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactSettings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              value={contactSettings.website}
              onChange={(e) => handleSettingChange('website', e.target.value)}
              placeholder="https://yourorganization.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mailing Address
            </label>
            <textarea
              value={contactSettings.address}
              onChange={(e) => handleSettingChange('address', e.target.value)}
              placeholder="123 Main Street, City, State, Country"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Social Media Links</h4>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">{platform.icon}</span>
                {platform.label}
              </label>
              <div className="flex">
                <input
                  type="url"
                  value={contactSettings.social_links[platform.key as keyof typeof contactSettings.social_links] || ''}
                  onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                />
                {contactSettings.social_links[platform.key as keyof typeof contactSettings.social_links] && (
                  <a
                    href={contactSettings.social_links[platform.key as keyof typeof contactSettings.social_links]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 flex items-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="font-medium text-gray-900">Business Hours</h4>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {weekDays.map((day) => (
            <div key={day.key} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {day.label}
              </div>
              <input
                type="text"
                value={contactSettings.business_hours[day.key as keyof typeof contactSettings.business_hours] || ''}
                onChange={(e) => handleBusinessHoursChange(day.key, e.target.value)}
                placeholder="9:00 AM - 5:00 PM"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          
          <p className="text-xs text-gray-500 mt-2">
            Leave empty for days you're closed. Use formats like "9:00 AM - 5:00 PM" or "Closed"
          </p>
        </div>
      </div>

      {/* Contact Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-orange-600 mr-2" />
            <h4 className="font-medium text-gray-900">Contact Settings</h4>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Enable Contact Form</label>
              <p className="text-sm text-gray-500">Allow visitors to send messages through a contact form</p>
            </div>
            <button
              onClick={() => handleSettingChange('contact_form_enabled', !contactSettings.contact_form_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                contactSettings.contact_form_enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  contactSettings.contact_form_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Public Contact Information</label>
              <p className="text-sm text-gray-500">Make contact details visible to all visitors</p>
            </div>
            <button
              onClick={() => handleSettingChange('public_contact_info', !contactSettings.public_contact_info)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                contactSettings.public_contact_info ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  contactSettings.public_contact_info ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Contact Information Preview</h4>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h5 className="font-medium text-gray-900">Get in Touch</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {contactSettings.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{contactSettings.email}</span>
                </div>
              )}
              
              {contactSettings.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{contactSettings.phone}</span>
                </div>
              )}
              
              {contactSettings.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a href={contactSettings.website} className="text-blue-600 hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
              
              {contactSettings.address && (
                <div className="flex items-start space-x-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span>{contactSettings.address}</span>
                </div>
              )}
            </div>
            
            {Object.keys(contactSettings.social_links).length > 0 && (
              <div>
                <h6 className="font-medium text-gray-700 mb-2">Follow Us</h6>
                <div className="flex space-x-3">
                  {Object.entries(contactSettings.social_links).map(([platform, url]) => {
                    const platformInfo = socialPlatforms.find(p => p.key === platform);
                    return url ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg hover:scale-110 transition-transform"
                        title={platformInfo?.label}
                      >
                        {platformInfo?.icon}
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {Object.keys(contactSettings.business_hours).length > 0 && (
              <div>
                <h6 className="font-medium text-gray-700 mb-2">Business Hours</h6>
                <div className="text-sm space-y-1">
                  {Object.entries(contactSettings.business_hours).map(([day, hours]) => (
                    hours ? (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}:</span>
                        <span>{hours}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Contact Information Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Ensure all contact information is current and monitored regularly</li>
              <li>Social media links should point to your official organization accounts</li>
              <li>Business hours help visitors know when they can expect responses</li>
              <li>Consider privacy implications when making contact information public</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};