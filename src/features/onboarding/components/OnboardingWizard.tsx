import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingLayout from './OnboardingLayout';
import type { OnboardingStepProps } from '../types';

// Lazy load step components
const WelcomeStep = lazy(() => import('./steps/WelcomeStep'));
const ProfessionalInfoStep = lazy(() => import('./steps/ProfessionalInfoStep'));
const CompanyAssociationStep = lazy(() => import('./steps/CompanyAssociationStep'));
const PrivacySettingsStep = lazy(() => import('./steps/PrivacySettingsStep'));
const CommunityEngagementStep = lazy(() => import('./steps/CommunityEngagementStep'));

const stepComponents: Record<number, React.ComponentType<OnboardingStepProps>> = {
  1: WelcomeStep,
  2: ProfessionalInfoStep,
  3: CompanyAssociationStep,
  4: PrivacySettingsStep,
  5: CommunityEngagementStep,
};

const OnboardingWizard: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { currentStep, isCompleted, handleNext, handleBack, handleSkip, isFirstStep, isLastStep } = useOnboarding();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect if onboarding is already completed
  if (isCompleted) {
    return <Navigate to="/profile" replace />;
  }

  const StepComponent = stepComponents[currentStep];

  if (!StepComponent) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  const stepProps: OnboardingStepProps = {
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    isFirstStep,
    isLastStep,
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