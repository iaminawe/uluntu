import React, { useState } from 'react';
import { JoinRequestFormProps } from '@/features/groups/components/JoinModal/types';

const JoinRequestForm: React.FC<JoinRequestFormProps> = ({ 
  group, 
  onSubmit, 
  onCancel 
}) => {
  const [message, setMessage] = useState('');
  const [joining, setJoining] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    onSubmit(message);
  };
  
  const isOpenGroup = group.visibility === 'public'; // 'public' maps to 'open'
  
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="mb-4">
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {isOpenGroup 
            ? `You're about to join ${group.name}. You'll be added to the group immediately.`
            : `${group.name} requires approval from group administrators before new members can join.`}
        </p>
        
        {!isOpenGroup && (
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Message to Group Admins (Optional)
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       text-slate-900 dark:text-white bg-white dark:bg-slate-700
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Introduce yourself and explain why you'd like to join this group..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 dark:text-slate-300 mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={joining}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joining ? 'Processing...' : isOpenGroup ? 'Join Group' : 'Send Request'}
        </button>
      </div>
    </form>
  );
};

export default JoinRequestForm;
