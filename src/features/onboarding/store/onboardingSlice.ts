import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { 
  OnboardingState, 
  ProfessionalInfo, 
  CompanyAssociation, 
  PrivacySettings, 
  CommunityEngagement 
} from '../types';

const initialState: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  skippedSteps: [],
  formData: {
    professional: {},
    company: {},
    privacy: {
      profileVisibility: 'members',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowMessages: true,
      allowConnectionRequests: true,
      emailNotifications: {
        newsletter: true,
        events: true,
        opportunities: true,
        messages: true,
      },
    },
    engagement: {
      interests: [],
      groupIds: [],
      volunteeringAvailable: false,
      mentorshipInterest: 'none',
      eventTypes: [],
      communicationPreferences: {
        frequency: 'weekly',
        channels: ['email'],
      },
    },
  },
  isLoading: false,
  isSaving: false,
  errors: {},
  completionPercentage: 0,
  isCompleted: false,
};

const calculateCompletionPercentage = (state: OnboardingState): number => {
  const totalSteps = 5;
  const completedCount = state.completedSteps.length;
  
  // Base percentage from completed steps (80%)
  let percentage = (completedCount / totalSteps) * 80;
  
  // Additional points for filled fields (20%)
  const { professional, company, privacy, engagement } = state.formData;
  
  // Professional info completeness (5%)
  if (professional.bio && professional.bio.length > 50) percentage += 2;
  if (professional.title) percentage += 1;
  if (professional.skills && professional.skills.length > 0) percentage += 1;
  if (professional.employmentStatus) percentage += 1;
  
  // Company association (5%)
  if (company.companyId || company.createNewCompany) percentage += 5;
  
  // Privacy settings (5%)
  if (privacy.profileVisibility !== 'private') percentage += 5;
  
  // Community engagement (5%)
  if (engagement.interests.length > 0) percentage += 2;
  if (engagement.groupIds.length > 0) percentage += 2;
  if (engagement.mentorshipInterest !== 'none') percentage += 1;
  
  return Math.min(Math.round(percentage), 100);
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    
    goToNextStep: (state) => {
      if (state.currentStep < 5) {
        // Mark current step as completed if not already
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.currentStep += 1;
        state.completionPercentage = calculateCompletionPercentage(state);
      }
    },
    
    goToPreviousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    skipCurrentStep: (state) => {
      if (!state.skippedSteps.includes(state.currentStep)) {
        state.skippedSteps.push(state.currentStep);
      }
      if (state.currentStep < 5) {
        state.currentStep += 1;
      }
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
        // Remove from skipped if it was previously skipped
        state.skippedSteps = state.skippedSteps.filter(s => s !== step);
      }
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    updateProfessionalInfo: (state, action: PayloadAction<Partial<ProfessionalInfo>>) => {
      state.formData.professional = { ...state.formData.professional, ...action.payload };
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    updateCompanyAssociation: (state, action: PayloadAction<Partial<CompanyAssociation>>) => {
      state.formData.company = { ...state.formData.company, ...action.payload };
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    updatePrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.formData.privacy = { ...state.formData.privacy, ...action.payload };
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    updateCommunityEngagement: (state, action: PayloadAction<Partial<CommunityEngagement>>) => {
      state.formData.engagement = { ...state.formData.engagement, ...action.payload };
      state.completionPercentage = calculateCompletionPercentage(state);
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    
    setError: (state, action: PayloadAction<{ field: string; message: string }>) => {
      state.errors[action.payload.field] = action.payload.message;
    },
    
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    
    clearAllErrors: (state) => {
      state.errors = {};
    },
    
    completeOnboarding: (state) => {
      state.isCompleted = true;
      state.completionPercentage = 100;
      // Mark all non-skipped steps as completed
      for (let i = 1; i <= 5; i++) {
        if (!state.skippedSteps.includes(i) && !state.completedSteps.includes(i)) {
          state.completedSteps.push(i);
        }
      }
    },
    
    resetOnboarding: () => initialState,
    
    restoreOnboarding: (state, action: PayloadAction<OnboardingState>) => {
      return action.payload;
    },
  },
});

export const {
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  skipCurrentStep,
  markStepCompleted,
  updateProfessionalInfo,
  updateCompanyAssociation,
  updatePrivacySettings,
  updateCommunityEngagement,
  setLoading,
  setSaving,
  setError,
  clearError,
  clearAllErrors,
  completeOnboarding,
  resetOnboarding,
  restoreOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;