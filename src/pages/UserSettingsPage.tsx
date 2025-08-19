import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { updateMemberProfile, createMemberProfile } from '@/features/directory/api/createMemberProfile';
import { uploadImage } from '@/utils/uploadImage';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  AlertCircle,
  Check,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Plus,
  X,
  Link2,
  Github,
  Linkedin,
  Twitter,
  LinkIcon,
  Newspaper,
  CheckCircle2,
  ShoppingBag,
  Shield
} from 'lucide-react';
import { FormImageUpload } from '@/shared/components/ui/Form/FormImageUpload';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';
import '../styles/settings-scrollbar.css';

interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showCompany: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  allowInvites: boolean;
}

interface NotificationSettings {
  email: {
    messages: boolean;
    groupInvites: boolean;
    eventReminders: boolean;
    newsletter: boolean;
    communityUpdates: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

const UserSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, resetPassword } = useSession();
  const authState = useAppSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'interests' | 'social' | 'privacy' | 'newsletters' | 'account'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get member data
  const { data: member, refetch: refetchMember } = useMemberByUserId(user?.id);
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [arrivedInNelson, setArrivedInNelson] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Topic management hooks
  const { data: memberTopics } = useEntityTopics('member', member?.id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  // Account settings
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Newsletter settings
  const [newsletterPreferences, setNewsletterPreferences] = useState({
    subscribed: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    contentTypes: {
      events: true,
      news: true,
      opportunities: true,
      marketplace: true,
      members: false
    },
    format: 'digest' as 'digest' | 'full',
    locationFilter: true
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'members',
    showEmail: false,
    showLocation: true,
    showCompany: true,
    showActivity: true,
    allowMessages: true,
    allowInvites: true,
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      messages: true,
      groupInvites: true,
      eventReminders: true,
      newsletter: true,
      communityUpdates: true,
    },
    frequency: 'daily',
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadSettings();
    loadNewsletterSubscription();
  }, [user, navigate]);
  
  // Populate topics when member topics load
  useEffect(() => {
    if (memberTopics) {
      setSelectedTopicIds(memberTopics.map(topic => topic.id));
    }
  }, [memberTopics]);
  
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

