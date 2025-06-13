import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { type Group } from './types'; // Fix the import path
import { getVisibilityLabel } from './utils';
import { useGroupMembership } from '../../hooks/useGroupQueries';
import { useCurrentMember } from '../../hooks/useCurrentMember';

interface GroupCardProps {
  group: Group;
  onJoinClick: (group: Group) => void;
}

const GroupCard = ({ group, onJoinClick }: GroupCardProps) => {
  const { data: currentMember } = useCurrentMember();
  const { data: isMember } = useGroupMembership(group?.id, currentMember?.id);
  // Safely extract values from the group object with defaults
  // This prevents TypeScript errors when accessing potentially undefined properties
  const safeId = group?.id ?? ''; 
  const safeName = group?.name ?? 'Unnamed Group';
  const safeHeroImage = group?.heroImage ?? '/placeholder-image.jpg';
  const safeDescription = group?.description ?? 'No description available';
  const safeVisibility = group?.visibility ?? 'open';
  const safeMemberCount = group?.memberCount ?? 0;
  const safeLastActive = group?.lastActive ?? '';
  const safeInterests = group?.interests ?? [];

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
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center mb-1">
              <Link
                to={`/groups/${safeId}`}
                className="text-xl font-semibold text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {safeName}
              </Link>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                {getVisibilityLabel(safeVisibility)}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {safeDescription}
            </p>
            {safeInterests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {safeInterests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {safeInterests.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-slate-500 text-xs">
                    +{safeInterests.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          {safeVisibility !== 'secret' && !isMember && (
            <button
              onClick={() => onJoinClick(group)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              {safeVisibility === 'closed' ? 'Request to Join' : 'Join Group'}
            </button>
          )}
          {isMember && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-md whitespace-nowrap">
              Joined
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Users className="h-5 w-5 mr-2" />
            <span>{safeMemberCount} {safeMemberCount === 1 ? 'member' : 'members'}</span>
          </div>
          {safeLastActive && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <span className="text-xs">Active: {safeLastActive}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
