import { useState } from 'react';
import { NotificationSettings } from '../types';

const defaultNotificationSettings: NotificationSettings = {
  email: {
    messages: true,
    groupInvites: true,
    eventReminders: true,
    newsletter: true,
    communityUpdates: true,
  },
  frequency: 'daily',
};

/**
 * Hook for managing notification settings
 */
export const useNotificationSettings = (initialData?: Partial<NotificationSettings>) => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    ...defaultNotificationSettings,
    ...initialData,
    email: {
      ...defaultNotificationSettings.email,
      ...initialData?.email
    }
  });

  const updateEmailSetting = (key: keyof NotificationSettings['email'], value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };

  const updateFrequency = (frequency: NotificationSettings['frequency']) => {
    setNotificationSettings(prev => ({
      ...prev,
      frequency
    }));
  };

  return {
    notificationSettings,
    setNotificationSettings,
    updateEmailSetting,
    updateFrequency
  };
};
