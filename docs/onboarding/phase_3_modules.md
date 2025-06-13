# User Onboarding System - Modular Architecture

## Module Overview

The onboarding system is designed as a collection of modular, reusable components that work together to provide a comprehensive user onboarding experience. Each module has clear responsibilities and interfaces.

## 1. Core Modules Structure

```
src/features/onboarding/
├── components/
│   ├── OnboardingWizard/
│   │   ├── index.tsx
│   │   ├── OnboardingWizard.tsx
│   │   ├── OnboardingProgress.tsx
│   │   └── OnboardingNavigation.tsx
│   ├── steps/
│   │   ├── WelcomeStep/
│   │   ├── ProfessionalInfoStep/
│   │   ├── PrivacySettingsStep/
│   │   ├── CompanyAssociationStep/
│   │   └── CommunityEngagementStep/
│   └── shared/
│       ├── StepContainer.tsx
│       ├── ProgressIndicator.tsx
│       └── SkipButton.tsx
├── hooks/
│   ├── useOnboarding.ts
│   ├── useOnboardingProgress.ts
│   └── useStepValidation.ts
├── services/
│   ├── onboardingService.ts
│   ├── profileCompletionService.ts
│   └── companyAssociationService.ts
├── state/
│   ├── onboardingSlice.ts
│   └── onboardingSelectors.ts
├── types/
│   └── onboarding.types.ts
└── utils/
    ├── validators.ts
    ├── stepConfig.ts
    └── progressCalculator.ts
```

## 2. Module Specifications

### 2.1 OnboardingWizard Module

**Purpose**: Main container component that orchestrates the entire onboarding flow.

**Responsibilities**:
- Manage step navigation
- Track overall progress
- Handle save/resume functionality
- Coordinate between steps

**Interface**:
```typescript
interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
  onExit: () => void;
}

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  stepData: Record<number, any>;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

**Key Methods**:
- `navigateToStep(stepNumber: number)`
- `saveProgress()`
- `completeOnboarding()`
- `handleStepCompletion(stepNumber: number, data: any)`

### 2.2 Step Component Modules

Each step is a self-contained module with its own logic and UI.

#### 2.2.1 WelcomeStep Module

**Purpose**: Collect basic user information and introduce the platform.

**Components**:
```typescript
// WelcomeStep/index.tsx
interface WelcomeStepProps {
  userData: UserBasicInfo;
  onNext: (data: UserBasicInfo) => void;
  onSkip?: never; // Cannot skip
}

// Sub-components
- WelcomeMessage.tsx
- BasicInfoForm.tsx
- ProfilePhotoUpload.tsx
```

#### 2.2.2 ProfessionalInfoStep Module

**Purpose**: Gather professional details, skills, and experience.

**Components**:
```typescript
// ProfessionalInfoStep/index.tsx
interface ProfessionalInfoStepProps {
  userData: UserProfessionalInfo;
  onNext: (data: UserProfessionalInfo) => void;
  onSkip: () => void;
}

// Sub-components
- BioEditor.tsx
- SkillsSelector.tsx
- EmploymentStatusSelect.tsx
- ExperienceSlider.tsx
```

#### 2.2.3 PrivacySettingsStep Module

**Purpose**: Configure privacy preferences and data sharing settings.

**Components**:
```typescript
// PrivacySettingsStep/index.tsx
interface PrivacySettingsStepProps {
  settings: PrivacySettings;
  onNext: (settings: PrivacySettings) => void;
  onSkip?: never; // Cannot skip
}

// Sub-components
- VisibilityControls.tsx
- NotificationPreferences.tsx
- DataSharingConsent.tsx
```

#### 2.2.4 CompanyAssociationStep Module

**Purpose**: Handle company joining or creation.

**Components**:
```typescript
// CompanyAssociationStep/index.tsx
interface CompanyAssociationStepProps {
  onNext: (data: CompanyAssociationData) => void;
  onSkip: () => void;
}

