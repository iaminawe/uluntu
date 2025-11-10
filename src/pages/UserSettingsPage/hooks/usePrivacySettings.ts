import { useState } from 'react';
import { PrivacySettings } from '../types';

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'members',
  showEmail: false,
  showLocation: true,
  showCompany: true,
  showActivity: true,
  allowMessages: true,
  allowInvites: true,
};

/**
 * Hook for managing privacy settings
 */
export const usePrivacySettings = (initialData?: Partial<PrivacySettings>) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    ...defaultPrivacySettings,
    ...initialData
  });

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    privacySettings,
    setPrivacySettings,
    updateSetting
  };
};
