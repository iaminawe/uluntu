import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { JoinModalProps } from './types';
import JoinRequestForm from './JoinRequestForm';
import SuccessMessage from './SuccessMessage';

const JoinModal: React.FC<JoinModalProps> = ({ group, onClose }) => {
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = (message: string) => {
    setJoining(true);
    
    // Simulate API call to join group
    setTimeout(() => {
      setJoining(false);
      setSuccess(true);
      
      // Close modal after success message is shown
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  const isOpenGroup = group.visibility === 'open';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isOpenGroup ? 'Join Group' : 'Request to Join Group'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!success ? (
          <JoinRequestForm 
            group={group} 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
          />
        ) : (
          <SuccessMessage 
            group={group} 
            isOpenGroup={isOpenGroup} 
          />
        )}
      </div>
    </div>
  );
};

export default JoinModal;