// Sub-components
- CompanySearch.tsx
- CompanyCreationForm.tsx
- EmployeeVerification.tsx
- CompanySelector.tsx
```

#### 2.2.5 CommunityEngagementStep Module

**Purpose**: Set up interests, groups, and networking preferences.

**Components**:
```typescript
// CommunityEngagementStep/index.tsx
interface CommunityEngagementStepProps {
  userData: CommunityPreferences;
  onNext: (data: CommunityPreferences) => void;
  onSkip: () => void;
}

// Sub-components
- InterestSelector.tsx
- GroupRecommendations.tsx
- MentorshipPreferences.tsx
- VolunteeringOptions.tsx
```

### 2.3 Service Modules

#### 2.3.1 OnboardingService

**Purpose**: Handle API communication and business logic.

**Methods**:
```typescript
class OnboardingService {
  // Session management
  async createSession(userId: string): Promise<OnboardingSession>
  async getSession(userId: string): Promise<OnboardingSession | null>
  async updateSession(userId: string, updates: Partial<OnboardingSession>): Promise<void>
  
  // Step data management
  async saveStepData(userId: string, step: number, data: any): Promise<void>
  async getStepData(userId: string, step: number): Promise<any>
  
  // Completion
  async completeOnboarding(userId: string): Promise<CompletionResult>
  
  // Progress tracking
  async updateProgress(userId: string, progress: ProgressData): Promise<void>
}
```

#### 2.3.2 ProfileCompletionService

**Purpose**: Calculate and track profile completion metrics.

**Methods**:
```typescript
class ProfileCompletionService {
  calculateCompletion(userId: string): Promise<ProfileCompletion>
  getIncompleteFields(userId: string): Promise<string[]>
  getMilestones(userId: string): Promise<Milestone[]>
  updateCompletionScore(userId: string): Promise<number>
}
```

#### 2.3.3 CompanyAssociationService

**Purpose**: Handle company-related operations.

**Methods**:
```typescript
class CompanyAssociationService {
  searchCompanies(query: string): Promise<Company[]>
  createCompany(data: CompanyCreationData): Promise<Company>
  joinCompany(userId: string, companyId: string, role: string): Promise<void>
  verifyEmployment(userId: string, companyId: string, token: string): Promise<boolean>
  sendVerificationRequest(userId: string, companyId: string): Promise<void>
}
```

### 2.4 State Management Module

**Purpose**: Centralized state management using Redux.

```typescript
// onboardingSlice.ts
interface OnboardingSliceState {
  session: OnboardingSession | null;
  currentStep: number;
  stepData: Record<number, any>;
  progress: ProgressData;
  isLoading: boolean;
  errors: Record<string, string>;
  validationErrors: Record<number, ValidationError[]>;
}

// Actions
- initializeOnboarding
- updateStepData
- navigateToStep
- completeStep
- skipStep
- saveProgress
- completeOnboarding
- setError
- clearError

// Selectors
- selectCurrentStep
- selectStepData
- selectProgress
- selectCanComplete
- selectValidationErrors
```

### 2.5 Hook Modules

#### 2.5.1 useOnboarding Hook

**Purpose**: Main hook for onboarding functionality.

```typescript
function useOnboarding() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectOnboardingState);
  
  return {
    // State
    currentStep: state.currentStep,
    progress: state.progress,
    isLoading: state.isLoading,
    
    // Actions
    initializeOnboarding: (userId: string) => void,
    navigateToStep: (step: number) => void,
    saveStepData: (step: number, data: any) => void,
    completeStep: (step: number) => void,
    skipStep: (step: number) => void,
    completeOnboarding: () => void,
    
    // Helpers
    canNavigateForward: boolean,
    canComplete: boolean,
    getStepData: (step: number) => any,
  };
}
```

#### 2.5.2 useOnboardingProgress Hook

**Purpose**: Track and display progress metrics.

```typescript
function useOnboardingProgress() {
  const progress = useAppSelector(selectProgress);
  
  return {
    percentage: progress.percentage,
    completedSteps: progress.completedSteps,
    totalSteps: progress.totalSteps,
    mandatoryStepsComplete: progress.mandatoryStepsComplete,
    currentMilestone: progress.currentMilestone,
    nextMilestone: progress.nextMilestone,
    estimatedTimeRemaining: progress.estimatedTimeRemaining,
  };
}
```

#### 2.5.3 useStepValidation Hook

**Purpose**: Handle step-specific validation.

```typescript
function useStepValidation(stepNumber: number) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const validate = async (data: any): Promise<boolean> => {
    // Step-specific validation logic
  };
  
  return {
    errors,
    isValidating,
    validate,
    clearErrors: () => setErrors([]),
    hasErrors: errors.length > 0,
  };
}
```

### 2.6 Utility Modules

#### 2.6.1 Validators

**Purpose**: Centralized validation logic.

```typescript
// validators.ts
export const validators = {
  // Basic validators
  required: (value: any) => boolean,
  email: (value: string) => boolean,
  minLength: (min: number) => (value: string) => boolean,
  maxLength: (max: number) => (value: string) => boolean,
  
  // Step-specific validators
  validateBasicInfo: (data: UserBasicInfo) => ValidationResult,
  validateProfessionalInfo: (data: UserProfessionalInfo) => ValidationResult,
  validatePrivacySettings: (settings: PrivacySettings) => ValidationResult,
  validateCompanyData: (data: CompanyAssociationData) => ValidationResult,
  validateCommunityPreferences: (prefs: CommunityPreferences) => ValidationResult,
};
```

#### 2.6.2 Step Configuration

**Purpose**: Define step metadata and configuration.

```typescript
// stepConfig.ts
export const ONBOARDING_STEPS = [
  {
    id: 1,
    name: 'welcome',
    title: 'Welcome & Basic Info',
    component: WelcomeStep,
    mandatory: true,
    estimatedTime: 2, // minutes
    fields: ['name', 'title', 'location', 'profilePhoto'],
  },
  {
    id: 2,
    name: 'professional',
    title: 'Professional Information',
    component: ProfessionalInfoStep,
    mandatory: false,
    estimatedTime: 3,
    fields: ['bio', 'skills', 'employmentStatus', 'experience'],
  },
  // ... other steps
];

export const getStepConfig = (stepId: number) => ONBOARDING_STEPS.find(s => s.id === stepId);
export const getMandatorySteps = () => ONBOARDING_STEPS.filter(s => s.mandatory);
export const getTotalEstimatedTime = () => ONBOARDING_STEPS.reduce((sum, s) => sum + s.estimatedTime, 0);
```

#### 2.6.3 Progress Calculator

**Purpose**: Calculate completion metrics.

```typescript
// progressCalculator.ts
export class ProgressCalculator {
  static calculateOverallProgress(completedSteps: number[], totalSteps: number): number {
    return (completedSteps.length / totalSteps) * 100;
  }
  
  static calculateFieldProgress(fields: FieldCompletion[]): number {
    const completed = fields.filter(f => f.completed).length;
    return (completed / fields.length) * 100;
  }
  
  static calculateWeightedProgress(sections: SectionProgress[]): number {
    const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = sections.reduce((sum, s) => sum + (s.completion * s.weight), 0);
    return (weightedSum / totalWeight);
  }
  
