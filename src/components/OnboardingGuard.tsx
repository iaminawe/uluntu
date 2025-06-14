import React, { useState, useEffect } from 'react';
import { useCurrentMember } from '../hooks/useCurrentMember';
import { useProfileCompletion, shouldShowOnboarding } from '../hooks/useProfileCompletion';
import { ProfileOnboarding } from './Onboarding';

interface OnboardingGuardProps {
  children: React.ReactNode;
  skipOnboarding?: boolean;
}

/**
 * Component that shows onboarding for new users or incomplete profiles
 * Wraps the main app and displays onboarding flow when needed
 */
export function OnboardingGuard({ children, skipOnboarding = false }: OnboardingGuardProps) {
  const { data: member, isLoading } = useCurrentMember();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const shouldShowOnboardingFlow = shouldShowOnboarding(member);

  // Check if we should show onboarding
  useEffect(() => {
    if (isLoading || skipOnboarding) return;

    // Get stored onboarding status from localStorage
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    const onboardingSkipped = localStorage.getItem('onboarding_skipped');

    // Show onboarding if:
    // 1. Profile completion suggests it AND
    // 2. User hasn't completed onboarding AND
    // 3. User hasn't skipped onboarding in this session
    if (shouldShowOnboardingFlow && !onboardingCompleted && !onboardingSkipped) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [member, isLoading, shouldShowOnboardingFlow, skipOnboarding]);

  // Don't show anything while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show onboarding flow
  if (showOnboarding && !hasSeenOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ProfileOnboarding
          onComplete={() => {
            localStorage.setItem('onboarding_completed', 'true');
            setShowOnboarding(false);
            setHasSeenOnboarding(true);
          }}
          onSkip={() => {
            localStorage.setItem('onboarding_skipped', 'true');
            setShowOnboarding(false);
            setHasSeenOnboarding(true);
          }}
          showSkipOption={true}
        />
      </div>
    );
  }

  // Show main app
  return <>{children}</>;
}

/**
 * Hook to manually trigger onboarding flow
 * Useful for "Getting Started" buttons or help sections
 */
export function useOnboardingTrigger() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const triggerOnboarding = () => {
    // Remove completion flags to force onboarding to show
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_skipped');
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    triggerOnboarding,
    completeOnboarding,
    skipOnboarding,
  };
}

/**
 * Check if user needs onboarding without showing the component
 * Useful for conditional rendering of "Complete Profile" prompts
 */
export function useOnboardingStatus() {
  const { data: member, isLoading } = useCurrentMember();
  const { isComplete, completionPercentage, requiredFields } = useProfileCompletion(member);
  
  const needsOnboarding = shouldShowOnboarding(member);
  const onboardingCompleted = localStorage.getItem('onboarding_completed');
  const onboardingSkipped = localStorage.getItem('onboarding_skipped');

  return {
    isLoading,
    needsOnboarding,
    profileComplete: isComplete,
    completionPercentage,
    missingRequiredFields: requiredFields,
    hasCompletedOnboarding: !!onboardingCompleted,
    hasSkippedOnboarding: !!onboardingSkipped,
    shouldShowPrompt: needsOnboarding && !onboardingCompleted && !onboardingSkipped
  };
}