import { Resend } from 'resend';
import { settingsApi } from '@/features/admin/api/settings';
import { sendTransactionalEmail, sendContactAutoReply } from '@/api/newsletter/transactional';

// Browser-compatible UUID generation
const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Types for email notifications
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'partnership' | 'volunteer' | 'speaker_request';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  admin_emails: string[];
  notification_types: {
    new_submission: boolean;
    status_change: boolean;
    assignment: boolean;
    high_priority: boolean;
  };
  templates: {
    new_submission: EmailTemplate;
    status_change: EmailTemplate;
    assignment: EmailTemplate;
    auto_reply: EmailTemplate;
  };
  auto_reply: {
    enabled: boolean;
    delay_minutes: number;
  };
  rate_limiting: {
    max_per_hour: number;
    max_per_day: number;
  };
}

export interface EmailTemplate {
  subject: string;
  html_template: string;
  text_template: string;
  variables: string[];
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'mjml' | 'react-email';
  template_content: string;
  default_settings?: Record<string, any>;
  preview_image?: string;
  is_active: boolean;
}

export interface EmailQueueItem {
  id: string;
  type: 'new_submission' | 'status_change' | 'assignment' | 'auto_reply' | 'newsletter' | 'welcome' | 'password_reset' | 'email_verification';
  to_emails: string[];
  submission_id?: string;
  campaign_id?: string;
  user_id?: string;
  template_data: Record<string, any>;
  scheduled_at: string;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  notification_types: {
    new_submission: boolean;
    status_change: boolean;
    assignment: boolean;
    mentions: boolean;
  };
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM format
    end_time: string;   // HH:MM format
    timezone: string;
  };
}

export class EmailNotificationService {
  private client: Resend;
  private fromEmail: string;
  private fromName: string;
  private queue: EmailQueueItem[] = [];
  private processing = false;
  private newsletterTemplates: Map<string, NewsletterTemplate> = new Map();

  constructor() {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key not found. Email notifications will be disabled.');
      this.client = new Resend('re_placeholder_key');
      this.fromEmail = 'noreply@example.com';
      this.fromName = 'Support Team';
      return;
    }

    this.client = new Resend(apiKey);
    this.fromEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@kootenaytech.community';
    this.fromName = import.meta.env.VITE_SUPPORT_NAME || 'Kootenay Tech Community Support';
    
