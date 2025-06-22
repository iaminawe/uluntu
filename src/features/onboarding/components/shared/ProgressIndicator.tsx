import React from 'react';
import { Check, X } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  title: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  skippedSteps,
}) => {
  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (skippedSteps.includes(stepId)) return 'skipped';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'completed'; // Past steps are considered completed
    return 'upcoming';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'skipped':
        return 'bg-yellow-500 text-white';
      case 'current':
        return 'bg-orange-500 text-white ring-4 ring-orange-200 dark:ring-orange-800';
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
    }
  };

  const getLineClasses = (stepId: number) => {
    const status = getStepStatus(stepId);
    const nextStatus = stepId < steps.length ? getStepStatus(stepId + 1) : null;
    
    if (status === 'completed' && (nextStatus === 'completed' || nextStatus === 'current' || nextStatus === 'skipped')) {
      return 'bg-green-500';
    }
    if (status === 'skipped' && (nextStatus === 'completed' || nextStatus === 'current' || nextStatus === 'skipped')) {
      return 'bg-yellow-500';
    }
    return 'bg-slate-200 dark:bg-slate-700';
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="relative flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      font-semibold transition-all duration-300
                      ${getStepClasses(status)}
                    `}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : status === 'skipped' ? (
                      <X className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      status === 'current' 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : status === 'completed' || status === 'skipped'
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      status === 'current'
                        ? 'text-slate-600 dark:text-slate-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-4 -mt-8">
                    <div className={`h-full transition-all duration-300 ${getLineClasses(step.id)}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;