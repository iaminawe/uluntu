/**
 * Test for Contact Settings Migration
 * 
 * This test verifies that the hardcoded values migration works properly
 * and that components gracefully handle missing settings with fallbacks.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContactPage from '@/pages/ContactPage';
import PrivacyPage from '@/pages/PrivacyPage';
import AboutSection from '@/components/AboutSection';

// Mock the settings hook to test fallback behavior
jest.mock('@/hooks/useSettings', () => ({
  useSetting: jest.fn().mockImplementation((category: string, key: string, fallback: any) => {
    // Simulate missing settings by returning the fallback
    return {
      value: fallback,
      loading: false,
      error: null,
      exists: false
    };
  })
}));

// Mock the contact submissions hook
jest.mock('@/hooks/useContactSubmissions', () => ({
  useContactSubmissions: jest.fn().mockReturnValue({
    createSubmission: jest.fn().mockResolvedValue({ success: true })
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Contact Settings Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ContactPage', () => {
    it('should render with fallback contact information when settings are missing', () => {
      render(
        <TestWrapper>
          <ContactPage />
        </TestWrapper>
      );

      // Check for fallback email
      expect(screen.getByText('hello@nelsontech.community')).toBeInTheDocument();
      
      // Check for fallback phone
      expect(screen.getByText('+1 (250) 555-0123')).toBeInTheDocument();
      
      // Check for fallback location
      expect(screen.getByText('Nelson, British Columbia')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      
      // Check for fallback response times
      expect(screen.getByText('24-48 hours')).toBeInTheDocument();
      expect(screen.getByText('3-5 business days')).toBeInTheDocument();
      expect(screen.getByText('12-24 hours')).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(
        <TestWrapper>
          <ContactPage />
        </TestWrapper>
      );

      // Check form elements exist
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });
  });

  describe('PrivacyPage', () => {
    it('should render with fallback privacy contact information', () => {
      render(
        <TestWrapper>
          <PrivacyPage />
        </TestWrapper>
      );

      // Check for fallback privacy email
      expect(screen.getByText('privacy@nelsontech.community')).toBeInTheDocument();
      
      // Check for fallback privacy address
      expect(screen.getByText('Nelson Tech Community, Privacy Officer, Nelson, BC, Canada')).toBeInTheDocument();
      
      // Check for organization name in privacy text
      expect(screen.getAllByText(/Nelson Tech Community/)).toHaveLength(3); // Should appear multiple times
    });

    it('should have proper privacy policy structure', () => {
      render(
        <TestWrapper>
          <PrivacyPage />
        </TestWrapper>
      );

      // Check main sections exist
      expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    });
  });

  describe('AboutSection', () => {
    it('should render with fallback location information', () => {
      render(
        <TestWrapper>
          <AboutSection />
        </TestWrapper>
      );

      // Check for fallback location name
      expect(screen.getByText('Nelson Innovation Centre')).toBeInTheDocument();
      
      // Check for fallback address components
      expect(screen.getByText('Box 752 - 560 Baker Street')).toBeInTheDocument();
      expect(screen.getByText('Nelson, BC V1L 4E5')).toBeInTheDocument();
      
      // Check for fallback hosted by
      expect(screen.getByText('Kootenay Association for Science & Technology (KAST)')).toBeInTheDocument();
    });

    it('should have proper section structure', () => {
      render(
        <TestWrapper>
          <AboutSection />
        </TestWrapper>
      );

      // Check main heading
      expect(screen.getByRole('heading', { name: /about the collective/i })).toBeInTheDocument();
      
      // Check location section
      expect(screen.getByText('Location')).toBeInTheDocument();
    });
  });
});

describe('Settings Integration Behavior', () => {
  it('should handle undefined values gracefully', () => {
    const mockUseSetting = require('@/hooks/useSettings').useSetting;
    
    // Mock undefined values
    mockUseSetting.mockImplementation(() => ({
      value: undefined,
      loading: false,
      error: null,
      exists: false
    }));

    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    // Component should still render without crashing
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
  });

  it('should handle loading state gracefully', () => {
    const mockUseSetting = require('@/hooks/useSettings').useSetting;
    
    // Mock loading state
    mockUseSetting.mockImplementation((category: string, key: string, fallback: any) => ({
      value: fallback,
      loading: true,
      error: null,
      exists: false
    }));

    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    // Component should still render with fallback values during loading
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByText('hello@nelsontech.community')).toBeInTheDocument();
  });

  it('should handle error state gracefully', () => {
    const mockUseSetting = require('@/hooks/useSettings').useSetting;
    
    // Mock error state
    mockUseSetting.mockImplementation((category: string, key: string, fallback: any) => ({
      value: fallback,
      loading: false,
      error: 'Settings fetch failed',
      exists: false
    }));

    render(
      <TestWrapper>
        <ContactPage />
      </TestWrapper>
    );

    // Component should still render with fallback values during error
    expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByText('hello@nelsontech.community')).toBeInTheDocument();
  });
});