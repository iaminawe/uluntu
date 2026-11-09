import { Link } from 'react-router-dom';
import { Users, Calendar, CalendarDays, FileText, Folder, Image, Briefcase, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { type Group, GroupVisibility } from './types'; // Fix the import path
import { getVisibilityLabel } from './utils';
import { getGroupUrl } from '@/utils/contentUrlUtils';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useJoinGroup, useGroupMembership } from '@/hooks/useGroupQueries';
import { useAuth } from '@/hooks/useAuth';
import { useFeature } from '@/providers/SettingsProvider';

// Format date to a nice readable format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  } catch {
    return dateString;
  }
};

// Map main Group visibility to local component visibility
const mapVisibility = (visibility: 'public' | 'private' | 'members_only'): GroupVisibility => {
  switch (visibility) {
    case 'public': return 'public';
    case 'private': return 'private';
    case 'members_only': return 'members_only';
    default: return 'public';
  }
};

interface GroupCardProps {
  group: Group;
  onJoinClick: (group: Group) => void;
}

const GroupCard = ({ group, onJoinClick }: GroupCardProps) => {
  const { user } = useAuth();
  const { data: currentMember } = useCurrentMember();
  // Use user.id instead of member.id for membership check
  const { data: isMember } = useGroupMembership(group?.id, user?.id);
  const joinGroup = useJoinGroup();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Feature flags
  const galleriesEnabled = useFeature('photo_galleries');
  const opportunitiesEnabled = useFeature('opportunities_board');
  const marketplaceEnabled = useFeature('marketplace');
  
  // Safely extract values from the group object with defaults
  // This prevents TypeScript errors when accessing potentially undefined properties
  const safeId = group?.id ?? ''; 
  const safeName = group?.name ?? 'Unnamed Group';
  const safeHeroImage = group?.heroImage ?? '/placeholder-image.png';
  const safeDescription = group?.description ?? 'No description available';
  const safeVisibility = mapVisibility(group?.visibility ?? 'public');
  const safeMemberCount = group?.memberCount ?? 0;
  const safeEventCount = group?.eventCount ?? 0;
  const safeResourceCount = group?.resourceCount ?? 0;
  const safePostCount = group?.postCount ?? 0;
  const safeGalleryCount = group?.galleryCount ?? 0;
  const safeOpportunityCount = group?.opportunityCount ?? 0;
  const safeMarketplaceCount = group?.marketplaceCount ?? 0;
  const safeLastActive = group?.lastActive ?? '';

  const handleJoinClick = async () => {
    // If user is not logged in, always show modal
    if (!currentMember) {
      onJoinClick(group);
      return;
    }

    // For closed/private groups (not public/open), show the modal for approval request
    // Handle both 'public' (database value) and 'open' (sometimes transformed value)
    const isOpenGroup = group.visibility === 'public' || (group as any).visibility === 'open';
    if (!isOpenGroup) {
      onJoinClick(group);
      return;
    }

    // For open groups, join directly without modal
    setIsProcessing(true);
    try {
      await joinGroup.mutateAsync({
        groupId: group.id
      });
    } catch (error) {
      console.error('Error joining group:', error);
      // Fall back to modal on error
      onJoinClick(group);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={safeHeroImage}
          alt={safeName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Link
              to={getGroupUrl(group)}
              className="text-xl font-semibold text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
            >
              {safeName}
            </Link>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
              {getVisibilityLabel(safeVisibility)}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mt-2 mb-4">
            {safeDescription}
          </p>
          {safeVisibility !== 'members_only' && (
            <div className="flex">
              {isMember ? (
                <Link
                  to={getGroupUrl(group)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors whitespace-nowrap inline-flex items-center justify-center"
                >
                  View Group
                </Link>
              ) : (
                <button
                  onClick={handleJoinClick}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 
                    ((group.visibility === 'public' || (group as any).visibility === 'open') ? 'Join Group' : 'Request to Join')
                  }
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Users className="h-4 w-4 mr-1.5 text-slate-400" />
              <span>{safeMemberCount} {safeMemberCount === 1 ? 'member' : 'members'}</span>
            </div>
            {safeEventCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <CalendarDays className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safeEventCount} {safeEventCount === 1 ? 'event' : 'events'}</span>
              </div>
            )}
            {safeResourceCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Folder className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safeResourceCount} {safeResourceCount === 1 ? 'resource' : 'resources'}</span>
              </div>
            )}
            {safePostCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <FileText className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safePostCount} {safePostCount === 1 ? 'post' : 'posts'}</span>
              </div>
            )}
            {galleriesEnabled && safeGalleryCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Image className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safeGalleryCount} {safeGalleryCount === 1 ? 'gallery' : 'galleries'}</span>
              </div>
            )}
            {opportunitiesEnabled && safeOpportunityCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Briefcase className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safeOpportunityCount} {safeOpportunityCount === 1 ? 'opportunity' : 'opportunities'}</span>
              </div>
            )}
            {marketplaceEnabled && safeMarketplaceCount > 0 && (
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <ShoppingBag className="h-4 w-4 mr-1.5 text-slate-400" />
                <span>{safeMarketplaceCount} {safeMarketplaceCount === 1 ? 'listing' : 'listings'}</span>
              </div>
            )}
          </div>
          {safeLastActive && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Last active {formatDate(safeLastActive)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;

// Adapter function for component compatibility  
export const adaptMainGroupToLocalGroup = (mainGroup: any): Group => {
  return {
    ...mainGroup,
    visibility: mapVisibility(mainGroup.visibility)
  };
};
