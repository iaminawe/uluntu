import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { generateMemberSlug } from '@/utils/memberSlugUtils';
import {
  goToNextStep,
  goToPreviousStep,
  skipCurrentStep,
  markStepCompleted,
  setSaving,
  setError,
  clearAllErrors,
  completeOnboarding,
  restoreOnboarding,
} from '../store/onboardingSlice';
import { useOnboardingSteps } from './useOnboardingSteps';
import type { OnboardingState } from '../types';

export const useOnboarding = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onboarding = useAppSelector((state) => state.onboarding);
  const { user } = useAppSelector((state) => state.auth);
  const { totalSteps } = useOnboardingSteps();

  // Auto-save onboarding progress to localStorage
  useEffect(() => {
    if (onboarding.currentStep > 1 || onboarding.formData) {
      localStorage.setItem('onboarding_progress', JSON.stringify(onboarding));
    }
  }, [onboarding]);

  // Restore onboarding progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress && !onboarding.isCompleted) {
      try {
        const parsed = JSON.parse(savedProgress) as OnboardingState;
        dispatch(restoreOnboarding(parsed));
      } catch (error) {
        console.error('Failed to restore onboarding progress:', error);
      }
    }
  }, [dispatch, onboarding.isCompleted]);

  const saveProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({
          // @ts-expect-error - Onboarding fields exist in database but not in types yet
          onboarding_current_step: onboarding.currentStep,
          onboarding_skipped_steps: onboarding.skippedSteps,
          profile_completion_percentage: onboarding.completionPercentage,
        })
        .eq('user_id', user.id);

      if (error) {
        // Check if error is due to missing columns
        if (error.code === 'PGRST204' && error.message?.includes('onboarding_current_step')) {
          console.warn('Onboarding columns not yet available in database. Progress saved locally only.');
          // Continue without throwing - progress is saved in localStorage
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }, [user, onboarding]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    // Step-specific validation logic
    switch (onboarding.currentStep) {
      case 2: // Professional Info
        if (!onboarding.formData.professional.bio || onboarding.formData.professional.bio.length < 20) {
          dispatch(setError({ field: 'bio', message: 'Please provide a bio of at least 20 characters' }));
          return false;
        }
        break;
      case 3: // Company Association
        // Optional step, no validation required
        break;
      case 4: // Privacy Settings
        // Already has defaults, no validation required
        break;
      default:
        // For any additional steps, no specific validation required
        break;
    }
    
    return true;
  }, [dispatch, onboarding]);

  const handleComplete = useCallback(async () => {
    dispatch(setSaving(true));
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { professional, company, privacy, engagement } = onboarding.formData;

      // First, check if the member already has a slug
      const { data: currentMember } = await supabase
        .from('members')
        .select('slug, name')
        .eq('user_id', user.id)
        .single();

      // Generate a slug if the member doesn't have one
      let slug: string | undefined;
      if (!currentMember?.slug) {
        const nameToUse = professional.name || currentMember?.name || user.email?.split('@')[0] || 'member';
        slug = await generateMemberSlug(nameToUse, user.id);
      }

      // Update member profile with all onboarding data
      const updateData: any = {
        // Professional information
        ...(professional.name && { name: professional.name }), // Only update name if provided
        bio: professional.bio,
        title: professional.title,
        employment_status: professional.employmentStatus,
        professional_goals: professional.professionalGoals,
        years_of_experience: professional.yearsOfExperience,
        
        // Add slug if generated
        ...(slug && { slug }),
        
        // Privacy and profile status
        status: privacy.profileVisibility === 'private' ? 'draft' : 'published',
        privacy_settings: privacy,
      };
      
      // Only add onboarding tracking fields if they exist in the database
      // This prevents errors if the migration hasn't been run yet
      const onboardingData = {
        onboarding_completed_at: new Date().toISOString(),
        onboarding_current_step: totalSteps,
        profile_completion_percentage: onboarding.completionPercentage,
      };

      // First try to update with onboarding fields
      const { error: memberErrorWithOnboarding } = await supabase
        .from('members')
        .update({ ...updateData, ...onboardingData })
        .eq('user_id', user.id);

      if (memberErrorWithOnboarding) {
        // If it fails due to missing columns, try without onboarding fields
        if (memberErrorWithOnboarding.code === 'PGRST204') {
          console.warn('Onboarding columns not available, updating without tracking fields');
          const { error: memberError } = await supabase
            .from('members')
            .update(updateData)
            .eq('user_id', user.id);
          
          if (memberError) throw memberError;
        } else {
          throw memberErrorWithOnboarding;
        }
      }

      // Get the actual member ID from the database
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      const memberId = memberData?.id;
      if (!memberId) {
        console.warn('Could not find member ID for user:', user.id);
      }

      // Save skills if provided
      if (professional.skills && professional.skills.length > 0 && memberId) {
        // First, delete existing skills
        await supabase
          .from('member_skills')
          .delete()
          .eq('member_id', memberId);

        // Then insert new skills
        const skillsData = professional.skills.map(skill => ({
          member_id: memberId,
          skill: skill,
          level: 'intermediate', // Default level
        }));

        const { error: skillsError } = await supabase
          .from('member_skills')
          .insert(skillsData);

        if (skillsError) {
          console.warn('Failed to save skills:', skillsError);
        }
      }

      // Save company association if provided
      if (company.companyId && company.role && memberId) {
        const { error: companyError } = await supabase
          .from('company_members')
          .insert({
            company_id: company.companyId,
            member_id: memberId,
            role: company.role,
            verified: false,
          });

        if (companyError) {
          console.warn('Failed to save company association:', companyError);
        }
      }

      // Save group memberships if selected
      if (engagement.groupIds && engagement.groupIds.length > 0 && memberId) {
        const groupMemberships = engagement.groupIds.map(groupId => ({
          group_id: groupId,
          member_id: memberId,
          role: 'member',
          status: 'active',
        }));

        const { error: groupError } = await supabase
          .from('group_members')
          .insert(groupMemberships);

        if (groupError) {
          console.warn('Failed to save group memberships:', groupError);
        }
      }

      // Clear localStorage
      localStorage.removeItem('onboarding_progress');

      // Mark as completed
      dispatch(completeOnboarding());

      // Get the final slug for the profile URL
      const finalSlug = slug || currentMember?.slug;

      // Redirect based on profile visibility
      if (privacy.profileVisibility === 'private') {
        navigate('/profile/edit?onboarding=complete');
      } else if (finalSlug) {
        // Navigate to the user's profile page if we have a slug
        navigate(`/directory/${finalSlug}?welcome=true`);
      } else {
        // Fallback to directory listing if no slug
        navigate('/directory?welcome=true');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      dispatch(setError({ field: 'general', message: 'Failed to save your progress. Please try again.' }));
    } finally {
      dispatch(setSaving(false));
    }
  }, [dispatch, navigate, onboarding, user]);

  // Handle step navigation
  const handleNext = useCallback(async () => {
    dispatch(clearAllErrors());
    
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Save progress to database
    await saveProgress();

    // If this is the last step, complete onboarding
    if (onboarding.currentStep >= totalSteps) {
      await handleComplete();
    } else {
      // Move to next step
      dispatch(goToNextStep());
    }
  }, [dispatch, onboarding.currentStep, totalSteps, handleComplete, validateCurrentStep, saveProgress]);

  const handleBack = useCallback(() => {
    dispatch(goToPreviousStep());
  }, [dispatch]);

  const handleSkip = useCallback(async () => {
    dispatch(skipCurrentStep());
    await saveProgress();
  }, [dispatch, saveProgress]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      navigate(`/onboarding/step-${step}`);
    }
  }, [navigate]);

  return {
    // State
    ...onboarding,
    
    // Actions
    handleNext,
    handleBack,
    handleSkip,
    handleComplete,
    goToStep,
    saveProgress,
    
    // Computed
    isFirstStep: onboarding.currentStep === 1,
    isLastStep: onboarding.currentStep >= totalSteps,
    canGoBack: onboarding.currentStep > 1,
    canSkip: onboarding.currentStep < totalSteps, // Can't skip the last step
  };
};