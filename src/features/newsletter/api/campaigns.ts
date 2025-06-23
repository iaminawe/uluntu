import { supabase } from '@/lib/supabase';
import { newsletterContentApi } from './content';
import { newsletterSubscriptionApi } from './subscriptions';
import { resendService } from '@/services/resend';
import { 
  NewsletterCampaign, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CampaignFilters,
  PaginatedCampaigns,
  CampaignAnalytics,
  EmailPreview,
  SendResult,
  TemplateData,
  SendTestEmailRequest
} from '@/types/newsletter';

class NewsletterCampaignAPI {
  /**
   * Create a new newsletter campaign
   */
  async createCampaign(request: CreateCampaignRequest): Promise<NewsletterCampaign | null> {
    try {
      // Generate content if not provided
      let content = request.content;
      if (!content || Object.keys(content).length === 0) {
        content = await newsletterContentApi.generateCuratedContent();
        if (!content) {
          throw new Error('Failed to generate newsletter content');
        }
      }

      const campaignData = {
        title: request.title,
        subject: request.subject,
        template_id: request.template_id,
        custom_message: request.custom_message,
        branding: {
          primary_color: '#3B82F6',
          secondary_color: '#64748B',
          logo_url: '',
          header_image: '',
          footer_text: 'Kootenay Tech Community',
          social_links: [],
          ...request.branding
        },
        content,
        scheduled_at: request.scheduled_at,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  /**
   * Get campaigns with filtering and pagination
   */
  async getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedCampaigns | null> {
    try {
      let query = supabase
        .from('newsletter_campaigns')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      }

      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      if (filters.template_id) {
        query = query.eq('template_id', filters.template_id);
      }

      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        page_size: limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return null;
    }
  }

  /**
   * Get single campaign by ID
   */
  async getCampaign(id: string): Promise<NewsletterCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return null;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: string, updates: UpdateCampaignRequest): Promise<NewsletterCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  /**
   * Generate fresh content for campaign
   */
  async regenerateContent(id: string): Promise<NewsletterCampaign | null> {
    try {
      const content = await newsletterContentApi.generateCuratedContent({ force_refresh: true });
      if (!content) return null;

      return await this.updateCampaign(id, { content });
    } catch (error) {
      console.error('Error regenerating content:', error);
      return null;
    }
  }

  /**
   * Preview campaign email
   */
  async previewCampaign(id: string): Promise<EmailPreview | null> {
    try {
      const campaign = await this.getCampaign(id);
      if (!campaign) return null;

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('newsletter_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();

      if (templateError) throw templateError;

      // Create template data
      const templateData: TemplateData = {
        branding: campaign.branding,
        content: campaign.content,
        custom_message: campaign.custom_message,
        unsubscribe_url: '{{unsubscribe_url}}',
        web_view_url: '{{web_view_url}}',
        subscriber: {
          email: 'preview@example.com',
          name: 'Preview User',
          preferences: {
            frequency: 'weekly',
            content_types: ['events', 'news', 'opportunities'],
            format: 'digest',
            location_filter: true,
            language: 'en'
          }
        }
      };

      // Render template based on type
      let html: string;
      if (template.type === 'mjml') {
        html = await this.renderMJMLTemplate(template.template_content, templateData);
      } else {
        html = await this.renderReactTemplate(template.template_content, templateData);
      }

      return {
        html,
        text: this.htmlToText(html),
        subject: campaign.subject,
        preview_url: `/admin/newsletter/campaigns/${id}/preview`
      };
    } catch (error) {
      console.error('Error previewing campaign:', error);
      return null;
    }
  }

  /**
   * Send test emails
   */
  async sendTestEmail(request: SendTestEmailRequest): Promise<boolean> {
    try {
      const campaign = await this.getCampaign(request.campaign_id);
      if (!campaign) return false;

      // Use Resend service to send test email
      return await resendService.sendTestEmail(campaign, request.test_emails);
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  /**
   * Schedule campaign for future sending
   */
  async scheduleCampaign(id: string, scheduledAt: Date): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      return false;
    }
  }

  /**
   * Send campaign immediately
   */
  async sendCampaign(id: string): Promise<SendResult> {
    try {
      const campaign = await this.getCampaign(id);
      if (!campaign) {
        return { success: false, error: 'Campaign not found', sent_count: 0, failed_count: 0, failed_emails: [] };
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        return { success: false, error: 'Campaign already sent', sent_count: 0, failed_count: 0, failed_emails: [] };
      }

      // Update status to sending
      await this.updateCampaign(id, { status: 'sending' });

      // Get active subscribers
      const subscribers = await newsletterSubscriptionApi.getActiveSubscribers();
      
      if (subscribers.length === 0) {
        await this.updateCampaign(id, { status: 'draft' });
        return { success: false, error: 'No active subscribers', sent_count: 0, failed_count: 0, failed_emails: [] };
      }

      // Use Resend service to send the campaign
      const sendResult = await resendService.sendNewsletterCampaign(campaign, subscribers);
      
      if (!sendResult.success) {
        await this.updateCampaign(id, { status: 'draft' });
        return sendResult;
      }

      // Update campaign status and stats
      await this.updateCampaign(id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: sendResult.sent_count,
        delivery_stats: {
          sent: sendResult.sent_count,
          delivered: 0, // Will be updated via webhooks
          bounced: 0,
          opened: 0,
          clicked: 0
        }
      });

      // Update subscriber last_sent_at for successfully sent emails
      const successfulSubscribers = subscribers.filter(s => 
        !sendResult.failed_emails?.includes(s.email)
      );
      if (successfulSubscribers.length > 0) {
        await newsletterSubscriptionApi.updateLastSent(successfulSubscribers.map(s => s.id));
      }

      // Record analytics for each sent email
      for (const subscriber of successfulSubscribers) {
        await this.recordAnalytics(id, subscriber.id, 'sent');
      }

      console.log(`Campaign ${id} sent to ${sendResult.sent_count} subscribers`);

      return sendResult;
    } catch (error) {
      console.error('Error sending campaign:', error);
      
      // Reset campaign status on error
      await this.updateCampaign(id, { status: 'draft' });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        sent_count: 0, 
        failed_count: 0, 
        failed_emails: [] 
      };
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(id: string): Promise<CampaignAnalytics | null> {
    try {
      const campaign = await this.getCampaign(id);
      if (!campaign) return null;

      // Get analytics data
      const { data: analytics, error } = await supabase
        .from('newsletter_analytics')
        .select('*')
        .eq('campaign_id', id);

      if (error) throw error;

      const stats = campaign.delivery_stats;
      const totalSent = stats.sent || 0;

      const result: CampaignAnalytics = {
        campaign_id: id,
        total_sent: stats.sent || 0,
        total_delivered: stats.delivered || 0,
        total_bounced: stats.bounced || 0,
        total_opened: stats.opened || 0,
        total_clicked: stats.clicked || 0,
        total_unsubscribed: analytics?.filter(a => a.event_type === 'unsubscribed').length || 0,
        total_complained: analytics?.filter(a => a.event_type === 'complained').length || 0,
        open_rate: totalSent > 0 ? ((stats.opened || 0) / totalSent) * 100 : 0,
        click_rate: (stats.opened || 0) > 0 ? ((stats.clicked || 0) / (stats.opened || 1)) * 100 : 0,
        bounce_rate: totalSent > 0 ? ((stats.bounced || 0) / totalSent) * 100 : 0,
        unsubscribe_rate: totalSent > 0 ? ((analytics?.filter(a => a.event_type === 'unsubscribed').length || 0) / totalSent) * 100 : 0,
        top_links: [], // TODO: Implement link tracking
        engagement_timeline: [] // TODO: Implement timeline tracking
      };

      return result;
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      return null;
    }
  }

  /**
   * Duplicate campaign
   */
  async duplicateCampaign(id: string): Promise<NewsletterCampaign | null> {
    try {
      const original = await this.getCampaign(id);
      if (!original) return null;

      const duplicateData = {
        title: `${original.title} (Copy)`,
        subject: original.subject,
        template_id: original.template_id,
        template_data: original.template_data,
        content: original.content,
        custom_message: original.custom_message,
        branding: original.branding,
        status: 'draft' as const,
        send_type: original.send_type,
        created_by: original.created_by
      };

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      return null;
    }
  }

  // Private helper methods

  private async renderMJMLTemplate(templateContent: string, data: TemplateData): Promise<string> {
    // TODO: Implement MJML rendering
    // This would use the mjml library to compile MJML to HTML
    // For now, return a placeholder
    return `
      <html>
        <body>
          <h1>${data.branding.footer_text} Newsletter</h1>
          <p>${data.custom_message || 'Welcome to our newsletter!'}</p>
          
          ${data.content.events.length > 0 ? `
            <h2>Upcoming Events</h2>
            ${data.content.events.map(event => `
              <div>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                <p>Location: ${event.location}</p>
              </div>
            `).join('')}
          ` : ''}
          
          ${data.content.news.length > 0 ? `
            <h2>Latest News</h2>
            ${data.content.news.map(article => `
              <div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <a href="${article.read_more_url}">Read More</a>
              </div>
            `).join('')}
          ` : ''}
          
          <p><a href="${data.unsubscribe_url}">Unsubscribe</a> | <a href="${data.web_view_url}">View in browser</a></p>
        </body>
      </html>
    `;
  }

  private async renderReactTemplate(templateContent: string, data: TemplateData): Promise<string> {
    // TODO: Implement React Email rendering
    // This would use react-email to render React components to HTML
    return this.renderMJMLTemplate(templateContent, data);
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async recordAnalytics(
    campaignId: string, 
    subscriptionId: string, 
    eventType: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'complained',
    eventData?: Record<string, unknown>
  ): Promise<void> {
    try {
      await supabase
        .from('newsletter_analytics')
        .insert({
          campaign_id: campaignId,
          subscription_id: subscriptionId,
          event_type: eventType,
          event_data: eventData
        });
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }
}

export const newsletterCampaignApi = new NewsletterCampaignAPI();