  const loadSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (member) {
        // Load profile data
        setDisplayName(member.name || '');
        setTitle(member.title || '');
        setCompany(member.company || '');
        setBio(member.bio || '');
        setLocation(member.location || '');
        setImageUrl(member.image || '');
        setSkills(Array.isArray(member.skills) ? member.skills : []);
        setWebsite(member.website || '');
        setEmploymentStatus(member.employment_status || '');
        setArrivedInNelson(member.arrived_in_nelson || '');
        setInterests(Array.isArray((member as any).interests) ? (member as any).interests : []);
        
        // Load social links
        const socialData = member.social as Record<string, any> || {};
        setLinkedin(socialData.linkedin || '');
        setTwitter(socialData.twitter || '');
        setGithub(socialData.github || '');
        
        // Load privacy settings - stored in member table
        const privacyData = (member as any).privacy_settings || {};
        if (privacyData && Object.keys(privacyData).length > 0) {
          setPrivacySettings(privacyData);
        }
        
        // Load notification settings - stored in member table
        const notificationData = (member as any).notification_settings || {};
        if (notificationData && Object.keys(notificationData).length > 0) {
          setNotificationSettings(notificationData);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Upload image if there's a new file
      let finalImageUrl = imageUrl;
      if (imageFile) {
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Failed to upload image:', error);
          setError('Failed to upload image');
          setIsSaving(false);
          return;
        }
      }

      const profileData = {
        name: displayName,
        title,
        company,
        bio,
        location,
        image: finalImageUrl,
        skills,
        interests,
        website,
        employment_status: employmentStatus,
        arrived_in_nelson: arrivedInNelson,
        social: {
          linkedin,
          twitter,
          github,
          website
        },
        status: 'published',
        featured: false
      };

      // Update or create member profile
      let profileId = member?.id;
      if (member) {
        await updateMemberProfile(member.id, profileData);
      } else {
        const newProfile = await createMemberProfile(profileData);
        if (newProfile) {
          profileId = newProfile.id;
        }
      }
      
      // Save topics after successful profile save
      if (profileId && selectedTopicIds.length > 0) {
        try {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'member',
            entityId: profileId,
            topicIds: selectedTopicIds
          });
        } catch (topicError) {
          console.error('Error saving topics:', topicError);
          // Continue anyway as the profile was saved
        }
      }

      // Update privacy and notification settings in members table
      const { error: updateError } = await supabase
        .from('members')
        .update({
          privacy_settings: privacySettings,
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Save newsletter preferences if changed
      if (activeTab === 'newsletters') {
        await saveNewsletterPreferences();
      }
      
      // Refetch member data
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

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    }
  };
  
  const saveNewsletterPreferences = async () => {
    if (!user?.email) return;
    
    setNewsletterLoading(true);
    try {
      const contentTypes = Object.entries(newsletterPreferences.contentTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type);
      
      // Get existing subscription
      const existingSubscription = await newsletterSubscriptionApi.getSubscription(user.email);
      
      if (newsletterPreferences.subscribed) {
        if (existingSubscription) {
          // Update existing subscription preferences
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
          // Create new subscription (for members, mark as active immediately)
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
          
          // Confirm subscription immediately for members
          if (newSubscription?.confirmation_token) {
            await newsletterSubscriptionApi.confirmSubscription(newSubscription.confirmation_token);
          }
        }
      } else {
        // Unsubscribe
        if (existingSubscription) {
          await newsletterSubscriptionApi.unsubscribe(existingSubscription.subscription_token);
        }
      }
    } catch (error) {
      console.error('Error saving newsletter preferences:', error);
      throw error;
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

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
            <nav className="flex space-x-4 sm:space-x-6 px-6 overflow-x-auto pb-0.5" 
                 style={{
                   msOverflowStyle: 'none',
                   scrollbarWidth: 'none',
                   WebkitScrollbar: { display: 'none' }
                 } as React.CSSProperties}
                 aria-label="Settings tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'account'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('interests')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'interests'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Topics & Interests
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'social'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Link2 className="w-4 h-4 inline mr-2" />
                Social Media
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'privacy'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('newsletters')}
                className={`py-3 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'newsletters'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Newspaper className="w-4 h-4 inline mr-2" />
                Newsletters
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <p className="text-sm text-green-700 dark:text-green-400">Settings saved successfully!</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Profile Image
                  </label>
                  <FormImageUpload
                    currentImage={imageUrl}
                    onImageChange={handleImageChange}
                    disabled={isSaving}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Professional Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Full Stack Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nelson, BC"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Employment Status
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select status...</option>
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="freelance">Freelancer</option>
                      <option value="looking">Looking for opportunities</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      When did you arrive in Nelson?
                    </label>
                    <input
                      type="text"
                      value={arrivedInNelson}
                      onChange={(e) => setArrivedInNelson(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 2020 or Born here"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about yourself, your work, and what brings you to Nelson..."
                    required
                  />
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add a skill..."
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                               transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30
                                   text-orange-700 dark:text-orange-300 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-orange-900 dark:hover:text-orange-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {skills.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      Add at least one skill to showcase your expertise
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* Topics & Interests Tab */}
            {activeTab === 'interests' && (
              <div className="space-y-6">
                {/* Topics */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Topics of Interest
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Select topics you're interested in to help others find you and connect over shared interests.
                  </p>
                  <TopicSelector
                    selectedTopics={selectedTopicIds}
                    onTopicsChange={setSelectedTopicIds}
                    placeholder="Search and select topics..."
                    maxTopics={10}
                    className="w-full"
                  />
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Interests & Hobbies
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Share your personal interests and hobbies to connect with like-minded people.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add an interest or hobby..."
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                               transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30
                                   text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            className="hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      No interests added yet. Add some to help others discover common ground!
                    </p>
                  )}
                </div>

                {/* Community Engagement Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Why add topics and interests?
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Help others discover you based on shared interests</li>
                    <li>• Get notified about relevant events and opportunities</li>
                    <li>• Connect with people who share your passions</li>
                    <li>• Appear in topic-based searches and filters</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Social Media & Links
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Add your social media profiles and website to make it easier for others to connect with you.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Personal Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Linkedin className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enter your full LinkedIn profile URL
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Twitter / X Profile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Twitter className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enter your Twitter/X profile URL
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        GitHub Profile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Github className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Share your GitHub profile to showcase your projects
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Tips */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                    Tips for Social Links
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Use complete URLs including https://</li>
                    <li>• Double-check your profile URLs are correct</li>
                    <li>• Only add profiles you're comfortable sharing publicly</li>
                    <li>• Keep your profiles up to date for better networking</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Profile Visibility
                  </label>
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
                </div>

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
            )}


            {/* Newsletters Tab */}
            {activeTab === 'newsletters' && (
              <div className="space-y-6">
                {/* Newsletter Subscription Status */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Newsletter Subscription
                  </h3>
                  
                  <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Newspaper className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {newsletterPreferences.subscribed ? 'Subscribed to Newsletter' : 'Subscribe to Newsletter'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {newsletterPreferences.subscribed 
                              ? 'You are receiving our newsletter updates'
                              : 'Get the latest news, events, and opportunities'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={newsletterPreferences.subscribed}
                          onChange={(e) => setNewsletterPreferences({
                            ...newsletterPreferences,
                            subscribed: e.target.checked
                          })}
                          disabled={newsletterLoading}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                      </label>
                    </label>
                  </div>
                </div>

                {/* Newsletter Preferences - Only show if subscribed */}
                {newsletterPreferences.subscribed && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Delivery Frequency
                      </label>
                      <select
                        value={newsletterPreferences.frequency}
                        onChange={(e) => setNewsletterPreferences({
                          ...newsletterPreferences,
                          frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                        })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={newsletterLoading}
                      >
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                        <option value="monthly">Monthly Roundup</option>
                      </select>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        How often would you like to receive newsletter updates?
                      </p>
                    </div>

                    {/* Content Types */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Content Preferences
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Choose what types of content you'd like to receive in your newsletter.
                      </p>
                      <div className="space-y-3">
                        {[
                          { key: 'events', label: 'Events', description: 'Upcoming events and meetups', icon: Calendar },
                          { key: 'news', label: 'News & Updates', description: 'Community news and announcements', icon: Newspaper },
                          { key: 'opportunities', label: 'Opportunities', description: 'Jobs and volunteer positions', icon: Briefcase },
                          { key: 'marketplace', label: 'Marketplace', description: 'New items and services', icon: ShoppingBag },
                          { key: 'members', label: 'Member Spotlights', description: 'Featured community members', icon: Users }
                        ].map(({ key, label, description, icon: Icon }) => (
                          <label key={key} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input
                              type="checkbox"
                              checked={newsletterPreferences.contentTypes[key as keyof typeof newsletterPreferences.contentTypes]}
                              onChange={(e) => setNewsletterPreferences({
                                ...newsletterPreferences,
                                contentTypes: {
                                  ...newsletterPreferences.contentTypes,
                                  [key]: e.target.checked
                                }
                              })}
                              className="mt-1 rounded border-slate-300 dark:border-slate-600 text-orange-500 
                                       focus:ring-orange-500 dark:bg-slate-700"
                              disabled={newsletterLoading}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Format & Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email Format
                        </label>
                        <select
                          value={newsletterPreferences.format}
                          onChange={(e) => setNewsletterPreferences({
                            ...newsletterPreferences,
                            format: e.target.value as 'digest' | 'full'
                          })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={newsletterLoading}
                        >
                          <option value="digest">Digest (Summary)</option>
                          <option value="full">Full Content</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Location Filter
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newsletterPreferences.locationFilter}
                            onChange={(e) => setNewsletterPreferences({
                              ...newsletterPreferences,
                              locationFilter: e.target.checked
                            })}
                            className="rounded border-slate-300 dark:border-slate-600 text-orange-500 
                                     focus:ring-orange-500 dark:bg-slate-700"
                            disabled={newsletterLoading}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Prioritize local Nelson content
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Newsletter Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                        About Our Newsletter
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Stay updated with community news and events</li>
                        <li>• Discover new opportunities and resources</li>
                        <li>• Connect with local tech professionals</li>
                        <li>• Unsubscribe anytime with one click</li>
                        <li>• We respect your privacy and never share your email</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Account & Password */}
                  <div className="space-y-8">
                    {/* Account Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Account Information
                      </h3>
                      
                      {/* Email Section */}
                      <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Current Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                                 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                                 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        To change your email, please contact support
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                                 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                                 cursor-not-allowed font-mono text-xs"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Account Created
                      </label>
                      <input
                        type="text"
                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                                 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300
                                 cursor-not-allowed"
                      />
                    </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Update your account password. You'll need to sign in again after changing it.
                      </p>

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

                      <div className="space-y-4">
                        {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
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
                  </div>

                  {/* Update Password Button */}
                  <button
                    onClick={async () => {
                      setPasswordError(null);
                      setPasswordSuccess(false);
                      
                      // Validate passwords
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
                      
                      // Update password
                      setIsSaving(true);
                      try {
                        const result = await resetPassword(newPassword);
                        if (result.success) {
                          setPasswordSuccess(true);
                          setNewPassword('');
                          setConfirmPassword('');
                          // Optionally redirect to sign in after a delay
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
                    }}
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
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Notifications */}
                  <div className="space-y-8">
                    {/* Notification Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Notification Settings
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email Frequency
                          </label>
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
                        </div>

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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

export default UserSettingsPage;