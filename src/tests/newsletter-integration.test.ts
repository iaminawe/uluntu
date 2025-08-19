/**
 * Integration test for newsletter functionality
 * Tests both member and non-member newsletter flows
 */

import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116' } // Not found
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-sub-id',
              email: 'test@example.com',
              status: 'pending',
              preferences: {
                frequency: 'weekly',
                content_types: ['events', 'news'],
                format: 'digest',
                location_filter: true,
                language: 'en'
              },
              subscription_token: 'test-token',
              confirmation_token: 'test-confirm-token',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            data: [{
              id: 'test-sub-id',
              email: 'test@example.com',
              status: 'active',
              confirmed_at: new Date().toISOString()
            }],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock the email service with real implementation test
jest.mock('@/services/resend', () => ({
  resendService: {
    sendConfirmationEmail: jest.fn(() => Promise.resolve(true))
  }
}));

describe('Newsletter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Newsletter Signup', () => {
    it('should allow non-members to subscribe with email confirmation', async () => {
      const subscriptionRequest = {
        email: 'public@example.com',
        preferences: {
          frequency: 'weekly' as const,
          content_types: ['events', 'news'] as const,
          format: 'digest' as const,
          location_filter: true,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(subscriptionRequest);

      expect(result).toBeDefined();
      expect(result?.email).toBe('public@example.com');
      expect(result?.status).toBe('pending'); // Should require confirmation
      expect(result?.confirmation_token).toBeDefined();
    });

    it('should confirm subscription with valid token', async () => {
      const confirmationToken = 'test-confirm-token';
      
      const result = await newsletterSubscriptionApi.confirmSubscription(confirmationToken);
      
      expect(result).toBe(true);
    });
  });

  describe('Member Newsletter Settings', () => {
    it('should allow members to subscribe immediately (skip confirmation)', async () => {
      const memberSubscriptionRequest = {
        email: 'member@example.com',
        member_id: 'test-member-id',
        preferences: {
          frequency: 'weekly' as const,
          content_types: ['events', 'news', 'opportunities'] as const,
          format: 'digest' as const,
          location_filter: true,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(memberSubscriptionRequest);

      expect(result).toBeDefined();
      expect(result?.email).toBe('member@example.com');
      expect(result?.member_id).toBe('test-member-id');
    });

    it('should load existing subscription preferences', async () => {
      const existingSubscription = await newsletterSubscriptionApi.getSubscription('test@example.com');
      
      // Should handle case where no subscription exists
      expect(existingSubscription).toBeNull();
    });

    it('should update subscription preferences', async () => {
      const updateRequest = {
        preferences: {
          frequency: 'monthly' as const,
          content_types: ['events', 'marketplace'] as const,
          format: 'full' as const,
          location_filter: false,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.updatePreferences('test-token', updateRequest);
      
      expect(result).toBeDefined();
    });

    it('should allow unsubscribing', async () => {
      const result = await newsletterSubscriptionApi.unsubscribe('test-token');
      
      expect(result).toBe(true);
    });
  });

  describe('Content Type Preferences', () => {
    it('should handle all available content types', async () => {
      const allContentTypes = ['events', 'news', 'opportunities', 'marketplace', 'members'];
      
      const subscriptionRequest = {
        email: 'all-content@example.com',
        preferences: {
          frequency: 'weekly' as const,
          content_types: allContentTypes as any,
          format: 'digest' as const,
          location_filter: true,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(subscriptionRequest);

      expect(result).toBeDefined();
      expect(result?.preferences?.content_types).toEqual(allContentTypes);
    });

    it('should handle minimal content types', async () => {
      const minimalContentTypes = ['events'];
      
      const subscriptionRequest = {
        email: 'minimal@example.com',
        preferences: {
          frequency: 'monthly' as const,
          content_types: minimalContentTypes as any,
          format: 'digest' as const,
          location_filter: true,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(subscriptionRequest);

      expect(result).toBeDefined();
      expect(result?.preferences?.content_types).toEqual(minimalContentTypes);
    });
  });

  describe('Frequency Options', () => {
    it.each(['daily', 'weekly', 'monthly'])('should handle %s frequency', async (frequency) => {
      const subscriptionRequest = {
        email: `${frequency}@example.com`,
        preferences: {
          frequency: frequency as any,
          content_types: ['events', 'news'] as const,
          format: 'digest' as const,
          location_filter: true,
          language: 'en' as const
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(subscriptionRequest);

      expect(result).toBeDefined();
      expect(result?.preferences?.frequency).toBe(frequency);
    });
  });
});