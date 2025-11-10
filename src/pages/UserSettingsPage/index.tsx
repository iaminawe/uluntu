import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { SettingsErrorFallback } from '@/components/ErrorBoundary/FeatureSpecificFallbacks';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { updateMemberProfile, createMemberProfile } from '@/features/directory/api/createMemberProfile';
import { uploadImage } from '@/utils/uploadImage';
import { supabase } from '@/lib/supabase';
import { User, Lock, Users, Link2, Newspaper, Save } from 'lucide-react';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';
import { SaveIndicator } from './components/SaveIndicator';
import { ProfileTab } from './tabs/ProfileTab';
import { InterestsTab } from './tabs/InterestsTab';
import { SocialTab } from './tabs/SocialTab';
import { PrivacyTab } from './tabs/PrivacyTab';
import { NewslettersTab } from './tabs/NewslettersTab';
import { AccountTab } from './tabs/AccountTab';
import { useProfileForm } from './hooks/useProfileForm';
import { useSocialLinks } from './hooks/useSocialLinks';
import { usePrivacySettings } from './hooks/usePrivacySettings';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { useNewsletterSettings } from './hooks/useNewsletterSettings';
import { TabType } from './types';
import '../../styles/settings-scrollbar.css';

const UserSettingsPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, resetPassword } = useSession();
  const { data: member, refetch: refetchMember } = useMemberByUserId(user?.id);

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Custom hooks
  const profileForm = useProfileForm();
  const socialLinks = useSocialLinks();
  const { privacySettings, setPrivacySettings } = usePrivacySettings();
  const { notificationSettings, setNotificationSettings } = useNotificationSettings();
  const { newsletterPreferences, setNewsletterPreferences } = useNewsletterSettings();

  // Topic management
  const { data: memberTopics } = useEntityTopics('member', member?.id || '');
  const setEntityTopicsMutation = useSetEntityTopics();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadSettings();
    loadNewsletterSubscription();
  }, [user, navigate]);

  useEffect(() => {
    if (memberTopics) {
      setSelectedTopicIds(memberTopics.map(topic => topic.id));
    }
  }, [memberTopics]);

  const loadSettings = async () => {
    if (!user || !member) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load profile data
      profileForm.setFormData({
        displayName: member.name || '',
        title: member.title || '',
        company: member.company || '',
        bio: member.bio || '',
        location: member.location || '',
        imageUrl: member.image || '',
        skills: Array.isArray(member.skills) ? member.skills : [],
        website: member.website || '',
        employmentStatus: member.employment_status || '',
        arrivedInNelson: member.arrived_in_nelson || '',
        interests: Array.isArray((member as any).interests) ? (member as any).interests : []
      });

      // Load social links
      const socialData = member.social as Record<string, any> || {};
      socialLinks.setFormData({
        website: member.website || '',
        linkedin: socialData.linkedin || '',
        twitter: socialData.twitter || '',
        github: socialData.github || ''
      });

      // Load privacy settings
      const privacyData = (member as any).privacy_settings || {};
      if (privacyData && Object.keys(privacyData).length > 0) {
        setPrivacySettings(privacyData);
      }

      // Load notification settings
      const notificationData = (member as any).notification_settings || {};
      if (notificationData && Object.keys(notificationData).length > 0) {
        setNotificationSettings(notificationData);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewsletterSubscription = async () => {
    if (!user?.email) return;

    try {
      const subscription = await newsletterSubscriptionApi.getSubscription(user.email);
      if (subscription) {
        setNewsletterPreferences({
          subscribed: subscription.status === 'active',
          frequency: subscription.preferences?.frequency || 'weekly',
          contentTypes: {
            events: subscription.preferences?.content_types?.includes('events') ?? true,
            news: subscription.preferences?.content_types?.includes('news') ?? true,
            opportunities: subscription.preferences?.content_types?.includes('opportunities') ?? true,
            marketplace: subscription.preferences?.content_types?.includes('marketplace') ?? true,
            members: subscription.preferences?.content_types?.includes('members') ?? false
          },
          format: subscription.preferences?.format || 'digest',
          locationFilter: subscription.preferences?.location_filter ?? true
        });
      }
    } catch (error) {
      console.error('Error loading newsletter subscription:', error);
    }
  };

  const saveNewsletterPreferences = async () => {
    if (!user?.email) return;

    setNewsletterLoading(true);
    try {
      const contentTypes = Object.entries(newsletterPreferences.contentTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type);

      const existingSubscription = await newsletterSubscriptionApi.getSubscription(user.email);

      if (newsletterPreferences.subscribed) {
        if (existingSubscription) {
          await newsletterSubscriptionApi.updatePreferences(existingSubscription.subscription_token, {
            preferences: {
              frequency: newsletterPreferences.frequency,
              content_types: contentTypes as any,
              format: newsletterPreferences.format,
              location_filter: newsletterPreferences.locationFilter,
              language: 'en'
            },
            status: 'active',
            member_id: user.id
          });
        } else {
          const newSubscription = await newsletterSubscriptionApi.subscribe({
            email: user.email,
            member_id: user.id,
            preferences: {
              frequency: newsletterPreferences.frequency,
              content_types: contentTypes as any,
              format: newsletterPreferences.format,
              location_filter: newsletterPreferences.locationFilter,
              language: 'en'
            }
          });

          if (newSubscription?.confirmation_token) {
            await newsletterSubscriptionApi.confirmSubscription(newSubscription.confirmation_token);
          }
        }
      } else if (existingSubscription) {
        await newsletterSubscriptionApi.unsubscribe(existingSubscription.subscription_token);
      }
    } catch (error) {
      console.error('Error saving newsletter preferences:', error);
      throw error;
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const formData = profileForm.getFormData();
      let finalImageUrl = formData.imageUrl;

      if (formData.imageFile) {
        try {
          finalImageUrl = await uploadImage(formData.imageFile);
        } catch (error) {
          console.error('Failed to upload image:', error);
          setError('Failed to upload image');
          setIsSaving(false);
          return;
        }
      }

      const profileData = {
        name: formData.displayName,
        title: formData.title,
        company: formData.company,
        bio: formData.bio,
        location: formData.location,
        image: finalImageUrl,
        skills: formData.skills,
        interests: formData.interests,
        website: socialLinks.website,
        employment_status: formData.employmentStatus,
        arrived_in_nelson: formData.arrivedInNelson,
        social: {
          linkedin: socialLinks.linkedin,
          twitter: socialLinks.twitter,
          github: socialLinks.github,
          website: socialLinks.website
        },
        status: 'published',
        featured: false
      };

      let profileId = member?.id;
      if (member) {
        await updateMemberProfile(member.id, profileData);
      } else {
        const newProfile = await createMemberProfile(profileData);
        if (newProfile) {
          profileId = newProfile.id;
        }
      }

      if (profileId && selectedTopicIds.length > 0) {
        try {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'member',
            entityId: profileId,
            topicIds: selectedTopicIds
          });
        } catch (topicError) {
          console.error('Error saving topics:', topicError);
        }
      }

      await supabase
        .from('members')
        .update({
          privacy_settings: privacySettings,
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (activeTab === 'newsletters') {
        await saveNewsletterPreferences();
      }

      await refetchMember();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const result = await resetPassword(newPassword);
      if (result.success) {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setPasswordError(result.error?.message || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'interests' as TabType, label: 'Topics & Interests', icon: Users },
    { id: 'social' as TabType, label: 'Social Media', icon: Link2 },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Lock },
    { id: 'newsletters' as TabType, label: 'Newsletters', icon: Newspaper },
    { id: 'account' as TabType, label: 'Account', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-4 sm:space-x-6 px-6 overflow-x-auto pb-0.5 settings-scrollbar" aria-label="Settings tabs">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <SaveIndicator isSaving={isSaving} saveSuccess={saveSuccess} error={error} />

            {activeTab === 'profile' && <ProfileTab {...profileForm} isSaving={isSaving} />}
            {activeTab === 'interests' && (
              <InterestsTab
                selectedTopicIds={selectedTopicIds}
                setSelectedTopicIds={setSelectedTopicIds}
                interests={profileForm.interests}
                newInterest={profileForm.newInterest}
                setNewInterest={profileForm.setNewInterest}
                handleAddInterest={profileForm.handleAddInterest}
                handleRemoveInterest={profileForm.handleRemoveInterest}
              />
            )}
            {activeTab === 'social' && <SocialTab {...socialLinks} />}
            {activeTab === 'privacy' && (
              <PrivacyTab
                privacySettings={privacySettings}
                setPrivacySettings={setPrivacySettings}
              />
            )}
            {activeTab === 'newsletters' && (
              <NewslettersTab
                newsletterPreferences={newsletterPreferences}
                setNewsletterPreferences={setNewsletterPreferences}
                newsletterLoading={newsletterLoading}
              />
            )}
            {activeTab === 'account' && (
              <AccountTab
                user={user}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordError={passwordError}
                setPasswordError={setPasswordError}
                passwordSuccess={passwordSuccess}
                setPasswordSuccess={setPasswordSuccess}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                onPasswordUpdate={handlePasswordUpdate}
                isSaving={isSaving}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100
                       dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * UserSettingsPage - Wrapped with error boundary for graceful failure handling
 */
const UserSettingsPage: React.FC = () => {
  return (
    <FeatureErrorBoundary
      featureName="User Settings"
      fallback={
        <SettingsErrorFallback
          onRetry={() => window.location.reload()}
          onGoBack={() => window.history.back()}
        />
      }
    >
      <UserSettingsPageContent />
    </FeatureErrorBoundary>
  );
};

export default UserSettingsPage;
