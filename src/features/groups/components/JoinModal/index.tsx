import React, { useState } from 'react';
import { X } from 'lucide-react';
import { JoinModalProps } from './types';
import JoinRequestForm from './JoinRequestForm';
import SuccessMessage from './SuccessMessage';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useGroupsHybrid } from '../../hooks/useGroupsHybrid';

const JoinModal: React.FC<JoinModalProps> = ({ group, onClose }) => {
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSession();
  const { joinGroup } = useGroupsHybrid();
  
  const handleSubmit = async (_message: string) => {
    if (!user) {
      setError('You must be logged in to join a group');
      return;
    }

    setJoining(true);
    setError(null);
    
    try {
      await joinGroup.mutateAsync({
        groupId: group.id
      });
      
      setJoining(false);
      setSuccess(true);
      
      // Close modal after success message is shown
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setJoining(false);
      setError('Failed to join group. Please try again.');
      console.error('Error joining group:', err);
    }
  };

  const _isOpenGroup = group.visibility === 'public'; // 'public' maps to 'open'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {_isOpenGroup ? 'Join Group' : 'Request to Join Group'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!success ? (
          <>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mx-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <JoinRequestForm 
              group={group} 
              onSubmit={handleSubmit} 
              onCancel={onClose}
              joining={joining}
            />
          </>
        ) : (
          <SuccessMessage 
            group={group} 
            isOpenGroup={_isOpenGroup} 
          />
        )}
      </div>
    </div>
  );
};

export default JoinModal;
