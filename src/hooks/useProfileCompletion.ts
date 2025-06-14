import { useMemo } from 'react';
import { Member } from '../types';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
  suggestedFields: string[];
}

const REQUIRED_FIELDS = ['name', 'bio', 'image'] as const;
const SUGGESTED_FIELDS = ['title', 'location', 'intro', 'skills'] as const;

/**
 * Hook to check profile completion status for onboarding and privacy decisions
 */
export function useProfileCompletion(member: Member | null | undefined): ProfileCompletionStatus {
  return useMemo(() => {
    if (!member) {
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: [...REQUIRED_FIELDS, ...SUGGESTED_FIELDS],
        requiredFields: [...REQUIRED_FIELDS],
        suggestedFields: [...SUGGESTED_FIELDS],
      };
    }

    const missingRequired: string[] = [];
    const missingSuggested: string[] = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      const value = member[field];
      if (!value || 
          (typeof value === 'string' && value.trim() === '') ||
          (field === 'image' && (value === '/placeholder-avatar.png' || value.includes('placeholder'))) ||
          (field === 'bio' && value.trim() === '')) {
        missingRequired.push(field);
      }
    });

    // Check suggested fields
    SUGGESTED_FIELDS.forEach(field => {
      const value = member[field];
      if (!value || 
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0)) {
        missingSuggested.push(field);
      }
    });

    const totalFields = REQUIRED_FIELDS.length + SUGGESTED_FIELDS.length;
    const completedFields = totalFields - missingRequired.length - missingSuggested.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // Profile is considered complete when all required fields are filled
    const isComplete = missingRequired.length === 0;

    return {
      isComplete,
      completionPercentage,
      missingFields: [...missingRequired, ...missingSuggested],
      requiredFields: missingRequired,
      suggestedFields: missingSuggested,
    };
  }, [member]);
}

/**
 * Get user-friendly field names for display
 */
export function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    name: 'Full Name',
    bio: 'Bio/About',
    image: 'Profile Photo',
    title: 'Job Title',
    location: 'Location',
    intro: 'Introduction',
    skills: 'Skills',
  };

  return displayNames[field] || field;
}

/**
 * Check if user should see onboarding prompts
 * This is a pure function that doesn't use hooks
 */
export function shouldShowOnboarding(member: Member | null | undefined): boolean {
  if (!member) return true;

  // Check required fields manually (same logic as in useProfileCompletion)
  const missingRequired: string[] = [];
  
  REQUIRED_FIELDS.forEach(field => {
    const value = member[field];
    if (!value || 
        (typeof value === 'string' && value.trim() === '') ||
        (field === 'image' && (value === '/placeholder-avatar.png' || value.includes('placeholder'))) ||
        (field === 'bio' && value.trim() === '')) {
      missingRequired.push(field);
    }
  });

  // Check suggested fields for completion percentage
  const missingSuggested: string[] = [];
  SUGGESTED_FIELDS.forEach(field => {
    const value = member[field];
    if (!value || 
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)) {
      missingSuggested.push(field);
    }
  });

  const totalFields = REQUIRED_FIELDS.length + SUGGESTED_FIELDS.length;
  const completedFields = totalFields - missingRequired.length - missingSuggested.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isComplete = missingRequired.length === 0;
  
  // Show onboarding if profile is less than 60% complete or missing required fields
  return !isComplete || completionPercentage < 60;
}