import { X } from 'lucide-react';
import { type Group } from './types';
import { useJoinGroup } from '../../hooks/useGroupQueries';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { useState } from 'react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
}

const JoinModal = ({ isOpen, onClose, group }: JoinModalProps) => {
  const { data: currentMember } = useCurrentMember();
  const joinGroup = useJoinGroup();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !group) return null;

  const handleJoin = async () => {
    if (!currentMember) {
      setError('You must be logged in to join a group');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await joinGroup.mutateAsync({
        groupId: group.id,
        memberId: currentMember.id
      });
      onClose();
    } catch (err) {
      setError('Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Join {group.name}?
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          {group.visibility === 'closed' 
            ? `This is a closed group. Your request to join will need to be approved by an admin.`
            : `You'll be able to participate in all group activities and discussions.`
          }
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : group.visibility === 'closed' ? 'Request to Join' : 'Join Group'}
          </button>
          <button
            onClick={onClose}
            disabled={isJoining}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;