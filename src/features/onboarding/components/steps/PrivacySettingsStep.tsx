import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Mail, Phone, MapPin, MessageSquare, UserPlus, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePrivacySettings } from '../../store/onboardingSlice';
import type { OnboardingStepProps, PrivacySettings } from '../../types';

const PrivacySettingsStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { privacy } = useAppSelector((state) => state.onboarding.formData);
  
  const [settings, setSettings] = useState<PrivacySettings>(privacy);

  // Auto-save changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updatePrivacySettings(settings));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, settings]);

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEmailNotification = (key: keyof PrivacySettings['emailNotifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: value
      }
    }));
  };

  const visibilityOptions = [
    {
      value: 'public' as const,
      label: 'Public',
      description: 'Anyone can view your profile',
      icon: <Eye className="w-5 h-5" />
    },
    {
      value: 'members' as const,
      label: 'Members Only',
      description: 'Only community members can view your profile',
      icon: <Shield className="w-5 h-5" />
    },
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Your profile is completely private',
      icon: <EyeOff className="w-5 h-5" />
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Privacy & Visibility Settings
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Control how your information is shared and who can see your profile
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Visibility */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Profile Visibility
          </h3>
          <div className="space-y-3">
            {visibilityOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => updateSetting('profileVisibility', option.value)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.profileVisibility === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${
                    settings.profileVisibility === option.value 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-slate-500'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {option.label}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                  {settings.profileVisibility === option.value && (
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Display */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Contact Information Display
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Choose what contact information to show on your profile
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Email Address</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Show your email for direct contact</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showEmail}
                  onChange={(e) => updateSetting('showEmail', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Phone Number</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Show your phone for quick contact</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showPhone}
                  onChange={(e) => updateSetting('showPhone', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Location</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Show your city/region</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showLocation}
                  onChange={(e) => updateSetting('showLocation', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Communication Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Direct Messages</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow other members to send you messages</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.allowMessages}
                  onChange={(e) => updateSetting('allowMessages', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Connection Requests</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow others to send connection requests</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.allowConnectionRequests}
                  onChange={(e) => updateSetting('allowConnectionRequests', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Email Notifications
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Choose what notifications you'd like to receive via email
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Newsletter</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Weekly community updates and highlights</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications.newsletter}
                  onChange={(e) => updateEmailNotification('newsletter', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Events</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">New events and event reminders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications.events}
                  onChange={(e) => updateEmailNotification('events', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Opportunities</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">New job postings and volunteer opportunities</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications.opportunities}
                  onChange={(e) => updateEmailNotification('opportunities', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Messages</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">New direct messages and connection requests</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications.messages}
                  onChange={(e) => updateEmailNotification('messages', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                Your Privacy is Protected
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                You can change these settings at any time from your profile page. We never share your 
                personal information with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsStep;