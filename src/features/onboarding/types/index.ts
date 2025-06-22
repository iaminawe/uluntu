// Onboarding system types

export interface OnboardingState {
  // Navigation
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  
  // Form Data
  formData: {
    professional: ProfessionalInfo;
    company: CompanyAssociation;
    privacy: PrivacySettings;
    engagement: CommunityEngagement;
  };
  
  // Status
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  
  // Completion
  completionPercentage: number;
  isCompleted: boolean;
}

export interface ProfessionalInfo {
  bio?: string;
  title?: string;
  skills?: string[];
  employmentStatus?: 'employed' | 'self_employed' | 'looking' | 'student' | 'retired' | 'other';
  yearsOfExperience?: number;
  professionalGoals?: string;
}

export interface CompanyAssociation {
  companyId?: string;
  companyName?: string;
  role?: string;
  isVerified?: boolean;
  createNewCompany?: boolean;
  newCompanyData?: {
    name: string;
    website?: string;
    description?: string;
    industry?: string[];
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  allowConnectionRequests: boolean;
  emailNotifications: {
    newsletter: boolean;
    events: boolean;
    opportunities: boolean;
    messages: boolean;
  };
}

export interface CommunityEngagement {
  interests: string[];
  groupIds: string[];
  volunteeringAvailable: boolean;
  mentorshipInterest: 'mentor' | 'mentee' | 'both' | 'none';
  eventTypes: string[];
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'never';
    channels: ('email' | 'sms' | 'in_app')[];
  };
}

export interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  completionPercentage: number;
  isCompleted: boolean;
  lastUpdated: string;
}

export type OnboardingStep = {
  id: number;
  name: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
  required: boolean;
  validationRules?: Record<string, any>;
};

export const ONBOARDING_STEPS = {
  WELCOME: 1,
  PROFESSIONAL_INFO: 2,
  COMPANY_ASSOCIATION: 3,
  PRIVACY_SETTINGS: 4,
  COMMUNITY_ENGAGEMENT: 5,
} as const;

export type OnboardingStepId = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];