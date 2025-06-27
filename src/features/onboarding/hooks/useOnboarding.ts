import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
import type { OnboardingState } from '../types';

export const useOnboarding = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onboarding = useAppSelector((state) => state.onboarding);
  const { user } = useAppSelector((state) => state.auth);

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

  // Handle step navigation
  const handleNext = useCallback(async () => {
    dispatch(clearAllErrors());
    
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Save progress to database
    await saveProgress();

    // Move to next step
    dispatch(goToNextStep());

    // If this was the last step, complete onboarding
    if (onboarding.currentStep === 5) {
      await handleComplete();
    }
  }, [dispatch, onboarding.currentStep]);

  const handleBack = useCallback(() => {
    dispatch(goToPreviousStep());
  }, [dispatch]);

  const handleSkip = useCallback(async () => {
    dispatch(skipCurrentStep());
    await saveProgress();
  }, [dispatch]);

  const handleComplete = useCallback(async () => {
    dispatch(setSaving(true));
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { professional, company, privacy, engagement } = onboarding.formData;

      // Update member profile with all onboarding data
      const updateData: any = {
        // Onboarding tracking
        onboarding_completed_at: new Date().toISOString(),
        onboarding_current_step: 5,
        profile_completion_percentage: onboarding.completionPercentage,
        privacy_settings: privacy,

        // Professional information
        bio: professional.bio,
        title: professional.title,
        employment_status: professional.employmentStatus,
        
        // Privacy and profile status
        status: privacy.profileVisibility === 'private' ? 'draft' : 'published',
      };

      // Update member profile
      const { error: memberError } = await supabase
        .from('members')
        .update(updateData)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Save skills if provided
      if (professional.skills && professional.skills.length > 0) {
        // First, delete existing skills
        await supabase
          .from('member_skills')
          .delete()
          .eq('member_id', user.id);

        // Then insert new skills
        const skillsData = professional.skills.map(skill => ({
          member_id: user.id,
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
      if (company.companyId && company.role) {
        const { error: companyError } = await supabase
          .from('company_members')
          .insert({
            company_id: company.companyId,
            member_id: user.id,
            role: company.role,
            verified: false,
          });

        if (companyError) {
          console.warn('Failed to save company association:', companyError);
        }
      }

      // Save group memberships if selected
      if (engagement.groupIds && engagement.groupIds.length > 0) {
        const groupMemberships = engagement.groupIds.map(groupId => ({
          group_id: groupId,
          member_id: user.id,
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

      // Redirect based on profile visibility
      if (privacy.profileVisibility === 'private') {
        navigate('/profile/edit?onboarding=complete');
      } else {
        navigate('/directory?welcome=true');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      dispatch(setError({ field: 'general', message: 'Failed to save your progress. Please try again.' }));
    } finally {
      dispatch(setSaving(false));
    }
  }, [dispatch, navigate, onboarding, user]);

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

      if (error) throw error;
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
      case 5: // Community Engagement
        if (onboarding.formData.engagement.interests.length === 0) {
          dispatch(setError({ field: 'interests', message: 'Please select at least one area of interest' }));
          return false;
        }
        break;
    }
    
    return true;
  }, [dispatch, onboarding]);

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
    isLastStep: onboarding.currentStep === 5,
    canGoBack: onboarding.currentStep > 1,
    canSkip: onboarding.currentStep !== 5, // Can't skip the last step
  };
};