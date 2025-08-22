import React, { useState, useEffect } from 'react';
import { useCurrentMember } from '../hooks/useCurrentMember';
import { useProfileCompletion, shouldShowOnboarding } from '../hooks/useProfileCompletion';
import { useAuth } from '../hooks/useAuth';
import { ProfileOnboarding } from './Onboarding';
import '../utils/clearOnboarding'; // Load the utility in dev mode

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
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const shouldShowOnboardingFlow = shouldShowOnboarding(member);

  // Check if we should show onboarding
  useEffect(() => {
    if (isLoading || authLoading || skipOnboarding) return;
    
    // Don't show onboarding if user is not authenticated
    if (!user) return;

    // Get stored onboarding status with user-specific keys
    const userId = member?.user_id || member?.id;
    const userOnboardingKey = userId ? `onboarding_completed_${userId}` : 'onboarding_completed';
    const userSkipKey = userId ? `onboarding_skipped_${userId}` : 'onboarding_skipped';
    
    // Check if user completed onboarding (persistent)
    const onboardingCompleted = localStorage.getItem(userOnboardingKey);
    // Check if user skipped in this session only (temporary)
    const onboardingSkipped = sessionStorage.getItem(userSkipKey);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[OnboardingGuard] Checking onboarding status:', {
        userId,
        member: member ? { name: member.name, bio: member.bio, image: member.image } : null,
        shouldShowOnboardingFlow,
        onboardingCompleted,
        onboardingSkipped,
      });
    }

    // Show onboarding if:
    // 1. Profile is incomplete (missing required fields) AND
    // 2. User hasn't explicitly completed their profile through onboarding
    // Note: We check profile completion status, not just localStorage
    if (shouldShowOnboardingFlow) {
      // Even if they skipped before, show again if profile is still incomplete
      // Only hide if profile is actually complete or they completed onboarding
      const profileIsComplete = member?.bio && member?.image && 
                               !member.image.includes('placeholder');
      
      if (!profileIsComplete && !onboardingCompleted && !onboardingSkipped) {
        console.log('[OnboardingGuard] Showing onboarding - profile incomplete');
        setShowOnboarding(true);
      } else {
        console.log('[OnboardingGuard] Not showing onboarding:', { 
          profileIsComplete, 
          onboardingCompleted, 
          onboardingSkipped 
        });
        setShowOnboarding(false);
      }
    } else {
      setShowOnboarding(false);
    }
  }, [member, isLoading, authLoading, shouldShowOnboardingFlow, skipOnboarding, user]);

  // Don't show anything while loading
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Onboarding modal is now disabled - using dedicated /onboarding page instead
  // The modal functionality is preserved but never shown
  if (false && showOnboarding && !hasSeenOnboarding) {
    const userId = member?.user_id || member?.id;
    const userOnboardingKey = userId ? `onboarding_completed_${userId}` : 'onboarding_completed';
    const userSkipKey = userId ? `onboarding_skipped_${userId}` : 'onboarding_skipped';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ProfileOnboarding
          onComplete={() => {
            // Only set completed if they actually complete the profile
            localStorage.setItem(userOnboardingKey, 'true');
            setShowOnboarding(false);
            setHasSeenOnboarding(true);
          }}
          onSkip={() => {
            // Set skipped for this session only - will show again next time if profile still incomplete
            sessionStorage.setItem(userSkipKey, 'true');
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