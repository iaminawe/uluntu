import { supabase } from '@/lib/supabase';
import { 
  NewsletterAnalytics, 
  CampaignAnalytics, 
  AnalyticsFilters,
  PaginatedAnalytics,
  NewsletterStats
} from '@/types/newsletter';

class NewsletterAnalyticsAPI {
  /**
   * Record analytics event
   */
  async recordEvent(
    campaignId: string,
    subscriptionId: string | undefined,
    eventType: NewsletterAnalytics['event_type'],
    eventData?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_analytics')
        .insert({
          campaign_id: campaignId,
          subscription_id: subscriptionId,
          event_type: eventType,
          event_data: eventData || {},
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording analytics event:', error);
      return false;
    }
  }

  /**
   * Get analytics for a specific campaign
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    try {
      // Get campaign delivery stats
      const { data: campaign, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .select('delivery_stats, recipient_count')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get detailed analytics events
      const { data: analytics, error: analyticsError } = await supabase
        .from('newsletter_analytics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (analyticsError) throw analyticsError;

      const events = analytics || [];
      const stats = campaign?.delivery_stats || { sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0 };
      const totalSent = stats.sent || 0;

      // Calculate engagement timeline (grouped by date)
      const timelineMap = new Map<string, { opens: number; clicks: number }>();
      events.forEach(event => {
        const date = new Date(event.occurred_at).toISOString().split('T')[0];
        const existing = timelineMap.get(date) || { opens: 0, clicks: 0 };
        
        if (event.event_type === 'opened') existing.opens++;
        if (event.event_type === 'clicked') existing.clicks++;
        
        timelineMap.set(date, existing);
      });

      const engagement_timeline = Array.from(timelineMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate top links from click events
      const linkMap = new Map<string, number>();
      events
        .filter(e => e.event_type === 'clicked' && e.event_data?.url)
        .forEach(event => {
          const url = event.event_data.url;
          linkMap.set(url, (linkMap.get(url) || 0) + 1);
        });

      const top_links = Array.from(linkMap.entries())
        .map(([url, clicks]) => ({ url, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Count event types
      const eventCounts = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        campaign_id: campaignId,
        total_sent: totalSent,
        total_delivered: stats.delivered || 0,
        total_bounced: stats.bounced || 0,
        total_opened: stats.opened || 0,
        total_clicked: stats.clicked || 0,
        total_unsubscribed: eventCounts.unsubscribed || 0,
        total_complained: eventCounts.complained || 0,
        open_rate: totalSent > 0 ? ((stats.opened || 0) / totalSent) * 100 : 0,
        click_rate: (stats.opened || 0) > 0 ? ((stats.clicked || 0) / (stats.opened || 1)) * 100 : 0,
        bounce_rate: totalSent > 0 ? ((stats.bounced || 0) / totalSent) * 100 : 0,
        unsubscribe_rate: totalSent > 0 ? ((eventCounts.unsubscribed || 0) / totalSent) * 100 : 0,
        top_links,
        engagement_timeline
      };
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      return null;
    }
  }

  /**
   * Get analytics events with filtering and pagination
   */
  async getAnalyticsEvents(filters: AnalyticsFilters = {}): Promise<PaginatedAnalytics | null> {
    try {
      let query = supabase
        .from('newsletter_analytics')
        .select('*, campaign:newsletter_campaigns(title, subject), subscription:newsletter_subscriptions(email)', { count: 'exact' });

      // Apply filters
      if (filters.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }

      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters.date_range) {
        query = query
          .gte('occurred_at', filters.date_range.start)
          .lte('occurred_at', filters.date_range.end);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by occurred_at desc
      query = query.order('occurred_at', { ascending: false });

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
      console.error('Error getting analytics events:', error);
      return null;
    }
  }

  /**
   * Get overall newsletter statistics
   */
  async getNewsletterStats(): Promise<NewsletterStats | null> {
    try {
      // Get subscription stats
      const { data: subscriptionStats, error: subError } = await supabase
        .from('newsletter_subscriptions')
        .select('status');

      if (subError) throw subError;

      const subscriptions = subscriptionStats || [];
      const total_subscribers = subscriptions.length;
      const active_subscribers = subscriptions.filter(s => s.status === 'active').length;
      const pending_subscribers = subscriptions.filter(s => s.status === 'pending').length;

      // Get campaign stats
      const { data: campaignStats, error: campError } = await supabase
        .from('newsletter_campaigns')
        .select('status, delivery_stats');

      if (campError) throw campError;

      const campaigns = campaignStats || [];
      const total_campaigns = campaigns.length;
      const sent_campaigns = campaigns.filter(c => c.status === 'sent').length;

      // Calculate average rates from sent campaigns
      const sentCampaigns = campaigns.filter(c => c.status === 'sent' && c.delivery_stats);
      let totalOpenRate = 0;
      let totalClickRate = 0;
      let validCampaigns = 0;

      sentCampaigns.forEach(campaign => {
        const stats = campaign.delivery_stats;
        if (stats && stats.sent > 0) {
          totalOpenRate += ((stats.opened || 0) / stats.sent) * 100;
          if (stats.opened > 0) {
            totalClickRate += ((stats.clicked || 0) / stats.opened) * 100;
          }
          validCampaigns++;
        }
      });

      const avg_open_rate = validCampaigns > 0 ? totalOpenRate / validCampaigns : 0;
      const avg_click_rate = validCampaigns > 0 ? totalClickRate / validCampaigns : 0;

      return {
        total_subscribers,
        active_subscribers,
        pending_subscribers,
        total_campaigns,
        sent_campaigns,
        avg_open_rate: Math.round(avg_open_rate * 100) / 100,
        avg_click_rate: Math.round(avg_click_rate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting newsletter stats:', error);
      return null;
    }
  }

  /**
   * Track email open (called via tracking pixel)
   */
  async trackOpen(campaignId: string, subscriptionId: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      // Check if already opened to avoid duplicate opens
      const { data: existing } = await supabase
        .from('newsletter_analytics')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('subscription_id', subscriptionId)
        .eq('event_type', 'opened')
        .single();

      if (existing) {
        return true; // Already tracked
      }

      // Record open event
      await this.recordEvent(campaignId, subscriptionId, 'opened', {}, ipAddress, userAgent);

      // Update campaign delivery stats
      await this.updateCampaignStats(campaignId, 'opened');

      return true;
    } catch (error) {
      console.error('Error tracking open:', error);
      return false;
    }
  }

  /**
   * Track link click
   */
  async trackClick(campaignId: string, subscriptionId: string, url: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      // Record click event
      await this.recordEvent(campaignId, subscriptionId, 'clicked', { url }, ipAddress, userAgent);

      // Update campaign delivery stats
      await this.updateCampaignStats(campaignId, 'clicked');

      return true;
    } catch (error) {
      console.error('Error tracking click:', error);
      return false;
    }
  }

  /**
   * Update campaign delivery statistics
   */
  private async updateCampaignStats(campaignId: string, eventType: 'delivered' | 'bounced' | 'opened' | 'clicked'): Promise<void> {
    try {
      const { data: campaign, error: fetchError } = await supabase
        .from('newsletter_campaigns')
        .select('delivery_stats')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      const stats = campaign?.delivery_stats || { sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0 };
      stats[eventType] = (stats[eventType] || 0) + 1;

      const { error: updateError } = await supabase
        .from('newsletter_campaigns')
        .update({ delivery_stats: stats })
        .eq('id', campaignId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating campaign stats:', error);
    }
  }

  /**
   * Get engagement metrics for dashboard
   */
  async getEngagementMetrics(days: number = 30): Promise<{
    daily_opens: Array<{ date: string; count: number }>;
    daily_clicks: Array<{ date: string; count: number }>;
    top_campaigns: Array<{ title: string; open_rate: number; click_rate: number }>;
  } | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily opens and clicks
      const { data: events, error } = await supabase
        .from('newsletter_analytics')
        .select('event_type, occurred_at, campaign_id')
        .gte('occurred_at', startDate.toISOString())
        .in('event_type', ['opened', 'clicked']);

      if (error) throw error;

      // Group by date
      const dailyMetrics = new Map<string, { opens: number; clicks: number }>();
      events?.forEach(event => {
        const date = new Date(event.occurred_at).toISOString().split('T')[0];
        const metrics = dailyMetrics.get(date) || { opens: 0, clicks: 0 };
        
        if (event.event_type === 'opened') metrics.opens++;
        if (event.event_type === 'clicked') metrics.clicks++;
        
        dailyMetrics.set(date, metrics);
      });

      const daily_opens = Array.from(dailyMetrics.entries())
        .map(([date, metrics]) => ({ date, count: metrics.opens }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const daily_clicks = Array.from(dailyMetrics.entries())
        .map(([date, metrics]) => ({ date, count: metrics.clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get top performing campaigns
      const { data: campaigns, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .select('title, delivery_stats')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (campaignError) throw campaignError;

      const top_campaigns = (campaigns || [])
        .filter(c => c.delivery_stats && c.delivery_stats.sent > 0)
        .map(c => {
          const stats = c.delivery_stats;
          const open_rate = (stats.opened / stats.sent) * 100;
          const click_rate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;
          return {
            title: c.title,
            open_rate: Math.round(open_rate * 100) / 100,
            click_rate: Math.round(click_rate * 100) / 100
          };
        })
        .sort((a, b) => b.open_rate - a.open_rate);

      return {
        daily_opens,
        daily_clicks,
        top_campaigns
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return null;
    }
  }
}

export const newsletterAnalyticsApi = new NewsletterAnalyticsAPI();