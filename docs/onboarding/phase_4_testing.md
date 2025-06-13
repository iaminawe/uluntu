# User Onboarding System - Testing Strategy & TDD Anchors

## Overview

This document outlines the comprehensive testing strategy for the user onboarding system using Test-Driven Development (TDD) principles. Each test is designed to be written before the implementation, following the Red-Green-Refactor cycle.

## 1. Testing Architecture

### 1.1 Test Structure
```
src/features/onboarding/__tests__/
├── unit/
│   ├── components/
│   │   ├── OnboardingWizard.test.tsx
│   │   ├── steps/
│   │   │   ├── WelcomeStep.test.tsx
│   │   │   ├── ProfessionalInfoStep.test.tsx
│   │   │   ├── PrivacySettingsStep.test.tsx
│   │   │   ├── CompanyAssociationStep.test.tsx
│   │   │   └── CommunityEngagementStep.test.tsx
│   │   └── shared/
│   │       ├── ProgressIndicator.test.tsx
│   │       └── StepContainer.test.tsx
│   ├── hooks/
│   │   ├── useOnboarding.test.ts
│   │   ├── useOnboardingProgress.test.ts
│   │   └── useStepValidation.test.ts
│   ├── services/
│   │   ├── onboardingService.test.ts
│   │   ├── profileCompletionService.test.ts
│   │   └── companyAssociationService.test.ts
│   └── utils/
│       ├── validators.test.ts
│       ├── progressCalculator.test.ts
│       └── stepConfig.test.ts
├── integration/
│   ├── onboardingFlow.test.tsx
│   ├── stepNavigation.test.tsx
│   ├── dataPeristence.test.tsx
│   └── companyAssociation.test.tsx
└── e2e/
    ├── completeOnboarding.test.ts
    ├── resumeOnboarding.test.ts
    └── errorRecovery.test.ts
```

## 2. Unit Tests

### 2.1 Component Tests

#### 2.1.1 OnboardingWizard Component

```typescript
// OnboardingWizard.test.tsx
describe('OnboardingWizard', () => {
  describe('Initialization', () => {
    it('should load existing session for returning user', async () => {
      // Given: A user with an existing onboarding session
      const mockSession = {
        userId: 'user-123',
        currentStep: 3,
        completedSteps: [1, 2],
        skippedSteps: [],
      };
      mockGetSession.mockResolvedValue(mockSession);

      // When: The wizard is rendered
      const { getByTestId } = render(<OnboardingWizard userId="user-123" />);

      // Then: It should display the current step
      await waitFor(() => {
        expect(getByTestId('current-step')).toHaveTextContent('Step 3');
      });
    });

    it('should create new session for first-time user', async () => {
      // Given: A new user with no existing session
      mockGetSession.mockResolvedValue(null);

      // When: The wizard is rendered
      render(<OnboardingWizard userId="new-user" />);

      // Then: It should create a new session
      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith('new-user');
      });
    });

    it('should redirect if onboarding is already completed', async () => {
      // Given: A user who has completed onboarding
      const mockUser = { onboarding_completed_at: '2024-01-01' };
      mockGetUserProfile.mockResolvedValue(mockUser);

      // When: The wizard is rendered
      render(<OnboardingWizard userId="user-123" />);

      // Then: It should redirect to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Navigation', () => {
    it('should not allow skipping mandatory steps', async () => {
      // Given: User is on mandatory step 1
      const { getByTestId } = render(
        <OnboardingWizard userId="user-123" />
      );

      // When: User tries to skip
      const skipButton = getByTestId('skip-button');
      fireEvent.click(skipButton);

      // Then: Should show error and not progress
      expect(getByTestId('error-message')).toHaveTextContent(
        'This step is required'
      );
    });

    it('should save progress when navigating forward', async () => {
      // Given: User completes step 1
      const { getByTestId } = render(
        <OnboardingWizard userId="user-123" />
      );
      
      fillBasicInfoForm();

      // When: User clicks next
      fireEvent.click(getByTestId('next-button'));

      // Then: Should save step data
      await waitFor(() => {
        expect(mockSaveStepData).toHaveBeenCalledWith(
          'user-123',
          1,
          expect.objectContaining({
            name: 'John Doe',
            title: 'Developer',
            location: 'Vancouver',
          })
        );
      });
    });

    it('should allow backward navigation without saving', async () => {
      // Given: User is on step 3
      const { getByTestId } = render(
        <OnboardingWizard userId="user-123" initialStep={3} />
      );

      // When: User clicks back
      fireEvent.click(getByTestId('back-button'));

      // Then: Should go to step 2 without saving
      expect(getByTestId('current-step')).toHaveTextContent('Step 2');
      expect(mockSaveStepData).not.toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress correctly', async () => {
      // Given: User has completed 2 of 5 steps
      const { getByTestId } = render(
        <OnboardingWizard 
          userId="user-123" 
          completedSteps={[1, 2]}
        />
      );

      // Then: Progress should be 40%
      expect(getByTestId('progress-bar')).toHaveAttribute(
        'aria-valuenow',
        '40'
      );
    });

    it('should show completion available when mandatory steps done', async () => {
      // Given: User completed mandatory steps (1, 3)
      const { getByTestId } = render(
        <OnboardingWizard 
          userId="user-123" 
          completedSteps={[1, 3]}
        />
      );

      // Then: Complete button should be enabled
      expect(getByTestId('complete-button')).not.toBeDisabled();
    });
  });
});
```