    // Load newsletter templates on initialization
    this.loadNewsletterTemplates();
  }

  /**
   * Load newsletter templates from database
   */
  private async loadNewsletterTemplates(): Promise<void> {
    try {
      const { data: templates } = await fetch('/api/newsletter/templates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      if (templates) {
        this.newsletterTemplates.clear();
        templates.forEach((template: NewsletterTemplate) => {
          this.newsletterTemplates.set(template.name.toLowerCase(), template);
        });
      }
    } catch (error) {
      console.warn('Failed to load newsletter templates:', error);
    }
  }

  /**
   * Get newsletter template by name
   */
  private getNewsletterTemplate(name: string): NewsletterTemplate | undefined {
    return this.newsletterTemplates.get(name.toLowerCase());
  }

  /**
   * Send transactional email using newsletter template
   */
  async sendTransactionalEmail(
    templateName: string,
    to: string | string[],
    templateData: Record<string, any>,
    options?: {
      subject?: string;
      from?: string;
      campaign_id?: string;
      user_id?: string;
    }
  ): Promise<boolean> {
    try {
      const template = this.getNewsletterTemplate(templateName);
      if (!template) {
        throw new Error(`Newsletter template '${templateName}' not found`);
      }

      const queueItem: EmailQueueItem = {
        id: generateUUID(),
        type: this.mapTemplateToType(templateName),
        to_emails: Array.isArray(to) ? to : [to],
        campaign_id: options?.campaign_id,
        user_id: options?.user_id,
        template_data: {
          ...templateData,
          template,
          branding: templateData.branding || this.getDefaultBranding(),
        },
        scheduled_at: new Date().toISOString(),
        attempts: 0,
        max_attempts: 3,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await this.addToQueue(queueItem);
      return true;
    } catch (error) {
      console.error('Error sending transactional email:', error);
      return false;
    }
  }

  /**
   * Map template name to email type
   */
  private mapTemplateToType(templateName: string): EmailQueueItem['type'] {
    const lowerName = templateName.toLowerCase();
    if (lowerName.includes('welcome')) return 'welcome';
    if (lowerName.includes('password') || lowerName.includes('reset')) return 'password_reset';
    if (lowerName.includes('verification') || lowerName.includes('confirm')) return 'email_verification';
    if (lowerName.includes('newsletter') || lowerName.includes('digest')) return 'newsletter';
    return 'newsletter'; // default
  }

  /**
   * Get default branding for emails
   */
  private getDefaultBranding(): Record<string, any> {
    return {
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      logo_url: import.meta.env.VITE_LOGO_URL || '',
      footer_text: 'Kootenay Tech Community',
      social_links: [],
    };
  }

  /**
   * Send newsletter campaign
   */
  async sendNewsletterCampaign(
    campaignId: string,
    templateData: Record<string, any>,
    subscribers: Array<{ email: string; id: string }>
  ): Promise<boolean> {
    try {
      const batchSize = 50; // Send in batches to avoid overwhelming the API
      
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        
        for (const subscriber of batch) {
          const queueItem: EmailQueueItem = {
            id: generateUUID(),
            type: 'newsletter',
            to_emails: [subscriber.email],
            campaign_id: campaignId,
            user_id: subscriber.id,
            template_data: {
              ...templateData,
              subscriber,
              unsubscribe_url: this.getUnsubscribeUrl(subscriber.id),
              view_online_url: this.getViewOnlineUrl(campaignId),
            },
            scheduled_at: new Date(Date.now() + i * 100).toISOString(), // Stagger sends
            attempts: 0,
            max_attempts: 3,
            status: 'pending',
            created_at: new Date().toISOString(),
          };

          await this.addToQueue(queueItem);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending newsletter campaign:', error);
      return false;
    }
  }

  /**
   * Send notification for new contact submission
   */
  async sendNewSubmissionNotification(submission: ContactSubmission): Promise<boolean> {
    try {
      const config = await this.getNotificationConfig();
      
      if (!config.enabled || !config.notification_types.new_submission) {
        return false;
      }

      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length === 0) {
        console.warn('No admin emails configured for notifications');
        return false;
      }

      // Create email queue item
      const queueItem: EmailQueueItem = {
        id: generateUUID(),
        type: 'new_submission',
        to_emails: adminEmails,
        submission_id: submission.id,
        template_data: {
          submission,
          ticket_url: this.getTicketUrl(submission.id),
          admin_dashboard_url: this.getAdminDashboardUrl(),
        },
        scheduled_at: new Date().toISOString(),
        attempts: 0,
        max_attempts: 3,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await this.addToQueue(queueItem);
      
      // Send auto-reply using new transactional email system if enabled
      if (config.auto_reply.enabled) {
        try {
          const result = await sendContactAutoReply(submission);
          if (!result.success) {
            console.warn('Failed to send auto-reply via transactional system, falling back to legacy:', result.error);
            await this.scheduleAutoReply(submission, config.auto_reply.delay_minutes);
          }
        } catch (error) {
          console.warn('Error with transactional auto-reply, using legacy system:', error);
          await this.scheduleAutoReply(submission, config.auto_reply.delay_minutes);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending new submission notification:', error);
      return false;
    }
  }

  /**
   * Send notification for status change
   */
  async sendStatusChangeNotification(
    submission: ContactSubmission, 
    oldStatus: string, 
    newStatus: string,
    changedBy: string
  ): Promise<boolean> {
    try {
      const config = await this.getNotificationConfig();
      
      if (!config.enabled || !config.notification_types.status_change) {
        return false;
      }

      const adminEmails = await this.getAdminEmails();
      
      const queueItem: EmailQueueItem = {
        id: generateUUID(),
        type: 'status_change',
        to_emails: adminEmails,
        submission_id: submission.id,
        template_data: {
          submission,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: changedBy,
          ticket_url: this.getTicketUrl(submission.id),
        },
        scheduled_at: new Date().toISOString(),
        attempts: 0,
        max_attempts: 3,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await this.addToQueue(queueItem);
      return true;
    } catch (error) {
      console.error('Error sending status change notification:', error);
      return false;
    }
  }

  /**
   * Send notification for assignment
   */
  async sendAssignmentNotification(
    submission: ContactSubmission,
    assignedTo: string,
    assignedBy: string
  ): Promise<boolean> {
    try {
      const config = await this.getNotificationConfig();
      
      if (!config.enabled || !config.notification_types.assignment) {
        return false;
      }

      // Get assigned user email
      const assignedUserEmail = await this.getUserEmail(assignedTo);
      if (!assignedUserEmail) {
        console.warn('Could not find email for assigned user:', assignedTo);
        return false;
      }

      const queueItem: EmailQueueItem = {
        id: generateUUID(),
        type: 'assignment',
        to_emails: [assignedUserEmail],
        submission_id: submission.id,
        template_data: {
          submission,
          assigned_to: assignedTo,
          assigned_by: assignedBy,
          ticket_url: this.getTicketUrl(submission.id),
        },
        scheduled_at: new Date().toISOString(),
        attempts: 0,
        max_attempts: 3,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await this.addToQueue(queueItem);
      return true;
    } catch (error) {
      console.error('Error sending assignment notification:', error);
      return false;
    }
  }

  /**
   * Process email queue
   */
  async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      const pendingItems = this.queue.filter(item => 
        item.status === 'pending' && 
        new Date(item.scheduled_at) <= new Date()
      );

      for (const item of pendingItems) {
        await this.processQueueItem(item);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: EmailQueueItem): Promise<void> {
    try {
      item.status = 'sending';
      item.attempts++;

      let subject: string, html: string, text: string;

      // Check if this is a newsletter template email
      if (['newsletter', 'welcome', 'password_reset', 'email_verification'].includes(item.type)) {
        const result = await this.renderNewsletterTemplate(item);
        subject = result.subject;
        html = result.html;
        text = result.text;
      } else {
        // Use traditional inline templates
        const config = await this.getNotificationConfig();
        const template = config.templates[item.type as keyof typeof config.templates];
        
        if (!template) {
          throw new Error(`Template not found for type: ${item.type}`);
        }

        const result = this.renderTemplate(template, item.template_data);
        subject = result.subject;
        html = result.html;
        text = result.text;
      }

      // Send email using Resend
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: item.to_emails,
        subject,
        html,
        text,
        headers: {
          'X-Submission-ID': item.submission_id || '',
          'X-Campaign-ID': item.campaign_id || '',
          'X-User-ID': item.user_id || '',
          'X-Notification-Type': item.type,
          'X-Queue-ID': item.id,
        },
        tags: [
          { name: 'type', value: 'notification' },
          { name: 'notification_type', value: item.type },
          ...(item.submission_id ? [{ name: 'submission_id', value: item.submission_id }] : []),
          ...(item.campaign_id ? [{ name: 'campaign_id', value: item.campaign_id }] : []),
          ...(item.user_id ? [{ name: 'user_id', value: item.user_id }] : []),
        ]
      };

      const result = await this.client.emails.send(emailData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      item.status = 'sent';
      item.sent_at = new Date().toISOString();

    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error);
      
      item.error_message = error instanceof Error ? error.message : 'Unknown error';
      
      if (item.attempts >= item.max_attempts) {
        item.status = 'failed';
      } else {
        item.status = 'pending';
        // Exponential backoff: retry after 2^attempts minutes
        const delayMinutes = Math.pow(2, item.attempts);
        item.scheduled_at = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
      }
    }
  }

  /**
   * Schedule auto-reply email
   */
  private async scheduleAutoReply(submission: ContactSubmission, delayMinutes: number): Promise<void> {
    const queueItem: EmailQueueItem = {
      id: generateUUID(),
      type: 'auto_reply',
      to_emails: [submission.email],
      submission_id: submission.id,
      template_data: {
        submission,
        support_url: this.getSupportUrl(),
        estimated_response_time: this.getEstimatedResponseTime(submission.type),
      },
      scheduled_at: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
      attempts: 0,
      max_attempts: 2,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    await this.addToQueue(queueItem);
  }

  /**
   * Render newsletter template
   */
  private async renderNewsletterTemplate(item: EmailQueueItem): Promise<{
    subject: string;
    html: string;
    text: string;
  }> {
    const template = item.template_data.template as NewsletterTemplate;
    if (!template) {
      throw new Error('Newsletter template not found in template data');
    }

    // For now, we'll use a simple template renderer
    // In a full implementation, you'd want MJML compilation or React Email rendering
    const { subject, html, text } = this.renderSimpleTemplate(template, item.template_data);

    return { subject, html, text };
  }

  /**
   * Simple template renderer for newsletter templates
   */
  private renderSimpleTemplate(template: NewsletterTemplate, data: Record<string, any>): {
    subject: string;
    html: string;
    text: string;
  } {
    const renderString = (str: string, data: Record<string, any>): string => {
      return str.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = this.getNestedValue(data, path);
        return value !== undefined ? String(value) : match;
      });
    };

    // Extract subject from template content or use template name
    let subject = template.name;
    if (template.template_content.includes('<title>')) {
      const titleMatch = template.template_content.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        subject = titleMatch[1];
      }
    }

    // Convert MJML or template content to HTML
    let html = template.template_content;
    if (template.type === 'mjml') {
      // In a real implementation, you'd compile MJML here
      // For now, just wrap in basic HTML structure if needed
      if (!html.includes('<html>')) {
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${subject}</title>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `;
      }
    }

    // Generate text version from HTML
    const text = this.htmlToText(html);

    return {
      subject: renderString(subject, data),
      html: renderString(html, data),
      text: renderString(text, data),
    };
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Render email template with data
   */
  private renderTemplate(template: EmailTemplate, data: Record<string, any>): {
    subject: string;
    html: string;
    text: string;
  } {
    const renderString = (str: string, data: Record<string, any>): string => {
      return str.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = this.getNestedValue(data, path);
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      subject: renderString(template.subject, data),
      html: renderString(template.html_template, data),
      text: renderString(template.text_template, data),
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Add item to email queue
   */
  private async addToQueue(item: EmailQueueItem): Promise<void> {
    this.queue.push(item);
    
    // In production, you would save this to a database
    // For now, we'll process immediately for testing
    if (!this.processing) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Get notification configuration from settings
   */
  private async getNotificationConfig(): Promise<EmailNotificationConfig> {
    try {
      const settings = await settingsApi.getPublicSettings();
      
      // Default configuration
      const defaultConfig: EmailNotificationConfig = {
        enabled: true,
        admin_emails: ['admin@kootenaytech.community'],
        notification_types: {
          new_submission: true,
          status_change: true,
          assignment: true,
          high_priority: true,
        },
        templates: {
          new_submission: this.getDefaultTemplate('new_submission'),
          status_change: this.getDefaultTemplate('status_change'),
          assignment: this.getDefaultTemplate('assignment'),
          auto_reply: this.getDefaultTemplate('auto_reply'),
        },
        auto_reply: {
          enabled: true,
          delay_minutes: 5,
        },
        rate_limiting: {
          max_per_hour: 100,
          max_per_day: 500,
        },
      };

      // Override with actual settings if available
      if (settings.contact?.admin_notification_config) {
        return { ...defaultConfig, ...settings.contact.admin_notification_config.value };
      }

      return defaultConfig;
    } catch (error) {
      console.error('Error getting notification config:', error);
      // Return default config as fallback
      return {
        enabled: true,
        admin_emails: ['admin@kootenaytech.community'],
        notification_types: {
          new_submission: true,
          status_change: true,
          assignment: true,
          high_priority: true,
        },
        templates: {
          new_submission: this.getDefaultTemplate('new_submission'),
          status_change: this.getDefaultTemplate('status_change'),
          assignment: this.getDefaultTemplate('assignment'),
          auto_reply: this.getDefaultTemplate('auto_reply'),
        },
        auto_reply: {
          enabled: true,
          delay_minutes: 5,
        },
        rate_limiting: {
          max_per_hour: 100,
          max_per_day: 500,
        },
      };
    }
  }

  /**
   * Get admin email addresses from settings
   */
  private async getAdminEmails(): Promise<string[]> {
    try {
      const settings = await settingsApi.getPublicSettings();
      
      // Try to get from contact settings first
      if (settings.contact?.support_email?.value) {
        return [settings.contact.support_email.value];
      }
      
      if (settings.contact?.email?.value) {
        return [settings.contact.email.value];
      }

      // Fallback to environment or default
      return [this.fromEmail];
    } catch (error) {
      console.error('Error getting admin emails:', error);
      return [this.fromEmail];
    }
  }

  /**
   * Get user email by ID
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      // This would query your users table
      // For now, return a placeholder
      return `user-${userId}@kootenaytech.community`;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Get default email templates
   */
  private getDefaultTemplate(type: string): EmailTemplate {
    const templates = {
      new_submission: {
        subject: 'New Contact Submission: {{submission.subject}}',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">New Contact Submission</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Ticket #{{submission.id}}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Submission Details</h3>
              
              <div style="margin-bottom: 15px;">
                <strong>From:</strong> {{submission.name}} ({{submission.email}})
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Subject:</strong> {{submission.subject}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Type:</strong> {{submission.type}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Priority:</strong> {{submission.priority}}
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong>Message:</strong>
                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin-top: 5px;">
                  {{submission.message}}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="{{ticket_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Ticket
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>This is an automated notification from the Kootenay Tech Community contact system.</p>
            </div>
          </div>
        `,
        text_template: `
New Contact Submission - Ticket #{{submission.id}}

From: {{submission.name}} ({{submission.email}})
Subject: {{submission.subject}}
Type: {{submission.type}}
Priority: {{submission.priority}}

Message:
{{submission.message}}

View ticket: {{ticket_url}}
        `,
        variables: ['submission', 'ticket_url', 'admin_dashboard_url']
      },
      
      status_change: {
        subject: 'Status Update: {{submission.subject}} [{{new_status}}]',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">Ticket Status Update</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Ticket #{{submission.id}}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="margin-bottom: 20px;">
                <strong>Status changed from:</strong> 
                <span style="color: #6c757d;">{{old_status}}</span> 
                → 
                <span style="color: #28a745;">{{new_status}}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Changed by:</strong> {{changed_by}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Subject:</strong> {{submission.subject}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>From:</strong> {{submission.name}} ({{submission.email}})
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="{{ticket_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Ticket
                </a>
              </div>
            </div>
          </div>
        `,
        text_template: `
Ticket Status Update - #{{submission.id}}

Status changed from: {{old_status}} → {{new_status}}
Changed by: {{changed_by}}
Subject: {{submission.subject}}
From: {{submission.name}} ({{submission.email}})

View ticket: {{ticket_url}}
        `,
        variables: ['submission', 'old_status', 'new_status', 'changed_by', 'ticket_url']
      },
      
      assignment: {
        subject: 'Ticket Assigned: {{submission.subject}}',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">Ticket Assigned to You</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Ticket #{{submission.id}}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="margin-bottom: 15px;">
                <strong>Assigned by:</strong> {{assigned_by}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Subject:</strong> {{submission.subject}}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>From:</strong> {{submission.name}} ({{submission.email}})
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Priority:</strong> {{submission.priority}}
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong>Message:</strong>
                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin-top: 5px;">
                  {{submission.message}}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="{{ticket_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View & Respond
                </a>
              </div>
            </div>
          </div>
        `,
        text_template: `
Ticket Assigned to You - #{{submission.id}}

Assigned by: {{assigned_by}}
Subject: {{submission.subject}}
From: {{submission.name}} ({{submission.email}})
Priority: {{submission.priority}}

Message:
{{submission.message}}

View ticket: {{ticket_url}}
        `,
        variables: ['submission', 'assigned_to', 'assigned_by', 'ticket_url']
      },
      
      auto_reply: {
        subject: 'We received your message: {{submission.subject}}',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0;">Thank you for contacting us!</h2>
            </div>
            
            <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <p>Hi {{submission.name}},</p>
              
              <p>We've received your message and will get back to you as soon as possible.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Your message:</strong>
                <div style="margin-top: 10px; font-style: italic;">
                  "{{submission.message}}"
                </div>
              </div>
              
              <p><strong>Estimated response time:</strong> {{estimated_response_time}}</p>
              
              <p>Your ticket number is: <strong>#{{submission.id}}</strong></p>
              
              <p>If you have any urgent questions, please don't hesitate to reach out to us directly.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="{{support_url}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Visit Support Center
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>Best regards,<br>The Kootenay Tech Community Team</p>
            </div>
          </div>
        `,
        text_template: `
Thank you for contacting us!

Hi {{submission.name}},

We've received your message and will get back to you as soon as possible.

Your message:
"{{submission.message}}"

Estimated response time: {{estimated_response_time}}
Your ticket number: #{{submission.id}}

If you have any urgent questions, please don't hesitate to reach out to us directly.

Visit our support center: {{support_url}}

Best regards,
The Kootenay Tech Community Team
        `,
        variables: ['submission', 'support_url', 'estimated_response_time']
      }
    };

    return templates[type as keyof typeof templates] || templates.new_submission;
  }

  /**
   * Get ticket URL for admin dashboard
   */
  private getTicketUrl(submissionId: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/admin/contact-submissions/${submissionId}`;
  }

  /**
   * Get admin dashboard URL
   */
  private getAdminDashboardUrl(): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/admin/contact-submissions`;
  }

  /**
   * Get support center URL
   */
  private getSupportUrl(): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/support`;
  }

  /**
   * Get unsubscribe URL for newsletter
   */
  private getUnsubscribeUrl(subscriptionId: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/unsubscribe?id=${subscriptionId}`;
  }

  /**
   * Get view online URL for newsletter
   */
  private getViewOnlineUrl(campaignId: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/view/${campaignId}`;
  }

  /**
   * Get estimated response time based on submission type
   */
  private getEstimatedResponseTime(type: string): string {
    const responseTimes = {
      'urgent': '2-4 hours',
      'support': '12-24 hours',
      'general': '24-48 hours',
      'partnership': '3-5 business days',
      'volunteer': '2-3 business days',
      'speaker_request': '1-2 weeks'
    };

    return responseTimes[type as keyof typeof responseTimes] || '24-48 hours';
  }

  /**
   * Refresh newsletter templates from database
   */
  async refreshTemplates(): Promise<void> {
    await this.loadNewsletterTemplates();
  }

  /**
   * Get available newsletter templates
   */
  getAvailableTemplates(): NewsletterTemplate[] {
    return Array.from(this.newsletterTemplates.values());
  }

  /**
   * Start processing queue at regular intervals
   */
  startQueueProcessor(): void {
    // Process queue every minute
    setInterval(() => {
      this.processQueue();
    }, 60 * 1000);
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    sending: number;
    sent: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      sending: this.queue.filter(item => item.status === 'sending').length,
      sent: this.queue.filter(item => item.status === 'sent').length,
      failed: this.queue.filter(item => item.status === 'failed').length,
    };
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(): Promise<void> {
    const failedItems = this.queue.filter(item => item.status === 'failed');
    
    for (const item of failedItems) {
      item.status = 'pending';
      item.attempts = 0;
      item.error_message = undefined;
      item.scheduled_at = new Date().toISOString();
    }

    await this.processQueue();
  }

  /**
   * Clear sent emails from queue (for cleanup)
   */
  clearSentEmails(): void {
    this.queue = this.queue.filter(item => item.status !== 'sent');
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();