import { supabase } from '@/lib/supabase';

export interface AnalyticsEvent {
  id: string;
  campaign_id: string;
  subscription_id?: string;
  event_type: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'complained';
  event_data?: any;
  postmark_message_id?: string;
  occurred_at: string; // Changed from created_at to match schema
  ip_address?: string;
  user_agent?: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  complained_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

class NewsletterAnalyticsApi {
  /**
   * Record an analytics event
   */
  async recordEvent(
    campaignId: string,
    subscriptionId: string | undefined,
    eventType: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'complained',
    eventData?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('newsletter_analytics')
        .insert({
          campaign_id: campaignId,
          subscription_id: subscriptionId,
          event_type: eventType,
          event_data: eventData,
          occurred_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording analytics event:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    try {
      // Use typed RPC call
      const { data, error } = await (supabase.rpc as any)('get_campaign_analytics', { p_campaign_id: campaignId });

      if (error) throw error;

      // Ensure we return a properly typed object
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return {
          campaign_id: (data as any).campaign_id || campaignId,
          sent_count: (data as any).sent_count || 0,
          delivered_count: (data as any).delivered_count || 0,
          opened_count: (data as any).opened_count || 0,
          clicked_count: (data as any).clicked_count || 0,
          bounced_count: (data as any).bounced_count || 0,
          unsubscribed_count: (data as any).unsubscribed_count || 0,
          complained_count: (data as any).complained_count || 0,
          open_rate: (data as any).open_rate || 0,
          click_rate: (data as any).click_rate || 0,
          bounce_rate: (data as any).bounce_rate || 0
        };
      }

      return {
        campaign_id: campaignId,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        complained_count: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0
      };
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for multiple campaigns
   */
  async getCampaignsAnalytics(campaignIds: string[]): Promise<CampaignAnalytics[]> {
    try {
      const analytics = await Promise.all(
        campaignIds.map(id => this.getCampaignAnalytics(id))
      );
      return analytics;
    } catch (error) {
      console.error('Error fetching campaigns analytics:', error);
      throw error;
    }
  }

  /**
   * Get subscriber engagement analytics
   */
  async getSubscriberEngagement(subscriptionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('newsletter_analytics')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('occurred_at', { ascending: false });

      if (error) throw error;

      return {
        subscription_id: subscriptionId,
        events: data || [],
        total_opens: data?.filter(e => e.event_type === 'opened').length || 0,
        total_clicks: data?.filter(e => e.event_type === 'clicked').length || 0,
        last_engagement: data?.[0]?.occurred_at || null
      };
    } catch (error) {
      console.error('Error fetching subscriber engagement:', error);
      throw error;
    }
  }

  /**
   * Get analytics summary for a date range
   */
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('newsletter_analytics')
        .select('event_type')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate);

      if (error) throw error;

      const summary = {
        total_events: data?.length || 0,
        sent: data?.filter(e => e.event_type === 'sent').length || 0,
        delivered: data?.filter(e => e.event_type === 'delivered').length || 0,
        opened: data?.filter(e => e.event_type === 'opened').length || 0,
        clicked: data?.filter(e => e.event_type === 'clicked').length || 0,
        bounced: data?.filter(e => e.event_type === 'bounced').length || 0,
        unsubscribed: data?.filter(e => e.event_type === 'unsubscribed').length || 0,
        complained: data?.filter(e => e.event_type === 'complained').length || 0
      };

      return summary;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }
}

export const newsletterAnalyticsApi = new NewsletterAnalyticsApi();