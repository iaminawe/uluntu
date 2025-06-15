import { Resend } from 'resend';
import { 
  NewsletterCampaign, 
  NewsletterSubscription,
  EmailPreview,
  SendResult,
  TemplateData,
  ResendWebhook
} from '@/types/newsletter';

class ResendService {
  private client: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key not found. Email functionality will be disabled.');
      // Use a placeholder key to prevent errors
      this.client = new Resend('re_placeholder_key');
      this.fromEmail = 'noreply@example.com';
      this.fromName = 'Nelson Tech Community';
      return;
    }

    this.client = new Resend(apiKey);
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'newsletter@kootenaytech.community';
    this.fromName = import.meta.env.VITE_FROM_NAME || 'Kootenay Tech Community';
  }

  /**
   * Send newsletter campaign to multiple recipients
   */
  async sendNewsletterCampaign(
    campaign: NewsletterCampaign, 
    subscribers: NewsletterSubscription[]
  ): Promise<SendResult> {
    try {
      if (subscribers.length === 0) {
        return {
          success: false,
          error: 'No subscribers to send to',
          sent_count: 0,
          failed_count: 0,
          failed_emails: []
        };
      }

      // Generate email content
      const emailContent = await this.generateEmailContent(campaign);
      if (!emailContent) {
        return {
          success: false,
          error: 'Failed to generate email content',
          sent_count: 0,
          failed_count: 0,
          failed_emails: []
        };
      }

      // Prepare batch email data
      const batchEmails = subscribers.map(subscriber => ({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [subscriber.email],
        subject: campaign.subject,
        html: this.personalizeEmail(emailContent.html, subscriber, campaign),
        text: emailContent.text,
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Subscriber-ID': subscriber.id,
          'List-Unsubscribe': `<${this.getUnsubscribeUrl(subscriber.subscription_token)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        tags: [
          { name: 'campaign', value: campaign.id },
          { name: 'type', value: 'newsletter' },
          { name: 'template', value: campaign.template_id }
        ]
      }));

      // Send emails in batches to respect rate limits
      const batchSize = 100; // Resend allows up to 100 emails per batch
      const results = [];
      const failedEmails: string[] = [];

      for (let i = 0; i < batchEmails.length; i += batchSize) {
        const batch = batchEmails.slice(i, i + batchSize);
        
        try {
          const batchResult = await this.client.batch.send(batch);
          results.push(...(Array.isArray(batchResult.data) ? batchResult.data : [batchResult.data]));
        } catch (error) {
          console.error('Batch send error:', error);
          // Add all emails in this batch to failed list
          failedEmails.push(...batch.map(email => email.to[0]));
        }

        // Add delay between batches to respect rate limits
        if (i + batchSize < batchEmails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      const sentCount = results.length;
      const failedCount = failedEmails.length;

      return {
        success: sentCount > 0,
        sent_count: sentCount,
        failed_count: failedCount,
        failed_emails: failedEmails,
        message_ids: results.map(r => r.id).filter(Boolean)
      };

    } catch (error) {
      console.error('Error sending newsletter campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        sent_count: 0,
        failed_count: subscribers.length,
        failed_emails: subscribers.map(s => s.email)
      };
    }
  }

  /**
   * Send test email to specific recipients
   */
  async sendTestEmail(campaign: NewsletterCampaign, testEmails: string[]): Promise<boolean> {
    try {
      const emailContent = await this.generateEmailContent(campaign);
      if (!emailContent) return false;

      // Create test subscriber for personalization
      const testSubscriber: NewsletterSubscription = {
        id: 'test',
        email: testEmails[0],
        status: 'active',
        preferences: {
          frequency: 'weekly',
          content_types: ['events', 'news', 'opportunities', 'marketplace'],
          format: 'digest',
          location_filter: true,
          language: 'en'
        },
        subscription_token: 'test-token',
        subscribed_at: new Date().toISOString(),
        bounce_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const testEmails_data = testEmails.map(email => ({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [email],
        subject: `[TEST] ${campaign.subject}`,
        html: this.personalizeEmail(emailContent.html, { ...testSubscriber, email }, campaign),
        text: emailContent.text,
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Test-Email': 'true'
        },
        tags: [
          { name: 'campaign', value: campaign.id },
          { name: 'type', value: 'test' }
        ]
      }));

      const result = await this.client.batch.send(testEmails_data);
      return Array.isArray(result.data) ? result.data.length > 0 : !!result.data;

    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  /**
   * Send confirmation email for new subscriptions
   */
  async sendConfirmationEmail(subscription: NewsletterSubscription): Promise<boolean> {
    try {
      const confirmationUrl = this.getConfirmationUrl(subscription.confirmation_token!);
      
      const { data, error } = await this.client.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [subscription.email],
        subject: 'Confirm your newsletter subscription',
        html: this.generateConfirmationEmail(confirmationUrl, subscription.email),
        text: `Please confirm your newsletter subscription by clicking this link: ${confirmationUrl}`,
        headers: {
          'X-Subscription-ID': subscription.id
        },
        tags: [
          { name: 'type', value: 'confirmation' }
        ]
      });

      return !error && !!data;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }

  /**
   * Process Resend webhooks for delivery tracking
   */
  async processWebhook(webhook: ResendWebhook): Promise<void> {
    try {
      const { type, data } = webhook;
      
      // Extract campaign and subscription IDs from headers
      const campaignId = data.headers?.['X-Campaign-ID'];
      const subscriptionId = data.headers?.['X-Subscriber-ID'];

      if (!campaignId) return;

      // Map Resend event types to our analytics event types
      const eventTypeMap: Record<string, string> = {
        'email.sent': 'sent',
        'email.delivered': 'delivered',
        'email.bounced': 'bounced',
        'email.opened': 'opened',
        'email.clicked': 'clicked',
        'email.complained': 'complained'
      };

      const eventType = eventTypeMap[type];
      if (!eventType) return;

      // Store analytics data
      await this.recordAnalytics(campaignId, subscriptionId, eventType as any, {
        resend_message_id: data.email_id,
        timestamp: data.created_at,
        event_data: data
      });

      // Handle bounces
      if (eventType === 'bounced' && data.bounce_type) {
        await this.handleBounce(data.email, data.bounce_type);
      }

    } catch (error) {
      console.error('Error processing Resend webhook:', error);
    }
  }

  /**
   * Validate email template
   */
  async validateTemplate(htmlContent: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      // Basic HTML validation
      const errors: string[] = [];
      
      // Check for required elements
      if (!htmlContent.includes('{{unsubscribe_url}}')) {
        errors.push('Template must include {{unsubscribe_url}} placeholder');
      }
      
      if (!htmlContent.includes('<html')) {
        errors.push('Template must be valid HTML');
      }

      // Check for common email issues
      if (htmlContent.includes('javascript:')) {
        errors.push('JavaScript is not allowed in email templates');
      }

      if (htmlContent.includes('<form')) {
        errors.push('Forms are not supported in email templates');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Failed to validate template']
      };
    }
  }

  // Private helper methods

  private async generateEmailContent(campaign: NewsletterCampaign): Promise<EmailPreview | null> {
    try {
      // This would normally render the MJML template with campaign data
      // For now, using a simplified HTML template
      const templateData: TemplateData = {
        branding: campaign.branding,
        content: campaign.content,
        custom_message: campaign.custom_message,
        unsubscribe_url: '{{unsubscribe_url}}',
        web_view_url: '{{web_view_url}}',
        subscriber: {
          email: '{{subscriber_email}}',
          name: '{{subscriber_name}}',
          preferences: {
            frequency: 'weekly',
            content_types: ['events', 'news', 'opportunities'],
            format: 'digest',
            location_filter: true,
            language: 'en'
          }
        }
      };

      const html = this.renderNewsletterTemplate(templateData);
      const text = this.htmlToText(html);

      return { html, text, subject: campaign.subject };
    } catch (error) {
      console.error('Error generating email content:', error);
      return null;
    }
  }

  private personalizeEmail(
    html: string, 
    subscriber: NewsletterSubscription, 
    campaign: NewsletterCampaign
  ): string {
    const unsubscribeUrl = this.getUnsubscribeUrl(subscriber.subscription_token);
    const webViewUrl = this.getWebViewUrl(campaign.id);
    const preferencesUrl = this.getPreferencesUrl(subscriber.subscription_token);

    return html
      .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
      .replace(/\{\{web_view_url\}\}/g, webViewUrl)
      .replace(/\{\{preferences_url\}\}/g, preferencesUrl)
      .replace(/\{\{subscriber_email\}\}/g, subscriber.email)
      .replace(/\{\{subscriber_name\}\}/g, subscriber.email.split('@')[0]); // Simple name fallback
  }

  private renderNewsletterTemplate(data: TemplateData): string {
    // This is a simplified template - in production you'd use MJML or a proper template engine
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.branding.footer_text} Newsletter</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${data.branding.primary_color}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 30px; }
        .event { border-left: 4px solid ${data.branding.primary_color}; padding-left: 15px; margin-bottom: 20px; }
        .news { margin-bottom: 20px; }
        .button { display: inline-block; background-color: ${data.branding.primary_color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.branding.footer_text}</h1>
          <p>Community Newsletter</p>
        </div>
        
        <div class="content">
          ${data.custom_message ? `
            <div class="section">
              <h2>Message from the Community</h2>
              <p>${data.custom_message}</p>
            </div>
          ` : ''}
          
          ${data.content.events.length > 0 ? `
            <div class="section">
              <h2>🗓️ Upcoming Events</h2>
              ${data.content.events.map(event => `
                <div class="event">
                  <h3>${event.title}</h3>
                  <p><strong>📍 ${event.location}</strong> • ${new Date(event.date).toLocaleDateString()}</p>
                  <p>${event.description}</p>
                  ${event.registration_url ? `<a href="${event.registration_url}" class="button">Register Now</a>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.content.news.length > 0 ? `
            <div class="section">
              <h2>📰 Latest News</h2>
              ${data.content.news.map(article => `
                <div class="news">
                  <h3>${article.title}</h3>
                  <p><small>By ${article.author} • ${new Date(article.published_at).toLocaleDateString()}</small></p>
                  <p>${article.excerpt}</p>
                  <a href="${article.read_more_url}">Read more →</a>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.content.opportunities.length > 0 ? `
            <div class="section">
              <h2>💼 New Opportunities</h2>
              ${data.content.opportunities.map(opp => `
                <div class="news">
                  <h3>${opp.title}</h3>
                  <p><strong>${opp.company}</strong> ${opp.location ? `• ${opp.location}` : ''} ${opp.remote ? '• Remote' : ''}</p>
                  <p>${opp.description}</p>
                  <a href="${opp.application_url}" class="button">Apply Now</a>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>${data.branding.footer_text}</p>
          <p>
            <a href="{{unsubscribe_url}}">Unsubscribe</a> • 
            <a href="{{web_view_url}}">View in browser</a> • 
            <a href="{{preferences_url}}">Update preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateConfirmationEmail(confirmationUrl: string, _email: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Subscription</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Confirm Your Newsletter Subscription</h1>
        <p>Hi there!</p>
        <p>Thanks for subscribing to the Kootenay Tech Community newsletter. To complete your subscription, please click the button below:</p>
        <div style="text-align: center;">
          <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
        </div>
        <p>If you didn't request this subscription, you can safely ignore this email.</p>
        <div class="footer">
          <p>Kootenay Tech Community<br>
          Building connections in the Kootenay tech ecosystem</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getUnsubscribeUrl(token: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/unsubscribe?token=${token}`;
  }

  private getConfirmationUrl(token: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/confirm?token=${token}`;
  }

  private getWebViewUrl(campaignId: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/view/${campaignId}`;
  }

  private getPreferencesUrl(token: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/newsletter/preferences?token=${token}`;
  }

  private async recordAnalytics(
    campaignId: string,
    subscriptionId: string | undefined,
    eventType: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'complained',
    eventData?: any
  ): Promise<void> {
    try {
      // Use the analytics API to record events
      const { newsletterAnalyticsApi } = await import('@/api/newsletter/analytics');
      await newsletterAnalyticsApi.recordEvent(
        campaignId,
        subscriptionId,
        eventType,
        eventData
      );
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }

  private async handleBounce(email: string, bounceType: 'hard' | 'soft'): Promise<void> {
    try {
      // Use the subscription API to handle bounces
      const { newsletterSubscriptionApi } = await import('@/api/newsletter/subscriptions');
      await newsletterSubscriptionApi.recordBounce(email, bounceType);
    } catch (error) {
      console.error('Error handling bounce:', error);
    }
  }
}

export const resendService = new ResendService();