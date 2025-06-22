import React from 'react';
import type { OnboardingStepProps } from '../../types';

const PrivacySettingsStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Privacy Settings
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        This step is under construction. Click Next to continue.
      </p>
    </div>
  );
};

export default PrivacySettingsStep;