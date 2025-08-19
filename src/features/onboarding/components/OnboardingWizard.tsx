import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useOnboarding } from '../hooks/useOnboarding';
import { useOnboardingSteps } from '../hooks/useOnboardingSteps';
import OnboardingLayout from './OnboardingLayout';
import type { OnboardingStepProps } from '../types';

const OnboardingWizard: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { currentStep, isCompleted, handleNext, handleBack, handleSkip, isFirstStep, isLastStep } = useOnboarding();
  const { steps, isLoading: stepsLoading, getStepComponent, isStepOptional } = useOnboardingSteps();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect if onboarding is already completed
  if (isCompleted) {
    return <Navigate to="/profile" replace />;
  }

  // Show loading while determining available steps
  if (stepsLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading onboarding...</span>
        </div>
      </OnboardingLayout>
    );
  }

  // Adjust current step if it exceeds available steps
  const adjustedCurrentStep = Math.min(currentStep, steps.length);
  const StepComponent = getStepComponent(adjustedCurrentStep);

  if (!StepComponent) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  const stepProps: OnboardingStepProps = {
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    isFirstStep: adjustedCurrentStep === 1,
    isLastStep: adjustedCurrentStep === steps.length,
  };

  return (
    <OnboardingLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        }
      >
        <StepComponent {...stepProps} />
      </Suspense>
    </OnboardingLayout>
  );
};

export default OnboardingWizard;