  static getProfileCompletionLevel(percentage: number): CompletionLevel {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'incomplete';
  }
}
```

## 3. Module Integration Points

### 3.1 API Integration

```typescript
// API endpoints used by modules
const ONBOARDING_ENDPOINTS = {
  // Session management
  CREATE_SESSION: '/api/onboarding/session',
  GET_SESSION: '/api/onboarding/session/:userId',
  UPDATE_SESSION: '/api/onboarding/session/:userId',
  
  // Step data
  SAVE_STEP_DATA: '/api/onboarding/step/:stepId',
  GET_STEP_DATA: '/api/onboarding/step/:stepId',
  
  // Completion
  COMPLETE_ONBOARDING: '/api/onboarding/complete',
  
  // Company operations
  SEARCH_COMPANIES: '/api/companies/search',
  CREATE_COMPANY: '/api/companies',
  JOIN_COMPANY: '/api/companies/:companyId/employees',
  
  // Profile operations
  UPDATE_PROFILE: '/api/members/:userId',
  UPLOAD_PHOTO: '/api/members/:userId/photo',
  UPDATE_SKILLS: '/api/members/:userId/skills',
};
```

### 3.2 Database Integration

```typescript
// Database tables accessed by modules
const DATABASE_SCHEMA = {
  members: {
    // Extended for onboarding
    onboarding_completed_at: 'timestamp',
    onboarding_current_step: 'integer',
    onboarding_skipped_steps: 'jsonb',
    profile_completion_percentage: 'integer',
    privacy_settings: 'jsonb',
  },
  
  onboarding_sessions: {
    id: 'uuid',
    user_id: 'uuid',
    current_step: 'integer',
    completed_steps: 'integer[]',
    skipped_steps: 'integer[]',
    step_data: 'jsonb',
    started_at: 'timestamp',
    last_updated: 'timestamp',
  },
  
  company_employee_invites: {
    id: 'uuid',
    company_id: 'uuid',
    email: 'varchar',
    role: 'varchar',
    token: 'varchar',
    expires_at: 'timestamp',
  },
};
```

### 3.3 External Service Integration

```typescript
// External services used by modules
const EXTERNAL_SERVICES = {
  // Image processing
  imageUpload: {
    service: 'Supabase Storage',
    bucket: 'profiles',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Email service
  emailService: {
    provider: 'SendGrid',
    templates: {
      WELCOME: 'tmpl_welcome_new_member',
      COMPANY_INVITE: 'tmpl_company_employee_invite',
      ONBOARDING_REMINDER: 'tmpl_complete_profile',
    },
  },
  
  // Analytics
  analytics: {
    provider: 'Mixpanel',
    events: {
      ONBOARDING_STARTED: 'onboarding_started',
      STEP_COMPLETED: 'onboarding_step_completed',
      ONBOARDING_COMPLETED: 'onboarding_completed',
      STEP_SKIPPED: 'onboarding_step_skipped',
    },
  },
};
```

## 4. Module Communication

### 4.1 Event System

```typescript
// Event bus for module communication
interface OnboardingEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

const OnboardingEventBus = {
  // Event types
  STEP_COMPLETED: 'step_completed',
  VALIDATION_ERROR: 'validation_error',
  PROGRESS_UPDATED: 'progress_updated',
  COMPANY_JOINED: 'company_joined',
  PROFILE_PHOTO_UPLOADED: 'profile_photo_uploaded',
  
  // Methods
  emit: (event: OnboardingEvent) => void,
  on: (eventType: string, handler: (payload: any) => void) => void,
  off: (eventType: string, handler: Function) => void,
};
```

### 4.2 Shared Context

```typescript
// Shared context for cross-module data
const OnboardingContext = React.createContext<{
  userId: string;
  session: OnboardingSession;
  progress: ProgressData;
  updateProgress: (progress: Partial<ProgressData>) => void;
  saveStepData: (step: number, data: any) => void;
  navigateToStep: (step: number) => void;
}>({} as any);
```

## 5. Module Testing Strategy

Each module should have comprehensive tests:

### 5.1 Unit Tests
- Component rendering tests
- Hook behavior tests
- Service method tests
- Utility function tests

### 5.2 Integration Tests
- Step navigation flow
- Data persistence
- API communication
- State management

### 5.3 E2E Tests
- Complete onboarding flow
- Error recovery scenarios
- Skip/resume functionality
- Multi-device support

## 6. Performance Considerations

### 6.1 Code Splitting
```typescript
// Lazy load step components
const WelcomeStep = lazy(() => import('./steps/WelcomeStep'));
const ProfessionalInfoStep = lazy(() => import('./steps/ProfessionalInfoStep'));
// ... other steps
```

### 6.2 Data Caching
- Cache step data in memory
- Persist to localStorage for recovery
- Debounce auto-save operations

### 6.3 Asset Optimization
- Lazy load images
- Compress uploaded photos
- Minimize bundle size per step