import React from 'react';
import { SuccessMessageProps } from './types';

const SuccessMessage: React.FC<SuccessMessageProps> = ({ group, isOpenGroup }) => {
  return (
    <div className="p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
        <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {isOpenGroup ? 'Successfully joined!' : 'Request sent!'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300">
        {isOpenGroup
          ? `You are now a member of ${group.name}.`
          : `Your request to join ${group.name} has been sent to the group administrators.`}
      </p>
    </div>
  );
};

export default SuccessMessage;
