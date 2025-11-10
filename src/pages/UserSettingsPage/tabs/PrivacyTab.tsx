import React from 'react';
import { Mail, Globe, Users, Eye, MessageSquare } from 'lucide-react';
import { PrivacySettings } from '../types';
import { SettingsField } from '../components/SettingsField';

interface PrivacyTabProps {
  privacySettings: PrivacySettings;
  setPrivacySettings: (settings: PrivacySettings) => void;
}

/**
 * Privacy Tab
 */
export const PrivacyTab: React.FC<PrivacyTabProps> = ({
  privacySettings,
  setPrivacySettings
}) => {
  return (
    <div className="space-y-6">
      <SettingsField label="Profile Visibility">
        <select
          value={privacySettings.profileVisibility}
          onChange={(e) => setPrivacySettings({
            ...privacySettings,
            profileVisibility: e.target.value as 'public' | 'members' | 'private'
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="members">Members Only - Only logged-in members can see</option>
          <option value="private">Private - Only you can see your profile</option>
        </select>
      </SettingsField>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Profile Information
        </h3>

        {[
          { key: 'showEmail', label: 'Show email address', icon: Mail },
          { key: 'showLocation', label: 'Show location', icon: Globe },
          { key: 'showCompany', label: 'Show company information', icon: Users },
          { key: 'showActivity', label: 'Show activity status', icon: Eye },
        ].map(({ key, label, icon: Icon }) => (
          <label key={key} className="flex items-center justify-between">
            <span className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </span>
            <input
              type="checkbox"
              checked={privacySettings[key as keyof PrivacySettings] as boolean}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                [key]: e.target.checked
              })}
              className="rounded border-slate-300 dark:border-slate-600 text-orange-500
                       focus:ring-orange-500 dark:bg-slate-700"
            />
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Communication
        </h3>

        {[
          { key: 'allowMessages', label: 'Allow direct messages', icon: MessageSquare },
          { key: 'allowInvites', label: 'Allow group invites', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <label key={key} className="flex items-center justify-between">
            <span className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </span>
            <input
              type="checkbox"
              checked={privacySettings[key as keyof PrivacySettings] as boolean}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                [key]: e.target.checked
              })}
              className="rounded border-slate-300 dark:border-slate-600 text-orange-500
                       focus:ring-orange-500 dark:bg-slate-700"
            />
          </label>
        ))}
      </div>
    </div>
  );
};
