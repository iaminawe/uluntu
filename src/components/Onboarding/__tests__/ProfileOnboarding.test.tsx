import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProfileOnboarding } from '../ProfileOnboarding';
import { useProfileCompletion, getFieldDisplayName } from '../../../hooks/useProfileCompletion';

// Mock all the hook dependencies
jest.mock('../../../hooks/useCurrentMember', () => ({
  useCurrentMember: jest.fn(),
}));

jest.mock('../../../hooks/useProfilePrivacy', () => ({
  useProfilePrivacy: jest.fn(),
  getPrivacyStatusDisplay: jest.fn(),
}));

jest.mock('../../../hooks/useProfileCompletion', () => ({
  useProfileCompletion: jest.fn(),
  getFieldDisplayName: jest.fn(),
  shouldShowOnboarding: jest.fn(),
}));

// Import the mocked functions
const { useCurrentMember } = require('../../../hooks/useCurrentMember');
const { useProfilePrivacy, getPrivacyStatusDisplay } = require('../../../hooks/useProfilePrivacy');
const { useProfileCompletion: mockUseProfileCompletion } = require('../../../hooks/useProfileCompletion');

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProfileOnboarding', () => {
  const mockMember = {
    id: '1',
    name: 'Test User',
    title: '',
    image: '/placeholder-avatar.png',
    bio: '',
    intro: '',
    skills: [],
    joinDate: '2025-01-01',
    status: 'draft' as const,
  };

  const mockPrivacySettings = {
    currentSettings: {
      isPublic: false,
      status: 'draft' as const,
      showInDirectory: false,
    },
    isUpdating: false,
    error: null,
    togglePublicVisibility: jest.fn(),
    setProfilePrivate: jest.fn(),
    setProfilePublic: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    useCurrentMember.mockReturnValue({
      data: mockMember,
      isLoading: false,
      error: null,
    });
    
    useProfilePrivacy.mockReturnValue(mockPrivacySettings);
    
    getPrivacyStatusDisplay.mockReturnValue({
      label: 'Private',
      description: 'Your profile is hidden from the public directory.',
      color: 'yellow',
      icon: '🔒',
    });
    
    mockUseProfileCompletion.mockReturnValue({
      isComplete: false,
      completionPercentage: 25,
      missingFields: ['bio', 'image', 'title'],
      requiredFields: ['bio', 'image'],
      suggestedFields: ['title'],
    });
    
    // Mock getFieldDisplayName
    require('../../../hooks/useProfileCompletion').getFieldDisplayName.mockImplementation((field: string) => {
      const names: Record<string, string> = {
        name: 'Full Name',
        bio: 'Bio/About',
        image: 'Profile Photo',
        title: 'Job Title',
      };
      return names[field] || field;
    });
  });

  describe('Welcome Step', () => {
    it('renders welcome message and profile completion status', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome to Nelson Tech!')).toBeInTheDocument();
      expect(screen.getByText('Profile Completion')).toBeInTheDocument();
      expect(screen.getByText('Required Information:')).toBeInTheDocument();
    });

    it('shows missing required fields', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Bio/About')).toBeInTheDocument();
      expect(screen.getByText('Profile Photo')).toBeInTheDocument();
    });

    it('shows Complete Profile button', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const completeButton = screen.getByRole('link', { name: /complete profile/i });
      expect(completeButton).toBeInTheDocument();
      expect(completeButton).toHaveAttribute('href', '/profile/edit');
    });

    it('shows privacy preferences button', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const privacyButton = screen.getByRole('button', { name: /set privacy preferences/i });
      expect(privacyButton).toBeInTheDocument();
    });

    it('shows skip option when enabled', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding showSkipOption={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    it('hides skip option when disabled', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding showSkipOption={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /skip for now/i })).not.toBeInTheDocument();
    });
  });

  describe('Privacy Step', () => {
    it('renders privacy options when navigating to privacy step', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const privacyButton = screen.getByRole('button', { name: /set privacy preferences/i });
      fireEvent.click(privacyButton);

      expect(screen.getByText('Choose Your Privacy')).toBeInTheDocument();
      expect(screen.getByText('Public Profile')).toBeInTheDocument();
      expect(screen.getByText('Private Profile')).toBeInTheDocument();
    });

    it('shows current privacy status', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const privacyButton = screen.getByRole('button', { name: /set privacy preferences/i });
      fireEvent.click(privacyButton);

      const privateRadio = screen.getByRole('radio', { name: /private profile/i });
      expect(privateRadio).toBeChecked();
    });

    it('allows toggling privacy settings', async () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const privacyButton = screen.getByRole('button', { name: /set privacy preferences/i });
      fireEvent.click(privacyButton);

      const publicRadio = screen.getByRole('radio', { name: /public profile/i });
      fireEvent.click(publicRadio);

      await waitFor(() => {
        expect(mockPrivacySettings.togglePublicVisibility).toHaveBeenCalled();
      });
    });

    it('shows back button in privacy step', () => {
      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      const privacyButton = screen.getByRole('button', { name: /set privacy preferences/i });
      fireEvent.click(privacyButton);

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  describe('Complete Step', () => {
    it('shows completion step for complete profiles', () => {
      const completeMember = {
        ...mockMember,
        bio: 'Test bio',
        image: 'test-image.jpg',
        title: 'Developer',
      };

      mockUseCurrentMember.mockReturnValue({
        data: completeMember,
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome to the Community!')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /edit profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to community/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when data is loading', () => {
      mockUseCurrentMember.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <ProfileOnboarding />
        </TestWrapper>
      );

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onComplete when complete button is clicked', () => {
      const onComplete = jest.fn();
      const completeMember = {
        ...mockMember,
        bio: 'Test bio',
        image: 'test-image.jpg',
        title: 'Developer',
      };

      mockUseCurrentMember.mockReturnValue({
        data: completeMember,
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <ProfileOnboarding onComplete={onComplete} />
        </TestWrapper>
      );

      const continueButton = screen.getByRole('button', { name: /continue to community/i });
      fireEvent.click(continueButton);

      expect(onComplete).toHaveBeenCalled();
    });

    it('calls onSkip when skip button is clicked', () => {
      const onSkip = jest.fn();

      render(
        <TestWrapper>
          <ProfileOnboarding onSkip={onSkip} showSkipOption={true} />
        </TestWrapper>
      );

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      fireEvent.click(skipButton);

      expect(onSkip).toHaveBeenCalled();
    });
  });
});