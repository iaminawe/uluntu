import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  sendTransactionalEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail,
  sendEmailVerification,
  sendContactAutoReply,
  sendNewsletterCampaign,
  getTransactionalTemplates,
  testTransactionalTemplate
} from '@/api/newsletter/transactional';

// Mock Supabase
jest.mock('@/utils/checkSupabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

import { supabase } from '@/utils/checkSupabase';

describe('Transactional Email API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful response by default
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        message_id: 'test-message-id',
        template_used: 'Test Template',
      },
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendTransactionalEmail', () => {
    test('should send transactional email successfully', async () => {
      const request = {
        template_name: 'Welcome Email',
        to: 'test@example.com',
        template_data: {
          user: { first_name: 'John', id: '123' },
        },
      };

      const result = await sendTransactionalEmail(request);

      expect(result.success).toBe(true);
      expect(result.message_id).toBe('test-message-id');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: request,
      });
    });

    test('should handle email send failure', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Function execution failed' },
      });

      const request = {
        template_name: 'Welcome Email',
        to: 'test@example.com',
        template_data: {},
      };

      const result = await sendTransactionalEmail(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });

    test('should handle multiple recipients', async () => {
      const request = {
        template_name: 'Newsletter Digest',
        to: ['user1@example.com', 'user2@example.com'],
        template_data: {
          newsletter: { title: 'Test Newsletter' },
        },
      };

      const result = await sendTransactionalEmail(request);

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: request,
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    test('should send welcome email with correct template data', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        id: 'user-123',
      };

      const result = await sendWelcomeEmail('john@example.com', userData);

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Welcome Email',
          to: 'john@example.com',
          template_data: expect.objectContaining({
            user: userData,
            community_name: 'Kootenay Tech Community',
          }),
          options: {
            user_id: 'user-123',
          },
        }),
      });
    });

    test('should allow custom options', async () => {
      const userData = {
        first_name: 'Jane',
        id: 'user-456',
      };

      const options = {
        community_name: 'Custom Community',
        support_email: 'custom@example.com',
      };

      await sendWelcomeEmail('jane@example.com', userData, options);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_data: expect.objectContaining({
            community_name: 'Custom Community',
            support_email: 'custom@example.com',
          }),
        }),
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email with reset token', async () => {
      const userData = {
        first_name: 'John',
        id: 'user-123',
      };

      // Mock window.location for URL generation
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      });

      const result = await sendPasswordResetEmail('john@example.com', userData, 'reset-token-123');

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Password Reset',
          template_data: expect.objectContaining({
            reset_url: 'https://example.com/auth/reset-password?token=reset-token-123',
            expiry_hours: 24,
          }),
        }),
      });
    });
  });

  describe('sendEmailVerification', () => {
    test('should send email verification with verification token', async () => {
      const userData = {
        first_name: 'John',
        id: 'user-123',
      };

      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      });

      const result = await sendEmailVerification('john@example.com', userData, 'verify-token-123');

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Email Verification',
          template_data: expect.objectContaining({
            verification_url: 'https://example.com/auth/verify-email?token=verify-token-123',
            expiry_hours: 48,
          }),
        }),
      });
    });
  });

  describe('sendContactAutoReply', () => {
    test('should send contact auto-reply with submission data', async () => {
      const submission = {
        id: 'sub-123',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        type: 'general',
      };

      const result = await sendContactAutoReply(submission);

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Contact Form Auto-Reply',
          template_data: expect.objectContaining({
            submission,
            estimated_response_time: '24-48 hours',
          }),
          options: {
            submission_id: 'sub-123',
          },
        }),
      });
    });

    test('should calculate correct response time for urgent submissions', async () => {
      const submission = {
        id: 'sub-456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Urgent Issue',
        message: 'This is urgent',
        type: 'urgent',
      };

      await sendContactAutoReply(submission);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_data: expect.objectContaining({
            estimated_response_time: '2-4 hours',
          }),
        }),
      });
    });
  });

  describe('sendNewsletterCampaign', () => {
    test('should send newsletter campaign with content', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      });

      const newsletterData = {
        title: 'Weekly Digest',
        date: '2023-12-01',
        custom_message: 'Welcome to this week!',
      };

      const content = {
        events: [
          {
            title: 'Tech Meetup',
            date: '2023-12-15',
            time: '6:00 PM',
            location: 'Innovation Centre',
            url: '/events/1',
          },
        ],
      };

      const result = await sendNewsletterCampaign(
        'campaign-123',
        'subscriber@example.com',
        'sub-456',
        newsletterData,
        content
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Newsletter Digest',
          template_data: expect.objectContaining({
            newsletter: newsletterData,
            content,
            unsubscribe_url: 'https://example.com/newsletter/unsubscribe?id=sub-456',
            view_online_url: 'https://example.com/newsletter/view/campaign-123',
          }),
          options: {
            campaign_id: 'campaign-123',
            user_id: 'sub-456',
          },
        }),
      });
    });
  });

  describe('getTransactionalTemplates', () => {
    test('should fetch available templates', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Welcome Email',
          description: 'Welcome new users',
          type: 'mjml',
          is_active: true,
        },
        {
          id: '2',
          name: 'Password Reset',
          description: 'Password reset email',
          type: 'mjml',
          is_active: true,
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              data: mockTemplates,
              error: null,
            }),
          }),
        }),
      });

      const result = await getTransactionalTemplates();

      expect(result.data).toEqual(mockTemplates);
      expect(result.error).toBeNull();
    });

    test('should handle database error', async () => {
      const mockError = { message: 'Database connection failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await getTransactionalTemplates();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('testTransactionalTemplate', () => {
    test('should send test email with sample data', async () => {
      const result = await testTransactionalTemplate('Welcome Email', 'test@example.com');

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_name: 'Welcome Email',
          to: 'test@example.com',
          template_data: expect.objectContaining({
            user: expect.objectContaining({
              first_name: 'John',
              id: 'test-user-123',
            }),
          }),
          options: {
            subject: '[TEST] Welcome Email Template',
          },
        }),
      });
    });

    test('should generate appropriate sample data for password reset', async () => {
      await testTransactionalTemplate('Password Reset', 'test@example.com');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_data: expect.objectContaining({
            reset_url: expect.stringContaining('/auth/reset-password?token=test-token'),
            expiry_hours: 24,
          }),
        }),
      });
    });

    test('should allow custom sample data', async () => {
      const customData = {
        user: { first_name: 'Custom', id: 'custom-123' },
      };

      await testTransactionalTemplate('Welcome Email', 'test@example.com', customData);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-transactional-email', {
        body: expect.objectContaining({
          template_data: expect.objectContaining({
            user: { first_name: 'Custom', id: 'custom-123' },
          }),
        }),
      });
    });
  });
});

describe('Error Handling', () => {
  test('should handle network errors gracefully', async () => {
    (supabase.functions.invoke as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await sendTransactionalEmail({
      template_name: 'Welcome Email',
      to: 'test@example.com',
      template_data: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send email');
    expect(result.details).toBe('Network error');
  });

  test('should handle invalid template names', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: {
        success: false,
        error: 'Template not found',
      },
      error: null,
    });

    const result = await sendTransactionalEmail({
      template_name: 'Non-existent Template',
      to: 'test@example.com',
      template_data: {},
    });

    expect(result.success).toBe(false);
  });
});