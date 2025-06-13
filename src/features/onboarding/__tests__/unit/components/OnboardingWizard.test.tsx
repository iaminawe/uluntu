import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { OnboardingWizard } from '../../../components/OnboardingWizard';
import { onboardingService } from '../../../services/onboardingService';
import { getUserProfile } from '@/features/directory/api/membersApi';

// Mock dependencies
jest.mock('../../../services/onboardingService');
jest.mock('../../../../../api/membersApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockOnboardingService = onboardingService as jest.Mocked<typeof onboardingService>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

describe('OnboardingWizard', () => {
  let store: any;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        onboarding: (state = {
          currentStep: 1,
          completedSteps: [],
          skippedSteps: [],
          stepData: {},
          isLoading: false,
          errors: {},
        }) => state,
      },
    });
    
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      userId: 'test-user-123',
      onComplete: jest.fn(),
      onExit: jest.fn(),
    };
    
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <OnboardingWizard {...defaultProps} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Initialization', () => {
    it('should load existing session for returning user', async () => {
      // Given: A user with an existing onboarding session
      const mockSession = {
        userId: 'test-user-123',
        currentStep: 3,
        completedSteps: [1, 2],
        skippedSteps: [],
        stepData: {
          1: { name: 'John Doe', title: 'Developer', location: 'Vancouver' },
          2: { bio: 'Experienced developer', skills: ['React', 'Node.js'] },
        },
        startedAt: new Date().toISOString(),
      };
      
      mockOnboardingService.getSession.mockResolvedValue(mockSession);
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });

      // When: The wizard is rendered
      renderComponent();

      // Then: It should display the current step
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 3');
        expect(screen.getByTestId('step-title')).toHaveTextContent('Privacy Settings');
      });
    });

    it('should create new session for first-time user', async () => {
      // Given: A new user with no existing session
      mockOnboardingService.getSession.mockResolvedValue(null);
      mockGetUserProfile.mockResolvedValue({ 
        id: 'new-user',
        onboarding_completed_at: null 
      });
      
      const newSession = {
        userId: 'new-user',
        currentStep: 1,
        completedSteps: [],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      };
      mockOnboardingService.createSession.mockResolvedValue(newSession);

      // When: The wizard is rendered
      renderComponent({ userId: 'new-user' });

      // Then: It should create a new session
      await waitFor(() => {
        expect(mockOnboardingService.createSession).toHaveBeenCalledWith('new-user');
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1');
        expect(screen.getByTestId('step-title')).toHaveTextContent('Welcome & Basic Info');
      });
    });

    it('should redirect if onboarding is already completed', async () => {
      // Given: A user who has completed onboarding
      const mockUser = { 
        id: 'test-user-123',
        onboarding_completed_at: '2024-01-01T00:00:00Z' 
      };
      mockGetUserProfile.mockResolvedValue(mockUser);
      
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      // When: The wizard is rendered
      renderComponent();

      // Then: It should redirect to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 1,
        completedSteps: [],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
    });

    it('should not allow skipping mandatory steps', async () => {
      // Given: User is on mandatory step 1
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1');
      });

      // When: User tries to skip
      const skipButton = screen.queryByTestId('skip-button');
      
      // Then: Skip button should not be available
      expect(skipButton).not.toBeInTheDocument();
    });

    it('should save progress when navigating forward', async () => {
      // Given: User completes step 1
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1');
      });
      
      // Fill in the form
      fireEvent.change(screen.getByLabelText('Name'), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText('Title'), { 
        target: { value: 'Developer' } 
      });
      fireEvent.change(screen.getByLabelText('Location'), { 
        target: { value: 'Vancouver' } 
      });

      // When: User clicks next
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should save step data
      await waitFor(() => {
        expect(mockOnboardingService.saveStepData).toHaveBeenCalledWith(
          'test-user-123',
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
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 3,
        completedSteps: [1, 2],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 3');
      });

      // When: User clicks back
      fireEvent.click(screen.getByTestId('back-button'));

      // Then: Should go to step 2 without saving
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 2');
        expect(mockOnboardingService.saveStepData).not.toHaveBeenCalled();
      });
    });

    it('should show validation errors for incomplete mandatory fields', async () => {
      // Given: User is on step 1
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1');
      });

      // When: User tries to submit without filling required fields
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should show validation errors
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
        expect(screen.getByTestId('title-error')).toHaveTextContent('Title is required');
        expect(screen.getByTestId('location-error')).toHaveTextContent('Location is required');
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress correctly', async () => {
      // Given: User has completed 2 of 5 steps
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 3,
        completedSteps: [1, 2],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();

      // Then: Progress should be 40%
      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toHaveAttribute(
          'aria-valuenow',
          '40'
        );
        expect(screen.getByTestId('progress-percentage')).toHaveTextContent('40%');
      });
    });

    it('should show completion available when mandatory steps done', async () => {
      // Given: User completed mandatory steps (1, 3)
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 5,
        completedSteps: [1, 3],
        skippedSteps: [2, 4],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();

      // Then: Complete button should be enabled
      await waitFor(() => {
        const completeButton = screen.getByTestId('complete-button');
        expect(completeButton).toBeInTheDocument();
        expect(completeButton).not.toBeDisabled();
      });
    });

    it('should display step indicators correctly', async () => {
      // Given: User at step 2 with step 1 completed
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 2,
        completedSteps: [1],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();

      await waitFor(() => {
        // Step 1 should be marked as completed
        expect(screen.getByTestId('step-indicator-1')).toHaveClass('completed');
        // Step 2 should be marked as current
        expect(screen.getByTestId('step-indicator-2')).toHaveClass('current');
        // Step 3-5 should be marked as upcoming
        expect(screen.getByTestId('step-indicator-3')).toHaveClass('upcoming');
        expect(screen.getByTestId('step-indicator-4')).toHaveClass('upcoming');
        expect(screen.getByTestId('step-indicator-5')).toHaveClass('upcoming');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle session loading errors gracefully', async () => {
      // Given: API error when loading session
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockRejectedValue(
        new Error('Network error')
      );

      // When: Component renders
      renderComponent();

      // Then: Should show error message and retry option
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Failed to load your progress. Please try again.'
        );
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    it('should auto-save progress periodically', async () => {
      jest.useFakeTimers();
      
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 1,
        completedSteps: [],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('Step 1');
      });

      // Fill in some data
      fireEvent.change(screen.getByLabelText('Name'), { 
        target: { value: 'John' } 
      });

      // Fast forward 30 seconds
      jest.advanceTimersByTime(30000);

      // Should auto-save
      await waitFor(() => {
        expect(mockOnboardingService.autoSaveProgress).toHaveBeenCalledWith(
          'test-user-123',
          1,
          expect.objectContaining({ name: 'John' })
        );
      });

      jest.useRealTimers();
    });
  });

  describe('Completion', () => {
    it('should complete onboarding successfully', async () => {
      // Given: User has completed all mandatory steps
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 5,
        completedSteps: [1, 3],
        skippedSteps: [2, 4],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      mockOnboardingService.completeOnboarding.mockResolvedValue({
        success: true,
        profileCompletion: 60,
        redirectTo: '/dashboard/welcome',
      });
      
      const onComplete = jest.fn();
      renderComponent({ onComplete });

      await waitFor(() => {
        expect(screen.getByTestId('complete-button')).toBeInTheDocument();
      });

      // When: User clicks complete
      fireEvent.click(screen.getByTestId('complete-button'));

      // Then: Should complete onboarding
      await waitFor(() => {
        expect(mockOnboardingService.completeOnboarding).toHaveBeenCalledWith(
          'test-user-123'
        );
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should not allow completion without mandatory steps', async () => {
      // Given: User has not completed mandatory step 3
      mockGetUserProfile.mockResolvedValue({ 
        id: 'test-user-123',
        onboarding_completed_at: null 
      });
      
      mockOnboardingService.getSession.mockResolvedValue({
        userId: 'test-user-123',
        currentStep: 5,
        completedSteps: [1, 2, 4],
        skippedSteps: [],
        stepData: {},
        startedAt: new Date().toISOString(),
      });
      
      renderComponent();

      // Then: Complete button should not be shown
      await waitFor(() => {
        expect(screen.queryByTestId('complete-button')).not.toBeInTheDocument();
        expect(screen.getByTestId('mandatory-steps-message')).toHaveTextContent(
          'Please complete all required steps before finishing'
        );
      });
    });
  });
});