#### 2.1.2 Step Component Tests

```typescript
// WelcomeStep.test.tsx
describe('WelcomeStep', () => {
  describe('Form Validation', () => {
    it('should require all mandatory fields', async () => {
      // Given: An empty form
      const onNext = jest.fn();
      const { getByTestId } = render(
        <WelcomeStep userData={{}} onNext={onNext} />
      );

      // When: User tries to submit without filling fields
      fireEvent.click(getByTestId('next-button'));

      // Then: Should show validation errors
      expect(getByTestId('name-error')).toHaveTextContent('Name is required');
      expect(getByTestId('title-error')).toHaveTextContent('Title is required');
      expect(getByTestId('location-error')).toHaveTextContent('Location is required');
      expect(onNext).not.toHaveBeenCalled();
    });

    it('should validate name length', async () => {
      // Given: A form with very short name
      const { getByLabelText, getByTestId } = render(
        <WelcomeStep userData={{}} onNext={jest.fn()} />
      );

      // When: User enters single character name
      fireEvent.change(getByLabelText('Name'), { 
        target: { value: 'A' } 
      });
      fireEvent.click(getByTestId('next-button'));

      // Then: Should show length error
      expect(getByTestId('name-error')).toHaveTextContent(
        'Name must be at least 2 characters'
      );
    });
  });

  describe('Photo Upload', () => {
    it('should accept valid image files', async () => {
      // Given: A valid image file
      const file = new File(['image'], 'photo.jpg', { 
        type: 'image/jpeg' 
      });
      const { getByLabelText } = render(
        <WelcomeStep userData={{}} onNext={jest.fn()} />
      );

      // When: User uploads the file
      const input = getByLabelText('Profile Photo');
      fireEvent.change(input, { target: { files: [file] } });

      // Then: Should show preview
      await waitFor(() => {
        expect(getByTestId('photo-preview')).toBeInTheDocument();
      });
    });

    it('should reject files over 5MB', async () => {
      // Given: A large file
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });
      const { getByLabelText, getByTestId } = render(
        <WelcomeStep userData={{}} onNext={jest.fn()} />
      );

      // When: User uploads the large file
      const input = getByLabelText('Profile Photo');
      fireEvent.change(input, { target: { files: [largeFile] } });

      // Then: Should show error
      expect(getByTestId('photo-error')).toHaveTextContent(
        'File size must be less than 5MB'
      );
    });

    it('should reject non-image files', async () => {
      // Given: A PDF file
      const pdfFile = new File(['pdf'], 'document.pdf', {
        type: 'application/pdf'
      });
      const { getByLabelText, getByTestId } = render(
        <WelcomeStep userData={{}} onNext={jest.fn()} />
      );

      // When: User uploads the PDF
      const input = getByLabelText('Profile Photo');
      fireEvent.change(input, { target: { files: [pdfFile] } });

      // Then: Should show error
      expect(getByTestId('photo-error')).toHaveTextContent(
        'Please upload an image file (JPEG, PNG, or WebP)'
      );
    });
  });
});

// ProfessionalInfoStep.test.tsx
describe('ProfessionalInfoStep', () => {
  describe('Skills Selection', () => {
    it('should allow adding multiple skills', async () => {
      // Given: Skills selector
      const { getByLabelText, getByText, getAllByTestId } = render(
        <ProfessionalInfoStep userData={{}} onNext={jest.fn()} />
      );

      // When: User selects multiple skills
      const skillsInput = getByLabelText('Skills');
      fireEvent.change(skillsInput, { target: { value: 'React' } });
      fireEvent.click(getByText('Add'));
      fireEvent.change(skillsInput, { target: { value: 'TypeScript' } });
      fireEvent.click(getByText('Add'));

      // Then: Should display selected skills
      const skillTags = getAllByTestId('skill-tag');
      expect(skillTags).toHaveLength(2);
      expect(skillTags[0]).toHaveTextContent('React');
      expect(skillTags[1]).toHaveTextContent('TypeScript');
    });

    it('should limit skills to 20', async () => {
      // Given: User has added 20 skills
      const existingSkills = Array.from({ length: 20 }, (_, i) => `Skill ${i}`);
      const { getByLabelText, getByText } = render(
        <ProfessionalInfoStep 
          userData={{ skills: existingSkills }} 
          onNext={jest.fn()} 
        />
      );

      // When: User tries to add 21st skill
      const skillsInput = getByLabelText('Skills');
      fireEvent.change(skillsInput, { target: { value: 'Extra Skill' } });
      fireEvent.click(getByText('Add'));

      // Then: Should show error
      expect(getByTestId('skills-error')).toHaveTextContent(
        'Maximum 20 skills allowed'
      );
    });
  });

  describe('Bio Editor', () => {
    it('should sanitize HTML input', async () => {
      // Given: Bio editor with malicious HTML
      const onNext = jest.fn();
      const { getByLabelText, getByTestId } = render(
        <ProfessionalInfoStep userData={{}} onNext={onNext} />
      );

      // When: User enters HTML with script tag
      const bioEditor = getByLabelText('Bio');
      fireEvent.change(bioEditor, {
        target: { value: 'Hello <script>alert("xss")</script> World' }
      });
      fireEvent.click(getByTestId('next-button'));

      // Then: Should sanitize the input
      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({
          bio: 'Hello  World'
        })
      );
    });
  });
});
```

