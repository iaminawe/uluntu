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
  SendTestEmailRequest,
  ABTest,
  ABTestResults,
  CreateABTestRequest
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
        content = await newsletterContentApi.generateCuratedContent() || undefined;
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
        .insert(campaignData as any)
        .select()
        .single();

      if (error) throw error;
      return { ...data, template_id: data.template_id || '' } as any;
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
        data: (data || []).map(d => ({ ...d, template_id: d.template_id || '' })) as any,
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
      return { ...data, template_id: data.template_id || '' } as any;
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
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, template_id: data.template_id || '' } as any;
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
   * Create A/B test for campaigns
   */
  async createABTest(request: CreateABTestRequest): Promise<ABTest | null> {
    try {
      const testData = {
        name: request.name,
        description: request.description,
        campaign_a_id: request.campaign_a_id,
        campaign_b_id: request.campaign_b_id,
        test_percentage: request.test_percentage,
        winner_metric: request.winner_metric,
        status: 'draft' as const,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_ab_tests')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;
      return data as ABTest;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      return null;
    }
  }

  /**
   * Start A/B test
   */
  async startABTest(testId: string): Promise<boolean> {
    try {
      const { data: test, error: testError } = await supabase
        .from('newsletter_ab_tests')
        .select('*, campaign_a:newsletter_campaigns!campaign_a_id(*), campaign_b:newsletter_campaigns!campaign_b_id(*)')
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      // Get active subscribers for the test
      const subscribers = await newsletterSubscriptionApi.getActiveSubscribers();
      const testSize = Math.floor(subscribers.length * (test.test_percentage / 100));
      
      // Randomly split subscribers
      const shuffled = subscribers.sort(() => 0.5 - Math.random());
      const groupA = shuffled.slice(0, Math.floor(testSize / 2));
      const groupB = shuffled.slice(Math.floor(testSize / 2), testSize);

      // Send to group A
      await this.sendCampaignToSegment(test.campaign_a_id, groupA.map(s => s.id));
      
      // Send to group B
      await this.sendCampaignToSegment(test.campaign_b_id, groupB.map(s => s.id));

      // Update test status
      const { error: updateError } = await supabase
        .from('newsletter_ab_tests')
        .update({
          status: 'running',
          start_date: new Date().toISOString()
        })
        .eq('id', testId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error starting A/B test:', error);
      return false;
    }
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testId: string): Promise<ABTestResults | null> {
    try {
      const { data: test, error } = await supabase
        .from('newsletter_ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;

      // Get analytics for both campaigns
      const [campaignAAnalytics, campaignBAnalytics] = await Promise.all([
        this.getCampaignAnalytics(test.campaign_a_id),
        this.getCampaignAnalytics(test.campaign_b_id)
      ]);

      if (!campaignAAnalytics || !campaignBAnalytics) return null;

      const campaign_a_stats = {
        sent: campaignAAnalytics.total_sent,
        opened: campaignAAnalytics.total_opened,
        clicked: campaignAAnalytics.total_clicked,
        conversions: 0, // TODO: Implement conversion tracking
        open_rate: campaignAAnalytics.open_rate,
        click_rate: campaignAAnalytics.click_rate,
        conversion_rate: 0
      };

      const campaign_b_stats = {
        sent: campaignBAnalytics.total_sent,
        opened: campaignBAnalytics.total_opened,
        clicked: campaignBAnalytics.total_clicked,
        conversions: 0,
        open_rate: campaignBAnalytics.open_rate,
        click_rate: campaignBAnalytics.click_rate,
        conversion_rate: 0
      };

      // Determine winner based on metric
      let winner: 'a' | 'b' | 'tie' | null = null;
      const metric = test.winner_metric;
      
      if (metric === 'open_rate') {
        if (campaign_a_stats.open_rate > campaign_b_stats.open_rate) winner = 'a';
        else if (campaign_b_stats.open_rate > campaign_a_stats.open_rate) winner = 'b';
        else winner = 'tie';
      } else if (metric === 'click_rate') {
        if (campaign_a_stats.click_rate > campaign_b_stats.click_rate) winner = 'a';
        else if (campaign_b_stats.click_rate > campaign_a_stats.click_rate) winner = 'b';
        else winner = 'tie';
      }

      // Calculate confidence level (simplified)
      const confidence_level = this.calculateConfidenceLevel(campaign_a_stats, campaign_b_stats, metric);

      return {
        campaign_a_stats,
        campaign_b_stats,
        winner,
        confidence_level
      };
    } catch (error) {
      console.error('Error getting A/B test results:', error);
      return null;
    }
  }

  /**
   * Send campaign to specific segment/subscribers
   */
  async sendCampaignToSegment(campaignId: string, subscriberIds: string[]): Promise<SendResult> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found', sent_count: 0, failed_count: 0, failed_emails: [] };
      }

      // Get subscribers
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .in('id', subscriberIds)
        .eq('status', 'active');

      if (error) throw error;

      const mappedSubscribers = (subscribers || []).map(sub => this.mapSubscription(sub));

      // Use Resend service to send
      const sendResult = await resendService.sendNewsletterCampaign(campaign, mappedSubscribers);

      // Record analytics
      for (const subscriber of mappedSubscribers) {
        await this.recordAnalytics(campaignId, subscriber.id, 'sent');
      }

      return sendResult;
    } catch (error) {
      console.error('Error sending campaign to segment:', error);
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
        recipient_count: sendResult.sent_count,
        delivery_stats: {
          sent: sendResult.sent_count,
          delivered: 0, // Will be updated via webhooks
          bounced: 0,
          opened: 0,
          clicked: 0
        }
      } as UpdateCampaignRequest);
      
      // Update sent_at separately since it's not in UpdateCampaignRequest
      await supabase
        .from('newsletter_campaigns')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', id);

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
        .insert(duplicateData as any)
        .select()
        .single();

      if (error) throw error;
      return { ...data, template_id: data.template_id || '' } as any;
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      return null;
    }
  }

  // Private helper methods

  private mapSubscription(data: any): any {
    return {
      id: data.id,
      email: data.email,
      member_id: data.member_id || undefined,
      status: data.status || 'pending',
      preferences: data.preferences || {
        frequency: 'weekly',
        content_types: ['events', 'news', 'opportunities'],
        format: 'digest',
        location_filter: true,
        language: 'en'
      },
      subscription_token: data.subscription_token,
      confirmation_token: data.confirmation_token || undefined,
      confirmed_at: data.confirmed_at || undefined,
      subscribed_at: data.subscribed_at || new Date().toISOString(),
      unsubscribed_at: data.unsubscribed_at || undefined,
      last_sent_at: data.last_sent_at || undefined,
      bounce_count: data.bounce_count || 0,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  private calculateConfidenceLevel(
    statsA: { sent: number; opened: number; clicked: number; open_rate: number; click_rate: number },
    statsB: { sent: number; opened: number; clicked: number; open_rate: number; click_rate: number },
    metric: 'open_rate' | 'click_rate' | 'conversion_rate'
  ): number {
    // Simplified statistical significance calculation
    // In production, you'd want to use proper statistical tests like z-test or t-test
    const sampleSizeA = statsA.sent;
    const sampleSizeB = statsB.sent;
    
    if (sampleSizeA < 30 || sampleSizeB < 30) {
      return 0; // Not enough data for statistical significance
    }

    // Statistical confidence calculation based on sample sizes and effect size
    const totalSample = sampleSizeA + sampleSizeB;
    const minSample = Math.min(sampleSizeA, sampleSizeB);
    
    // Calculate effect size difference between A and B variants
    const openRateA = sampleSizeA > 0 ? statsA.opened / sampleSizeA : 0;
    const openRateB = sampleSizeB > 0 ? statsB.opened / sampleSizeB : 0;
    const effectSize = Math.abs(openRateA - openRateB);
    
    // Confidence based on sample size and effect size
    if (totalSample >= 1000 && minSample >= 100 && effectSize > 0.02) return 95;
    if (totalSample >= 500 && minSample >= 50 && effectSize > 0.03) return 90;
    if (totalSample >= 200 && minSample >= 30 && effectSize > 0.05) return 80;
    if (effectSize > 0.10) return 70;
    return 60;
  }

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
          event_data: eventData as any
        });
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }
}

export const newsletterCampaignApi = new NewsletterCampaignAPI();