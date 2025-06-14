import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/membersApi';
import { Member, ContentStatus } from '../types';
import { useAuth } from './useAuth';

export interface ProfilePrivacySettings {
  isPublic: boolean;
  status: ContentStatus;
  showInDirectory: boolean;
}

/**
 * Hook for managing user profile privacy settings
 */
export function useProfilePrivacy(member: Member | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Current privacy settings
  const currentSettings: ProfilePrivacySettings = {
    isPublic: member?.status === 'published',
    status: member?.status || 'draft',
    showInDirectory: member?.status === 'published',
  };

  // Mutation to update profile privacy
  const updatePrivacyMutation = useMutation({
    mutationFn: async (newSettings: Partial<ProfilePrivacySettings>) => {
      if (!member?.id) throw new Error('No member profile found');
      
      const status: ContentStatus = newSettings.isPublic !== undefined 
        ? (newSettings.isPublic ? 'published' : 'draft')
        : member.status;

      return await membersApi.update(member.id, { status });
    },
    onSuccess: () => {
      // Invalidate member queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['member', 'current']
      });
      queryClient.invalidateQueries({
        queryKey: ['members']
      });
    },
  });

  /**
   * Toggle profile visibility in public directory
   */
  const togglePublicVisibility = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newIsPublic = !currentSettings.isPublic;
      await updatePrivacyMutation.mutateAsync({ isPublic: newIsPublic });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Set profile to private (hidden from directory)
   */
  const setProfilePrivate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updatePrivacyMutation.mutateAsync({ isPublic: false });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Set profile to public (visible in directory)
   */
  const setProfilePublic = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updatePrivacyMutation.mutateAsync({ isPublic: true });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update profile status directly
   */
  const updateStatus = async (status: ContentStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const isPublic = status === 'published';
      await updatePrivacyMutation.mutateAsync({ isPublic });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    currentSettings,
    isUpdating: isUpdating || updatePrivacyMutation.isPending,
    error: updatePrivacyMutation.error,
    togglePublicVisibility,
    setProfilePrivate,
    setProfilePublic,
    updateStatus,
  };
}

/**
 * Get privacy status display information
 */
export function getPrivacyStatusDisplay(status: ContentStatus) {
  switch (status) {
    case 'published':
      return {
        label: 'Public',
        description: 'Your profile is visible in the community directory and can be found by other members.',
        color: 'green',
        icon: '👁️',
      };
    case 'draft':
      return {
        label: 'Private',
        description: 'Your profile is hidden from the public directory. Only you can see it.',
        color: 'yellow',
        icon: '🔒',
      };
    case 'pending':
      return {
        label: 'Pending Review',
        description: 'Your profile is being reviewed and will be visible once approved.',
        color: 'blue',
        icon: '⏳',
      };
    case 'archived':
      return {
        label: 'Archived',
        description: 'Your profile has been archived and is not visible to others.',
        color: 'gray',
        icon: '📦',
      };
    default:
      return {
        label: 'Unknown',
        description: 'Profile status is unknown.',
        color: 'gray',
        icon: '❓',
      };
  }
}