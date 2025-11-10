/**
 * UserSettingsPage Type Definitions
 */

export interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showCompany: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  allowInvites: boolean;
}

export interface NotificationSettings {
  email: {
    messages: boolean;
    groupInvites: boolean;
    eventReminders: boolean;
    newsletter: boolean;
    communityUpdates: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export interface NewsletterPreferences {
  subscribed: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  contentTypes: {
    events: boolean;
    news: boolean;
    opportunities: boolean;
    marketplace: boolean;
    members: boolean;
  };
  format: 'digest' | 'full';
  locationFilter: boolean;
}

export interface ProfileFormData {
  displayName: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  imageUrl: string;
  skills: string[];
  website: string;
  employmentStatus: string;
  arrivedInNelson: string;
  interests: string[];
}

export interface SocialLinks {
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
}

export interface AccountSettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type TabType = 'profile' | 'interests' | 'social' | 'privacy' | 'newsletters' | 'account';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface SettingsFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

export interface SaveIndicatorProps {
  isSaving: boolean;
  saveSuccess: boolean;
  error: string | null;
}
