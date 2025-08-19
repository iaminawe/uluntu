import { useEffect, useState } from 'react';
import { useFeatureToggles } from '@/utils/featureToggle';
import type { FeatureKey } from '@/types/settings';
import type { OnboardingStepProps } from '../types';
import WelcomeStep from '../components/steps/WelcomeStep';
import ProfessionalInfoStep from '../components/steps/ProfessionalInfoStep';
import TopicInterestsStep from '../components/steps/TopicInterestsStep';
import CompanyAssociationStep from '../components/steps/CompanyAssociationStep';
import PrivacySettingsStep from '../components/steps/PrivacySettingsStep';
import CommunityEngagementStep from '../components/steps/CommunityEngagementStep';

export interface OnboardingStep {
  id: number;
  name: string;
  component: React.ComponentType<OnboardingStepProps>;
  requiredFeatures?: FeatureKey[];
  optional?: boolean;
}

const ALL_STEPS: OnboardingStep[] = [
  {
    id: 1,
    name: 'Welcome',
    component: WelcomeStep,
  },
  {
    id: 2,
    name: 'Professional Info',
    component: ProfessionalInfoStep,
  },
  {
    id: 3,
    name: 'Topic Interests',
    component: TopicInterestsStep,
    optional: true,
  },
  {
    id: 4,
    name: 'Company Association',
    component: CompanyAssociationStep,
    requiredFeatures: ['companies_listing'],
    optional: true,
  },
  {
    id: 5,
    name: 'Privacy Settings',
    component: PrivacySettingsStep,
  },
  {
    id: 6,
    name: 'Community Engagement',
    component: CommunityEngagementStep,
    requiredFeatures: ['groups_communities', 'events_system'],
    optional: true,
  },
];

/**
 * Hook to get available onboarding steps based on enabled features
 */
export function useOnboardingSteps() {
  const [availableSteps, setAvailableSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get all feature keys that steps depend on
  const requiredFeatureKeys = ALL_STEPS
    .filter(step => step.requiredFeatures)
    .flatMap(step => step.requiredFeatures!)
    .filter((feature, index, self) => self.indexOf(feature) === index); // unique features

  const { toggles, loading: featuresLoading } = useFeatureToggles(requiredFeatureKeys);

  useEffect(() => {
    if (!featuresLoading) {
      // Filter steps based on enabled features
      const filteredSteps = ALL_STEPS.filter(step => {
        // Always include steps without feature requirements
        if (!step.requiredFeatures || step.requiredFeatures.length === 0) {
          return true;
        }

        // Check if all required features are enabled
        const allFeaturesEnabled = step.requiredFeatures.every(
          feature => toggles[feature] === true
        );

        // Include step if all required features are enabled
        return allFeaturesEnabled;
      });

      // Re-number the steps to maintain sequential IDs
      const renumberedSteps = filteredSteps.map((step, index) => ({
        ...step,
        id: index + 1,
      }));

      setAvailableSteps(renumberedSteps);
      setIsLoading(false);
    }
  }, [toggles, featuresLoading]);

  return {
    steps: availableSteps,
    totalSteps: availableSteps.length,
    isLoading,
    getStepComponent: (stepNumber: number) => {
      const step = availableSteps.find(s => s.id === stepNumber);
      return step?.component || null;
    },
    getStepName: (stepNumber: number) => {
      const step = availableSteps.find(s => s.id === stepNumber);
      return step?.name || '';
    },
    isStepOptional: (stepNumber: number) => {
      const step = availableSteps.find(s => s.id === stepNumber);
      return step?.optional || false;
    },
  };
}

/**
 * Check if specific onboarding features are enabled
 */
export function useOnboardingFeatures() {
  const features: FeatureKey[] = [
    'companies_listing',
    'groups_communities', 
    'events_system',
    'user_messaging',
    'newsletter_system'
  ];

  const { toggles, loading } = useFeatureToggles(features);

  return {
    hasCompanies: toggles['companies_listing'] || false,
    hasGroups: toggles['groups_communities'] || false,
    hasEvents: toggles['events_system'] || false,
    hasMessaging: toggles['user_messaging'] || false,
    hasNewsletter: toggles['newsletter_system'] || false,
    isLoading: loading,
  };
}