### 2.2 Hook Tests

```typescript
// useOnboarding.test.ts
describe('useOnboarding', () => {
  it('should initialize onboarding for new user', async () => {
    // Given: A new user
    const { result } = renderHook(() => useOnboarding());

    // When: Initializing onboarding
    act(() => {
      result.current.initializeOnboarding('user-123');
    });

    // Then: Should create session and set initial state
    await waitFor(() => {
      expect(result.current.currentStep).toBe(1);
      expect(result.current.progress.percentage).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle step navigation', async () => {
    // Given: User on step 1
    const { result } = renderHook(() => useOnboarding());
    
    // When: Navigating to step 2
    act(() => {
      result.current.navigateToStep(2);
    });

    // Then: Should update current step
    expect(result.current.currentStep).toBe(2);
  });

  it('should validate before allowing completion', async () => {
    // Given: User has not completed mandatory steps
    const { result } = renderHook(() => useOnboarding());

    // Then: Should not allow completion
    expect(result.current.canComplete).toBe(false);
  });
});

// useStepValidation.test.ts
describe('useStepValidation', () => {
  it('should validate step 1 data', async () => {
    // Given: Step 1 validation hook
    const { result } = renderHook(() => useStepValidation(1));

    // When: Validating incomplete data
    const isValid = await result.current.validate({
      name: '',
      title: 'Developer',
      location: 'Vancouver'
    });

    // Then: Should return false with errors
    expect(isValid).toBe(false);
    expect(result.current.errors).toContainEqual(
      expect.objectContaining({
        field: 'name',
        message: 'Name is required'
      })
    );
  });

  it('should clear errors', async () => {
    // Given: Hook with errors
    const { result } = renderHook(() => useStepValidation(1));
    await result.current.validate({ name: '' });

    // When: Clearing errors
    act(() => {
      result.current.clearErrors();
    });

    // Then: Should have no errors
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });
});
```

