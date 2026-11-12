import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, LogOut } from 'lucide-react';
import { getVisibilityIcon, getVisibilityLabel } from './VisibilityHelper';
import { PageHeaderProps } from './types';
import { useGroupMembership, useJoinGroup, useLeaveGroup } from '../../hooks/useGroupQueries';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { useIsGroupAdmin } from '@/hooks/useEntityPermissions';
import { useState } from 'react';

const PageHeader: React.FC<PageHeaderProps> = ({ group, setShowJoinModal }) => {
  const { data: currentMember } = useCurrentMember();
  const { data: isMember } = useGroupMembership(group.id, currentMember?.id);
  const { data: isGroupAdmin = false } = useIsGroupAdmin(group.id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleJoin = async () => {
    if (!currentMember) {
      setShowJoinModal(true);
      return;
    }

    // For open groups, join directly
    // For closed/secret groups, show the modal for approval
    // Check both possible values since there's inconsistency in the codebase
    if (group.visibility === 'closed' || group.visibility === 'secret' || 
        (group as any).visibility === 'private' || (group as any).visibility === 'members_only') {
      setShowJoinModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      await joinGroup.mutateAsync({
        groupId: group.id
      });
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = async () => {
    if (!currentMember || !window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await leaveGroup.mutateAsync({ groupId: group.id });
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="relative h-96 overflow-hidden">
      <img
        src={group.coverImage || group.heroImage}
        alt={group.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <Link
              to="/groups"
              className="inline-flex items-center text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Link>
            
            <div className="flex flex-wrap justify-between items-end">
              <div>
                <div className="flex items-center mb-2">
                  {getVisibilityIcon(group.visibility)}
                  <span className="text-white/80 ml-2 text-sm">
                    {getVisibilityLabel(group.visibility)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {group.name}
                </h1>
                <p className="text-white/80 max-w-2xl">
                  {group.description}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 space-x-3 flex">
                {!isMember && group.visibility !== 'secret' && (
                  <button
                    onClick={handleJoin}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : (group.visibility === 'closed' || (group as any).visibility === 'private' || (group as any).visibility === 'members_only' ? 'Request to Join' : 'Join Group')}
                  </button>
                )}
                {isMember && (
                  <button
                    onClick={handleLeave}
                    disabled={isProcessing || isGroupAdmin}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    title={isGroupAdmin ? 'Admins cannot leave the group' : ''}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Leave Group'}
                  </button>
                )}
                {isGroupAdmin && (
                  <Link
                    to={`/groups/${group.id}/edit`}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
