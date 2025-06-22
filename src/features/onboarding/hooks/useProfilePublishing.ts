import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { onboardingApi } from '../api/onboardingApi';
import { toast } from 'react-hot-toast';

export const useProfilePublishing = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    status: string;
    isPublished: boolean;
  } | null>(null);

  const publishProfile = useCallback(async () => {
    if (!user?.id) {
      toast.error('You must be logged in to publish your profile');
      return false;
    }

    setIsPublishing(true);
    try {
      const success = await onboardingApi.publishProfile(user.id);
      
      if (success) {
        setProfileStatus({ status: 'published', isPublished: true });
        toast.success('Your profile is now visible in the directory!');
        return true;
      } else {
        toast.error('Failed to publish your profile. Please try again.');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while publishing your profile.');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [user?.id]);

  const unpublishProfile = useCallback(async () => {
    if (!user?.id) {
      toast.error('You must be logged in to modify your profile');
      return false;
    }

    setIsUnpublishing(true);
    try {
      const success = await onboardingApi.unpublishProfile(user.id);
      
      if (success) {
        setProfileStatus({ status: 'draft', isPublished: false });
        toast.success('Your profile is now private');
        return true;
      } else {
        toast.error('Failed to make your profile private. Please try again.');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile.');
      return false;
    } finally {
      setIsUnpublishing(false);
    }
  }, [user?.id]);

  const checkProfileStatus = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const status = await onboardingApi.getProfileStatus(user.id);
      setProfileStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check profile status:', error);
      return null;
    }
  }, [user?.id]);

  const toggleProfileVisibility = useCallback(async () => {
    if (!profileStatus) {
      await checkProfileStatus();
      return false;
    }

    if (profileStatus.isPublished) {
      return await unpublishProfile();
    } else {
      return await publishProfile();
    }
  }, [profileStatus, publishProfile, unpublishProfile, checkProfileStatus]);

  return {
    // State
    isPublishing,
    isUnpublishing,
    profileStatus,
    isLoading: isPublishing || isUnpublishing,
    
    // Actions
    publishProfile,
    unpublishProfile,
    toggleProfileVisibility,
    checkProfileStatus,
    
    // Computed
    isPublished: profileStatus?.isPublished ?? false,
    canPublish: user?.id != null,
  };
};