### 2.3 Service Tests

```typescript
// onboardingService.test.ts
describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    service = new OnboardingService();
  });

  describe('Session Management', () => {
    it('should create new session', async () => {
      // Given: A user ID
      const userId = 'user-123';

      // When: Creating session
      const session = await service.createSession(userId);

      // Then: Should return valid session
      expect(session).toMatchObject({
        userId,
        currentStep: 1,
        completedSteps: [],
        skippedSteps: [],
        startedAt: expect.any(Date)
      });
    });

    it('should handle session retrieval failure', async () => {
      // Given: API error
      mockApi.get.mockRejectedValue(new Error('Network error'));

      // When: Getting session
      const session = await service.getSession('user-123');

      // Then: Should return null
      expect(session).toBeNull();
    });
  });

  describe('Data Persistence', () => {
    it('should save step data with retry logic', async () => {
      // Given: API fails once then succeeds
      mockApi.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      // When: Saving step data
      await service.saveStepData('user-123', 1, { name: 'John' });

      // Then: Should retry and succeed
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });

    it('should validate data before saving', async () => {
      // Given: Invalid data for step 1
      const invalidData = { name: '' };

      // When/Then: Should throw validation error
      await expect(
        service.saveStepData('user-123', 1, invalidData)
      ).rejects.toThrow('Validation failed');
    });
  });
});

// profileCompletionService.test.ts
describe('ProfileCompletionService', () => {
  let service: ProfileCompletionService;

  beforeEach(() => {
    service = new ProfileCompletionService();
  });

  it('should calculate completion percentage correctly', async () => {
    // Given: User with partial profile
    mockGetUserProfile.mockResolvedValue({
      name: 'John Doe',
      title: 'Developer',
      location: 'Vancouver',
      bio: null,
      skills: [],
      employment_status: null,
      image: null
    });

    // When: Calculating completion
    const completion = await service.calculateCompletion('user-123');

    // Then: Should return correct percentage
    expect(completion.percentage).toBe(43); // 3 of 7 fields
    expect(completion.missingFields).toContain('bio');
    expect(completion.missingFields).toContain('skills');
  });

  it('should identify completion milestones', async () => {
    // Given: User at 75% completion
    mockGetUserProfile.mockResolvedValue({
      /* ... 75% complete profile ... */
    });

    // When: Getting milestones
    const milestones = await service.getMilestones('user-123');

    // Then: Should show appropriate milestones
    expect(milestones).toContainEqual(
      expect.objectContaining({
        name: 'Profile Starter',
        achieved: true,
        threshold: 50
      })
    );
    expect(milestones).toContainEqual(
      expect.objectContaining({
        name: 'Almost There',
        achieved: true,
        threshold: 75
      })
    );
  });
});
```

## 3. Integration Tests

### 3.1 Flow Integration Tests

