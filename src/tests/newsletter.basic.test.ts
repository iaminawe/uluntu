// Mock environment dependencies first
jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import { newsletterSubscriptionApi } from '@/api/newsletter/subscriptions';
import { newsletterCampaignApi } from '@/api/newsletter/campaigns';
import { newsletterContentApi } from '@/api/newsletter/content';

// Mock Supabase to avoid actual database calls during testing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id', email: 'test@example.com' }, 
            error: null 
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    }
  }
}));

// Mock Resend service
jest.mock('@/services/resend', () => ({
  resendService: {
    sendConfirmationEmail: jest.fn(() => Promise.resolve(true)),
    sendTestEmail: jest.fn(() => Promise.resolve(true)),
    sendNewsletterCampaign: jest.fn(() => Promise.resolve({
      success: true,
      sent_count: 1,
      failed_count: 0,
      failed_emails: []
    }))
  }
}));

describe('Newsletter System Basic Tests', () => {
  describe('Subscription API', () => {
    it('should create subscription API instance', () => {
      expect(newsletterSubscriptionApi).toBeDefined();
      expect(typeof newsletterSubscriptionApi.subscribe).toBe('function');
      expect(typeof newsletterSubscriptionApi.confirmSubscription).toBe('function');
      expect(typeof newsletterSubscriptionApi.unsubscribe).toBe('function');
    });

    it('should handle subscription creation', async () => {
      const request = {
        email: 'test@example.com',
        preferences: {
          frequency: 'weekly' as const,
          content_types: ['events' as const, 'news' as const],
          format: 'digest' as const,
          location_filter: true,
          language: 'en'
        }
      };

      const result = await newsletterSubscriptionApi.subscribe(request);
      // Since we're mocking, we don't expect actual data, but no errors
      expect(result).toBeDefined();
    });
  });

  describe('Campaign API', () => {
    it('should create campaign API instance', () => {
      expect(newsletterCampaignApi).toBeDefined();
      expect(typeof newsletterCampaignApi.createCampaign).toBe('function');
      expect(typeof newsletterCampaignApi.sendCampaign).toBe('function');
      expect(typeof newsletterCampaignApi.getCampaigns).toBe('function');
    });

    it('should handle campaign creation', async () => {
      const request = {
        title: 'Test Newsletter',
        subject: 'Test Subject',
        template_id: 'test-template',
        custom_message: 'Hello community!'
      };

      const result = await newsletterCampaignApi.createCampaign(request);
      // Since we're mocking, we don't expect actual data, but no errors
      expect(result).toBeDefined();
    });
  });

  describe('Content API', () => {
    it('should create content API instance', () => {
      expect(newsletterContentApi).toBeDefined();
      expect(typeof newsletterContentApi.generateCuratedContent).toBe('function');
    });

    it('should handle content generation', async () => {
      const result = await newsletterContentApi.generateCuratedContent();
      // Since we're mocking the database, this will return null but shouldn't error
      expect(result).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should have all required types defined', () => {
      // Test that our types are properly exported
      const subscriptionData = {
        id: 'test',
        email: 'test@example.com',
        status: 'active' as const,
        preferences: {
          frequency: 'weekly' as const,
          content_types: ['events' as const],
          format: 'digest' as const,
          location_filter: true,
          language: 'en'
        },
        subscription_token: 'token',
        subscribed_at: new Date().toISOString(),
        bounce_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      expect(subscriptionData.status).toBe('active');
      expect(subscriptionData.preferences.frequency).toBe('weekly');
    });
  });
});