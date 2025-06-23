import { supabase } from '@/utils/checkSupabase';

export interface TransactionalEmailRequest {
  template_name: string;
  to: string | string[];
  template_data: Record<string, any>;
  options?: {
    subject?: string;
    from?: string;
    campaign_id?: string;
    user_id?: string;
  };
}

export interface TransactionalEmailResponse {
  success: boolean;
  message_id?: string;
  template_used?: string;
  error?: string;
  details?: string;
}

/**
 * Send transactional email using Supabase Edge Function
 */
export async function sendTransactionalEmail(
  request: TransactionalEmailRequest
): Promise<TransactionalEmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-transactional-email', {
      body: request,
    });

    if (error) {
      throw error;
    }

    return data as TransactionalEmailResponse;
  } catch (error) {
    console.error('Error sending transactional email:', error);
    return {
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userData: {
    first_name: string;
    last_name?: string;
    id: string;
  },
  options?: {
    community_name?: string;
    platform_url?: string;
    support_email?: string;
  }
): Promise<TransactionalEmailResponse> {
  return sendTransactionalEmail({
    template_name: 'Welcome Email',
    to: userEmail,
    template_data: {
      user: userData,
      community_name: options?.community_name || 'Kootenay Tech Community',
      platform_url: options?.platform_url || window.location.origin,
      support_email: options?.support_email || 'support@kootenaytech.community',
      branding: {
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        logo_url: '/logo.png',
        footer_text: 'Kootenay Tech Community',
      },
    },
    options: {
      user_id: userData.id,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userData: {
    first_name: string;
    id: string;
  },
  resetToken: string,
  options?: {
    community_name?: string;
    support_email?: string;
    expiry_hours?: number;
  }
): Promise<TransactionalEmailResponse> {
  const resetUrl = `${window.location.origin}/auth/reset-password?token=${resetToken}`;
  
  return sendTransactionalEmail({
    template_name: 'Password Reset',
    to: userEmail,
    template_data: {
      user: userData,
      community_name: options?.community_name || 'Kootenay Tech Community',
      reset_url: resetUrl,
      expiry_hours: options?.expiry_hours || 24,
      support_email: options?.support_email || 'support@kootenaytech.community',
      branding: {
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        logo_url: '/logo.png',
        footer_text: 'Kootenay Tech Community',
      },
    },
    options: {
      user_id: userData.id,
    },
  });
}

/**
 * Send email verification
 */
export async function sendEmailVerification(
  userEmail: string,
  userData: {
    first_name: string;
    id: string;
  },
  verificationToken: string,
  options?: {
    community_name?: string;
    expiry_hours?: number;
  }
): Promise<TransactionalEmailResponse> {
  const verificationUrl = `${window.location.origin}/auth/verify-email?token=${verificationToken}`;
  
  return sendTransactionalEmail({
    template_name: 'Email Verification',
    to: userEmail,
    template_data: {
      user: userData,
      community_name: options?.community_name || 'Kootenay Tech Community',
      verification_url: verificationUrl,
      expiry_hours: options?.expiry_hours || 48,
      branding: {
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        logo_url: '/logo.png',
        footer_text: 'Kootenay Tech Community',
      },
    },
    options: {
      user_id: userData.id,
    },
  });
}

/**
 * Send contact form auto-reply
 */
export async function sendContactAutoReply(
  submission: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: string;
  },
  options?: {
    community_name?: string;
    support_email?: string;
    support_url?: string;
    estimated_response_time?: string;
  }
): Promise<TransactionalEmailResponse> {
  const estimatedResponseTime = options?.estimated_response_time || getEstimatedResponseTime(submission.type);
  
  return sendTransactionalEmail({
    template_name: 'Contact Form Auto-Reply',
    to: submission.email,
    template_data: {
      submission,
      community_name: options?.community_name || 'Kootenay Tech Community',
      estimated_response_time: estimatedResponseTime,
      support_email: options?.support_email || 'support@kootenaytech.community',
      support_url: options?.support_url || `${window.location.origin}/support`,
      branding: {
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        logo_url: '/logo.png',
        footer_text: 'Kootenay Tech Community',
      },
    },
    // Note: submission_id removed as it's not a valid sendEmail option
  });
}

/**
 * Send newsletter campaign using newsletter template
 */
export async function sendNewsletterCampaign(
  campaignId: string,
  subscriberEmail: string,
  subscriberId: string,
  newsletterData: {
    title: string;
    date: string;
    custom_message?: string;
  },
  content: {
    events?: Array<{
      title: string;
      date: string;
      time: string;
      location: string;
      url: string;
    }>;
    news?: Array<{
      title: string;
      excerpt: string;
      url: string;
    }>;
    opportunities?: Array<{
      title: string;
      company: string;
      location: string;
      type: string;
      url: string;
    }>;
  },
  options?: {
    community_name?: string;
  }
): Promise<TransactionalEmailResponse> {
  const unsubscribeUrl = `${window.location.origin}/newsletter/unsubscribe?id=${subscriberId}`;
  const viewOnlineUrl = `${window.location.origin}/newsletter/view/${campaignId}`;
  
  return sendTransactionalEmail({
    template_name: 'Newsletter Digest',
    to: subscriberEmail,
    template_data: {
      newsletter: newsletterData,
      content,
      community_name: options?.community_name || 'Kootenay Tech Community',
      view_online_url: viewOnlineUrl,
      unsubscribe_url: unsubscribeUrl,
      branding: {
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        logo_url: '/logo.png',
        footer_text: 'Kootenay Tech Community',
        social_links: [],
      },
    },
    options: {
      campaign_id: campaignId,
      user_id: subscriberId,
    },
  });
}

/**
 * Get estimated response time based on submission type
 */
function getEstimatedResponseTime(type: string): string {
  const responseTimes: Record<string, string> = {
    'urgent': '2-4 hours',
    'support': '12-24 hours',
    'general': '24-48 hours',
    'partnership': '3-5 business days',
    'volunteer': '2-3 business days',
    'speaker_request': '1-2 weeks',
  };

  return responseTimes[type] || '24-48 hours';
}

/**
 * Get available transactional email templates
 */
export async function getTransactionalTemplates(): Promise<{
  data: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    is_active: boolean;
  }> | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('newsletter_templates')
      .select('id, name, description, type, is_active')
      .eq('is_active', true)
      .order('name');

    return { data, error };
  } catch (error) {
    console.error('Error fetching transactional templates:', error);
    return { data: null, error };
  }
}

/**
 * Test transactional email template
 */
export async function testTransactionalTemplate(
  templateName: string,
  testEmail: string,
  sampleData?: Record<string, any>
): Promise<TransactionalEmailResponse> {
  // Generate sample data based on template type
  const defaultSampleData = generateSampleData(templateName);
  const mergedData = { ...defaultSampleData, ...sampleData };

  return sendTransactionalEmail({
    template_name: templateName,
    to: testEmail,
    template_data: mergedData,
    options: {
      subject: `[TEST] ${templateName} Template`,
    },
  });
}

/**
 * Generate sample data for testing templates
 */
function generateSampleData(templateName: string): Record<string, any> {
  const lowerName = templateName.toLowerCase();
  
  if (lowerName.includes('welcome')) {
    return {
      user: {
        first_name: 'John',
        last_name: 'Doe',
        id: 'test-user-123',
      },
      community_name: 'Kootenay Tech Community',
      platform_url: window.location.origin,
      support_email: 'support@kootenaytech.community',
    };
  }
  
  if (lowerName.includes('password') || lowerName.includes('reset')) {
    return {
      user: {
        first_name: 'John',
        id: 'test-user-123',
      },
      community_name: 'Kootenay Tech Community',
      reset_url: `${window.location.origin}/auth/reset-password?token=test-token`,
      expiry_hours: 24,
      support_email: 'support@kootenaytech.community',
    };
  }
  
  if (lowerName.includes('verification') || lowerName.includes('verify')) {
    return {
      user: {
        first_name: 'John',
        id: 'test-user-123',
      },
      community_name: 'Kootenay Tech Community',
      verification_url: `${window.location.origin}/auth/verify-email?token=test-token`,
      expiry_hours: 48,
    };
  }
  
  if (lowerName.includes('contact') || lowerName.includes('auto-reply')) {
    return {
      submission: {
        id: 'test-submission-123',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Contact Form Submission',
        message: 'This is a test message for the contact form auto-reply.',
        type: 'general',
      },
      community_name: 'Kootenay Tech Community',
      estimated_response_time: '24-48 hours',
      support_email: 'support@kootenaytech.community',
      support_url: `${window.location.origin}/support`,
    };
  }
  
  if (lowerName.includes('newsletter') || lowerName.includes('digest')) {
    return {
      newsletter: {
        title: 'Weekly Tech Digest',
        date: new Date().toLocaleDateString(),
        custom_message: 'Welcome to this week\'s digest of community updates!',
      },
      content: {
        events: [
          {
            title: 'Tech Meetup',
            date: 'December 15, 2023',
            time: '6:00 PM',
            location: 'Nelson Innovation Centre',
            url: '#',
          },
        ],
        news: [
          {
            title: 'New Partnership Announcement',
            excerpt: 'We\'re excited to announce our new partnership...',
            url: '#',
          },
        ],
      },
      community_name: 'Kootenay Tech Community',
      view_online_url: '#',
      unsubscribe_url: '#',
    };
  }
  
  return {};
}