```typescript
// onboardingFlow.test.tsx
describe('Onboarding Flow Integration', () => {
  it('should complete full onboarding flow', async () => {
    // Given: A new user starting onboarding
    const { getByTestId, getByLabelText, getByText } = render(
      <App initialRoute="/onboarding" userId="new-user" />
    );

    // Step 1: Welcome & Basic Info
    fireEvent.change(getByLabelText('Name'), { 
      target: { value: 'Jane Smith' } 
    });
    fireEvent.change(getByLabelText('Title'), { 
      target: { value: 'Senior Developer' } 
    });
    fireEvent.change(getByLabelText('Location'), { 
      target: { value: 'Toronto' } 
    });
    fireEvent.click(getByTestId('next-button'));

    // Step 2: Professional Info (Skip)
    await waitFor(() => {
      expect(getByText('Professional Information')).toBeInTheDocument();
    });
    fireEvent.click(getByTestId('skip-button'));

    // Step 3: Privacy Settings
    await waitFor(() => {
      expect(getByText('Privacy Settings')).toBeInTheDocument();
    });
    fireEvent.click(getByLabelText('Members Only'));
    fireEvent.click(getByTestId('next-button'));

    // Step 4: Company Association (Skip)
    await waitFor(() => {
      expect(getByText('Company Association')).toBeInTheDocument();
    });
    fireEvent.click(getByTestId('skip-button'));

    // Step 5: Community Engagement (Skip)
    await waitFor(() => {
      expect(getByText('Community Engagement')).toBeInTheDocument();
    });
    fireEvent.click(getByTestId('skip-button'));

    // Complete onboarding
    fireEvent.click(getByTestId('complete-button'));

    // Then: Should redirect to dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard/welcome');
    });
  });

  it('should handle resume after interruption', async () => {
    // Given: User who left at step 3
    mockGetSession.mockResolvedValue({
      userId: 'user-123',
      currentStep: 3,
      completedSteps: [1, 2],
      skippedSteps: [],
      stepData: {
        1: { name: 'John', title: 'Dev', location: 'NYC' },
        2: { bio: 'Experienced developer', skills: ['React', 'Node'] }
      }
    });

    // When: User returns to onboarding
    const { getByText, getByTestId } = render(
      <OnboardingWizard userId="user-123" />
    );

    // Then: Should resume at step 3
    await waitFor(() => {
      expect(getByText('Privacy Settings')).toBeInTheDocument();
      expect(getByTestId('progress-bar')).toHaveAttribute('aria-valuenow', '40');
    });
  });
});
```

### 3.2 Company Association Integration

```typescript
// companyAssociation.test.tsx
describe('Company Association Integration', () => {
  it('should handle joining existing company', async () => {
    // Given: User searching for company
    const { getByLabelText, getByText, getByTestId } = render(
      <CompanyAssociationStep onNext={jest.fn()} />
    );

    // When: Searching and selecting company
    fireEvent.change(getByLabelText('Search Companies'), {
      target: { value: 'Tech Corp' }
    });

    await waitFor(() => {
      expect(getByText('Tech Corp Inc.')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Tech Corp Inc.'));
    fireEvent.change(getByLabelText('Your Role'), {
      target: { value: 'Software Engineer' }
    });
    fireEvent.click(getByTestId('join-company-button'));

    // Then: Should send verification request
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/companies/123/employees',
        expect.objectContaining({
          role: 'Software Engineer',
          userId: 'user-123'
        })
      );
    });
  });

  it('should handle company creation flow', async () => {
    // Given: User creating new company
    const { getByLabelText, getByTestId } = render(
      <CompanyAssociationStep onNext={jest.fn()} />
    );

    // When: Filling company creation form
    fireEvent.click(getByTestId('create-company-tab'));
    
    fireEvent.change(getByLabelText('Company Name'), {
      target: { value: 'NewTech Solutions' }
    });
    fireEvent.change(getByLabelText('Company Email'), {
      target: { value: 'info@newtech.com' }
    });
    fireEvent.change(getByLabelText('Industry'), {
      target: { value: 'Software Development' }
    });
    
    // Upload logo
    const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });
    fireEvent.change(getByLabelText('Company Logo'), {
      target: { files: [logoFile] }
    });

    fireEvent.click(getByTestId('create-company-button'));

    // Then: Should create company and associate user
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/companies',
        expect.objectContaining({
          name: 'NewTech Solutions',
          email: 'info@newtech.com',
          industry: 'Software Development'
        })
      );
    });
  });
});
```

