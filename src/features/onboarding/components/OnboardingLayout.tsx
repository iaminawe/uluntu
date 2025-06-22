import React from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';
import ProgressIndicator from './shared/ProgressIndicator';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  const {
    currentStep,
    completedSteps,
    skippedSteps,
    isFirstStep,
    isLastStep,
    canSkip,
    handleNext,
    handleBack,
    handleSkip,
    isLoading,
    isSaving,
    errors,
  } = useOnboarding();

  const steps = [
    { id: 1, name: 'Welcome', title: 'Get Started' },
    { id: 2, name: 'Professional', title: 'Professional Info' },
    { id: 3, name: 'Company', title: 'Company Association' },
    { id: 4, name: 'Privacy', title: 'Privacy Settings' },
    { id: 5, name: 'Community', title: 'Community Engagement' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to Nelson Tech Community
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Let's set up your profile and get you connected
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            skippedSteps={skippedSteps}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 mb-8">
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
              <div className="text-red-700 dark:text-red-400">
                {Object.entries(errors).map(([field, message]) => (
                  <p key={field} className="text-sm">
                    {message}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {children}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={isFirstStep || isLoading || isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${isFirstStep || isLoading || isSaving
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Skip Button (middle) */}
          {canSkip && (
            <button
              onClick={handleSkip}
              disabled={isLoading || isSaving}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 
                       flex items-center gap-1 text-sm transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip for now
            </button>
          )}

          {/* Next/Complete Button */}
          <button
            onClick={handleNext}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 
                     text-white font-medium rounded-lg transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </>
            ) : (
              <>
                {isLastStep ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Your profile is private by default. You can choose to publish it to the directory at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;