import React from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Check, MessageSquare, Users, Calendar, Mail, Bell } from 'lucide-react';
import { NotificationSettings } from '../types';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsField } from '../components/SettingsField';

interface AccountTabProps {
  // User info
  user: any;
  // Password state
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  passwordError: string | null;
  setPasswordError: (error: string | null) => void;
  passwordSuccess: boolean;
  setPasswordSuccess: (success: boolean) => void;
  // Notification settings
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: NotificationSettings) => void;
  // Actions
  onPasswordUpdate: () => Promise<void>;
  isSaving: boolean;
}

/**
 * Account Tab - Account info, password, and notifications
 */
export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordError,
  setPasswordError,
  passwordSuccess,
  setPasswordSuccess,
  notificationSettings,
  setNotificationSettings,
  onPasswordUpdate,
  isSaving
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Account & Password */}
      <div className="space-y-8">
        {/* Account Information Section */}
        <SettingsSection title="Account Information">
          <SettingsField
            label="Current Email"
            description="To change your email, please contact support"
          >
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600
                       rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                       cursor-not-allowed"
            />
          </SettingsField>

          <SettingsField label="User ID">
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600
                       rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                       cursor-not-allowed font-mono text-xs"
            />
          </SettingsField>

          <SettingsField label="Account Created">
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              disabled
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600
                       rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                       cursor-not-allowed"
            />
          </SettingsField>
        </SettingsSection>

        {/* Password Section */}
        <SettingsSection
          title="Change Password"
          description="Update your account password. You'll need to sign in again after changing it."
        >
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                          rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Password updated successfully! You may need to sign in again.
              </p>
            </div>
          )}

          <SettingsField
            label="New Password"
            description="Must be at least 6 characters long"
          >
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(null);
                  setPasswordSuccess(false);
                }}
                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                         dark:bg-slate-700 dark:text-slate-100"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500
                         hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </SettingsField>

          <SettingsField label="Confirm New Password">
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(null);
                  setPasswordSuccess(false);
                }}
                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                         dark:bg-slate-700 dark:text-slate-100"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500
                         hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </SettingsField>

          <button
            onClick={onPasswordUpdate}
            disabled={isSaving || !newPassword || !confirmPassword}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Updating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </SettingsSection>
      </div>

      {/* Right Column - Notifications */}
      <div className="space-y-8">
        {/* Notification Settings */}
        <SettingsSection title="Notification Settings">
          <SettingsField label="Email Frequency">
            <select
              value={notificationSettings.frequency}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                frequency: e.target.value as 'instant' | 'daily' | 'weekly' | 'never'
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="instant">Instant</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="never">Never</option>
            </select>
          </SettingsField>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Notifications
            </h4>

            {[
              { key: 'messages', label: 'Direct messages', icon: MessageSquare },
              { key: 'groupInvites', label: 'Group invitations', icon: Users },
              { key: 'eventReminders', label: 'Event reminders', icon: Calendar },
              { key: 'newsletter', label: 'Newsletter', icon: Mail },
              { key: 'communityUpdates', label: 'Community updates', icon: Bell },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </span>
                <input
                  type="checkbox"
                  checked={notificationSettings.email[key as keyof typeof notificationSettings.email]}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    email: {
                      ...notificationSettings.email,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-slate-300 dark:border-slate-600 text-orange-500
                           focus:ring-orange-500 dark:bg-slate-700"
                />
              </label>
            ))}
          </div>

          {/* Notification Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">Stay Connected</p>
                <p className="text-xs">Manage how and when you receive updates from the community. You can change these settings anytime.</p>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};