## 4. End-to-End Tests

### 4.1 Complete Flow E2E

```typescript
// completeOnboarding.test.ts
describe('Complete Onboarding E2E', () => {
  beforeEach(() => {
    cy.task('db:seed');
    cy.task('auth:createUser', { id: 'test-user' });
  });

  it('should complete full onboarding with all features', () => {
    // Given: New user logs in
    cy.login('test-user');
    cy.visit('/onboarding');

    // Step 1: Welcome
    cy.findByLabelText('Name').type('Alice Johnson');
    cy.findByLabelText('Title').type('Full Stack Developer');
    cy.findByLabelText('Location').type('Seattle, WA');
    
    // Upload photo
    cy.findByLabelText('Profile Photo').attachFile('profile.jpg');
    cy.findByTestId('photo-preview').should('be.visible');
    
    cy.findByTestId('next-button').click();

    // Step 2: Professional Info
    cy.findByLabelText('Bio').type('Experienced developer with 5 years...');
    
    // Add skills
    ['React', 'Node.js', 'PostgreSQL', 'Docker'].forEach(skill => {
      cy.findByLabelText('Skills').type(skill);
      cy.findByText('Add').click();
    });
    
    cy.findByLabelText('Employment Status').select('Employed');
    cy.findByLabelText('Years of Experience').type('5');
    cy.findByLabelText('Open to Volunteering').check();
    
    cy.findByTestId('next-button').click();

    // Step 3: Privacy Settings
    cy.findByLabelText('Profile Visibility').select('Members Only');
    cy.findByLabelText('Show Email').uncheck();
    cy.findByLabelText('Allow Messages').check();
    cy.findByLabelText('Newsletter').check();
    
    cy.findByTestId('next-button').click();

    // Step 4: Company Association
    cy.findByLabelText('Search Companies').type('Existing Corp');
    cy.findByText('Existing Corp Ltd.').click();
    cy.findByLabelText('Your Role').type('Senior Developer');
    cy.findByLabelText('Department').type('Engineering');
    cy.findByTestId('join-company-button').click();
    
    // Wait for verification
    cy.findByText('Verification email sent').should('be.visible');
    cy.findByTestId('next-button').click();

    // Step 5: Community Engagement
    cy.findByText('React').click();
    cy.findByText('Node.js').click();
    cy.findByText('Cloud Computing').click();
    
    cy.findByLabelText('Available as Mentor').check();
    cy.findByLabelText('Open to Networking').check();
    
    // Join suggested groups
    cy.findByText('React Developers Group').click();
    cy.findByText('Join').click();
    
    cy.findByTestId('complete-button').click();

    // Verify completion
    cy.url().should('include', '/dashboard/welcome');
    cy.findByText('Welcome to the Community!').should('be.visible');
    cy.findByTestId('profile-completion').should('contain', '85%');
  });

  it('should handle errors gracefully', () => {
    cy.login('test-user');
    cy.visit('/onboarding');

    // Simulate network error
    cy.intercept('POST', '/api/onboarding/step/*', { 
      statusCode: 500 
    }).as('saveError');

    cy.findByLabelText('Name').type('Test User');
    cy.findByLabelText('Title').type('Developer');
    cy.findByLabelText('Location').type('City');
    cy.findByTestId('next-button').click();

    cy.wait('@saveError');
    
    // Should show error but allow retry
    cy.findByText('Failed to save. Please try again.').should('be.visible');
    cy.findByTestId('retry-button').should('be.visible');
  });
});
```

### 4.2 Resume Flow E2E

