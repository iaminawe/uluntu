import React from 'react';
import { SuccessMessageProps } from './types';
import { CheckCircle } from 'lucide-react';

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onReset }) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">Thank You!</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Your message has been received. We'll get back to you soon!
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
      >
        Send Another Message
      </button>
    </div>
  );
};

export default SuccessMessage;