```typescript
// resumeOnboarding.test.ts
describe('Resume Onboarding E2E', () => {
  it('should resume from last saved position', () => {
    // Given: User who abandoned at step 3
    cy.task('db:seed');
    cy.task('onboarding:createSession', {
      userId: 'test-user',
      currentStep: 3,
      completedSteps: [1, 2]
    });

    // When: User returns
    cy.login('test-user');
    cy.visit('/onboarding');

    // Then: Should be on step 3
    cy.findByText('Privacy Settings').should('be.visible');
    cy.findByTestId('progress-bar').should('have.attr', 'aria-valuenow', '40');
    
    // And can continue
    cy.findByLabelText('Profile Visibility').select('Public');
    cy.findByTestId('next-button').click();
    
    cy.findByText('Company Association').should('be.visible');
  });

  it('should handle browser refresh', () => {
    cy.login('test-user');
    cy.visit('/onboarding');

    // Fill step 1
    cy.findByLabelText('Name').type('Test User');
    cy.findByLabelText('Title').type('Developer');
    cy.findByLabelText('Location').type('City');

    // Refresh browser
    cy.reload();

    // Data should be preserved
    cy.findByLabelText('Name').should('have.value', 'Test User');
    cy.findByLabelText('Title').should('have.value', 'Developer');
    cy.findByLabelText('Location').should('have.value', 'City');
  });
});
```

## 5. Performance Tests

```typescript
// performance.test.ts
describe('Onboarding Performance', () => {
  it('should load wizard within 2 seconds', async () => {
    const startTime = performance.now();
    
    render(<OnboardingWizard userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument();
    });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('should handle large skill lists efficiently', async () => {
    // Generate 100 skills
    const manySkills = Array.from({ length: 100 }, (_, i) => `Skill ${i}`);
    
    const startTime = performance.now();
    
    render(
      <ProfessionalInfoStep 
        userData={{ skills: manySkills }} 
        onNext={jest.fn()} 
      />
    );
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(500);
  });
});
```

## 6. Accessibility Tests

```typescript
// accessibility.test.tsx
describe('Onboarding Accessibility', () => {
  it('should be keyboard navigable', async () => {
    const { getByTestId } = render(<OnboardingWizard userId="test-user" />);
    
    // Tab through form fields
    userEvent.tab();
    expect(document.activeElement).toBe(getByLabelText('Name'));
    
    userEvent.tab();
    expect(document.activeElement).toBe(getByLabelText('Title'));
    
    userEvent.tab();
    expect(document.activeElement).toBe(getByLabelText('Location'));
  });

  it('should announce progress to screen readers', async () => {
    const { getByRole } = render(
      <OnboardingWizard userId="test-user" completedSteps={[1, 2]} />
    );
    
    expect(getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Onboarding progress: 40% complete'
    );
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<OnboardingWizard userId="test-user" />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 7. Test Data Builders

```typescript
// testBuilders.ts
export class OnboardingTestBuilder {
  static buildSession(overrides = {}) {
    return {
      userId: 'test-user',
      currentStep: 1,
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date(),
      ...overrides
    };
  }

  static buildUserData(overrides = {}) {
    return {
      name: 'Test User',
      title: 'Developer',
      location: 'Test City',
      bio: 'Test bio',
      skills: ['JavaScript', 'React'],
      employmentStatus: 'employed',
      ...overrides
    };
  }

  static buildCompany(overrides = {}) {
    return {
      id: 'company-123',
      name: 'Test Company',
      email: 'info@test.com',
      industry: 'Technology',
      size: '50-100',
      ...overrides
    };
  }
}
```

## 8. Test Coverage Goals

### 8.1 Unit Test Coverage
- Components: 90%+
- Hooks: 95%+
- Services: 95%+
- Utils: 100%

### 8.2 Integration Test Coverage
- User flows: 85%+
- API interactions: 90%+
- State management: 90%+

### 8.3 E2E Test Coverage
- Critical paths: 100%
- Error scenarios: 80%+
- Edge cases: 70%+

## 9. Continuous Testing

### 9.1 Pre-commit Tests
```bash
# Run before each commit
npm run test:unit
npm run test:lint
npm run test:types
```

### 9.2 CI Pipeline Tests
```bash
# Run in CI/CD
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

### 9.3 Monitoring Tests
- Performance regression tests
- Visual regression tests
- API contract tests
- Load tests for onboarding endpoints