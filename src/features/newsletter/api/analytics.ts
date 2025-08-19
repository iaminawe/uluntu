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
          event_data: (eventData || {}) as any,
          occurred_at: new Date().toISOString(),
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
      const defaultStats = { sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0 };
      const rawStats = campaign?.delivery_stats || defaultStats;
      const stats = rawStats as any;
      const totalSent = stats.sent || 0;

      // Calculate engagement timeline (grouped by date)
      const timelineMap = new Map<string, { opens: number; clicks: number }>();
      events.forEach(event => {
        if (!event.occurred_at) return;
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
        .filter(e => e.event_type === 'clicked' && e.event_data && typeof e.event_data === 'object' && 'url' in e.event_data)
        .forEach(event => {
          if (!event.event_data || typeof event.event_data !== 'object') return;
          const url = (event.event_data as any).url;
          linkMap.set(url, (linkMap.get(url) || 0) + 1);
        });

      const top_links = Array.from(linkMap.entries())
        .map(([url, clicks]) => ({ url, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Count event types
      const eventCounts = events.reduce((acc, event) => {
        if (event.event_type) {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        }
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
        data: (data || []).map(item => ({
          ...item,
          event_type: item.event_type as NewsletterAnalytics['event_type'],
          event_data: item.event_data as Record<string, unknown> | null | undefined
        })) as NewsletterAnalytics[],
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
        const stats = campaign.delivery_stats as any;
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

      const rawStats = campaign?.delivery_stats || { sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0 };
      const stats = rawStats as any;
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
   * Calculate engagement score for a subscriber
   */
  async calculateEngagementScore(subscriptionId: string): Promise<EngagementScore | null> {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('newsletter_subscriptions')
        .select('subscribed_at')
        .eq('id', subscriptionId)
        .single();

      if (subError) throw subError;

      // Get analytics events for this subscriber
      const { data: analytics, error: analyticsError } = await supabase
        .from('newsletter_analytics')
        .select('event_type, occurred_at')
        .eq('subscription_id', subscriptionId);

      if (analyticsError) throw analyticsError;

      const events = analytics || [];
      const sentEvents = events.filter(e => e.event_type === 'sent');
      const openEvents = events.filter(e => e.event_type === 'opened');
      const clickEvents = events.filter(e => e.event_type === 'clicked');

      // Calculate factors
      const open_rate = sentEvents.length > 0 ? (openEvents.length / sentEvents.length) * 100 : 0;
      const click_rate = openEvents.length > 0 ? (clickEvents.length / openEvents.length) * 100 : 0;

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentEvents = events.filter(e => 
        e.occurred_at && new Date(e.occurred_at) > thirtyDaysAgo
      );
      const recent_activity = recentEvents.length;

      // Subscription longevity (months)
      const subscriptionDate = new Date(subscription.subscribed_at);
      const now = new Date();
      const subscription_longevity = Math.max(1, 
        (now.getTime() - subscriptionDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Content engagement (variety of interactions)
      const uniqueEventTypes = new Set(events.map(e => e.event_type)).size;
      const content_engagement = uniqueEventTypes * 10; // Scale factor

      // Calculate overall score (0-100)
      const score = Math.min(100, Math.max(0,
        (open_rate * 0.3) + 
        (click_rate * 0.3) + 
        (Math.min(recent_activity, 10) * 2) + 
        (Math.min(subscription_longevity, 12) * 1.5) + 
        (content_engagement * 0.5)
      ));

      return {
        subscriber_id: subscriptionId,
        score: Math.round(score * 100) / 100,
        factors: {
          open_rate: Math.round(open_rate * 100) / 100,
          click_rate: Math.round(click_rate * 100) / 100,
          recent_activity,
          subscription_longevity: Math.round(subscription_longevity * 100) / 100,
          content_engagement
        },
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return null;
    }
  }

  /**
   * Get cohort analysis for subscriber retention
   */
  async getCohortAnalysis(cohortPeriod: 'month' | 'quarter' = 'month'): Promise<CohortAnalysis[]> {
    try {
      const cohorts: CohortAnalysis[] = [];
      const periodMonths = cohortPeriod === 'quarter' ? 3 : 1;
      
      // Get cohorts for the last 12 periods
      for (let i = 11; i >= 0; i--) {
        const cohortStart = new Date();
        cohortStart.setMonth(cohortStart.getMonth() - (i * periodMonths));
        cohortStart.setDate(1);
        
        const cohortEnd = new Date(cohortStart);
        cohortEnd.setMonth(cohortEnd.getMonth() + periodMonths);
        cohortEnd.setDate(0);

        const cohortPeriodLabel = `${cohortStart.getFullYear()}-${String(cohortStart.getMonth() + 1).padStart(2, '0')}`;

        // Get subscribers from this cohort
        const { data: cohortSubscribers, error } = await supabase
          .from('newsletter_subscriptions')
          .select('id')
          .gte('subscribed_at', cohortStart.toISOString())
          .lt('subscribed_at', cohortEnd.toISOString());

        if (error) throw error;

        const cohort_size = cohortSubscribers?.length || 0;
        if (cohort_size === 0) continue;

        const subscriberIds = (cohortSubscribers || []).map(s => s.id);

        // Calculate retention for each period after cohort
        const retention_rates: Array<{ period: number; subscribers: number; retention_rate: number }> = [];
        const engagement_metrics: Array<{ period: number; avg_open_rate: number; avg_click_rate: number }> = [];

        for (let period = 0; period < 12; period++) {
          const periodStart = new Date(cohortEnd);
          periodStart.setMonth(periodStart.getMonth() + (period * periodMonths));
          
          const periodEnd = new Date(periodStart);
          periodEnd.setMonth(periodEnd.getMonth() + periodMonths);

          // Check how many subscribers were still active in this period
          const { data: activeInPeriod, error: activeError } = await supabase
            .from('newsletter_analytics')
            .select('subscription_id')
            .in('subscription_id', subscriberIds)
            .gte('occurred_at', periodStart.toISOString())
            .lt('occurred_at', periodEnd.toISOString())
            .eq('event_type', 'sent');

          if (activeError) throw activeError;

          const uniqueActive = new Set((activeInPeriod || []).map(a => a.subscription_id));
          const activeCount = uniqueActive.size;
          const retention_rate = (activeCount / cohort_size) * 100;

          retention_rates.push({
            period,
            subscribers: activeCount,
            retention_rate: Math.round(retention_rate * 100) / 100
          });

          // Calculate engagement metrics for this period
          const { data: engagementData, error: engagementError } = await supabase
            .from('newsletter_analytics')
            .select('event_type, subscription_id')
            .in('subscription_id', Array.from(uniqueActive))
            .gte('occurred_at', periodStart.toISOString())
            .lt('occurred_at', periodEnd.toISOString())
            .in('event_type', ['sent', 'opened', 'clicked']);

          if (!engagementError && engagementData) {
            const sentCount = engagementData.filter(e => e.event_type === 'sent').length;
            const openCount = engagementData.filter(e => e.event_type === 'opened').length;
            const clickCount = engagementData.filter(e => e.event_type === 'clicked').length;

            const avg_open_rate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
            const avg_click_rate = openCount > 0 ? (clickCount / openCount) * 100 : 0;

            engagement_metrics.push({
              period,
              avg_open_rate: Math.round(avg_open_rate * 100) / 100,
              avg_click_rate: Math.round(avg_click_rate * 100) / 100
            });
          }
        }

        cohorts.push({
          cohort_period: cohortPeriodLabel,
          cohort_size,
          retention_rates,
          engagement_metrics
        });
      }

      return cohorts;
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      return [];
    }
  }

  /**
   * Get advanced analytics dashboard data
   */
  async getAdvancedAnalytics(days: number = 90): Promise<AdvancedAnalytics | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Subscriber growth
      const subscriber_growth = await this.getSubscriberGrowth(startDate, endDate);
      
      // Engagement trends
      const engagement_trends = await this.getEngagementTrends(startDate, endDate);
      
      // Content performance
      const content_performance = await this.getContentPerformance();
      
      // Segment performance
      const segment_performance = await this.getSegmentPerformance();

      return {
        subscriber_growth,
        engagement_trends,
        content_performance,
        segment_performance
      };
    } catch (error) {
      console.error('Error getting advanced analytics:', error);
      return null;
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
        if (!event.occurred_at) return;
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
        .filter(c => c.delivery_stats && (c.delivery_stats as any).sent > 0)
        .map(c => {
          const stats = c.delivery_stats as any;
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

  // Private helper methods for advanced analytics

  private async getSubscriberGrowth(startDate: Date, endDate: Date) {
    const growth: Array<{ date: string; new_subscribers: number; unsubscribes: number; net_growth: number }> = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get new subscribers
      const { data: newSubs, error: newError } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .gte('subscribed_at', currentDate.toISOString())
        .lt('subscribed_at', nextDate.toISOString());

      // Get unsubscribes
      const { data: unsubscribes, error: unsubError } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .gte('unsubscribed_at', currentDate.toISOString())
        .lt('unsubscribed_at', nextDate.toISOString());

      if (!newError && !unsubError) {
        const new_subscribers = newSubs?.length || 0;
        const unsubscribes_count = unsubscribes?.length || 0;
        const net_growth = new_subscribers - unsubscribes_count;

        growth.push({
          date: dateStr,
          new_subscribers,
          unsubscribes: unsubscribes_count,
          net_growth
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return growth;
  }

  private async getEngagementTrends(startDate: Date, endDate: Date) {
    const trends: Array<{ date: string; open_rate: number; click_rate: number; engagement_score: number }> = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const { data: analytics, error } = await supabase
        .from('newsletter_analytics')
        .select('event_type')
        .gte('occurred_at', currentDate.toISOString())
        .lt('occurred_at', nextDate.toISOString());

      if (!error && analytics) {
        const events = analytics;
        const sentCount = events.filter(e => e.event_type === 'sent').length;
        const openCount = events.filter(e => e.event_type === 'opened').length;
        const clickCount = events.filter(e => e.event_type === 'clicked').length;

        const open_rate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
        const click_rate = openCount > 0 ? (clickCount / openCount) * 100 : 0;
        const engagement_score = (open_rate + click_rate) / 2;

        trends.push({
          date: dateStr,
          open_rate: Math.round(open_rate * 100) / 100,
          click_rate: Math.round(click_rate * 100) / 100,
          engagement_score: Math.round(engagement_score * 100) / 100
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }

  private async getContentPerformance() {
    const performance: Array<{
      content_type: string;
      avg_open_rate: number;
      avg_click_rate: number;
      total_campaigns: number;
    }> = [];

    // Analyze campaign content by querying actual campaign data
    try {
      const { data: campaigns, error } = await supabase
        .from('newsletter_campaigns')
        .select(`
          content,
          delivery_stats
        `)
        .eq('status', 'sent')
        .not('delivery_stats', 'is', null);

      if (error) throw error;

      const contentTypes = ['events', 'news', 'opportunities', 'marketplace', 'members', 'companies'];
      
      for (const contentType of contentTypes) {
        // Filter campaigns that contain this content type
        const relevantCampaigns = (campaigns || []).filter(campaign => {
          const content = campaign.content || {};
          return content[contentType] && Array.isArray(content[contentType]) && content[contentType].length > 0;
        });

        if (relevantCampaigns.length > 0) {
          const totalOpen = relevantCampaigns.reduce((sum, c) => sum + (c.delivery_stats?.opened || 0), 0);
          const totalClick = relevantCampaigns.reduce((sum, c) => sum + (c.delivery_stats?.clicked || 0), 0);
          const totalSent = relevantCampaigns.reduce((sum, c) => sum + (c.delivery_stats?.sent || 0), 0);

          performance.push({
            content_type: contentType,
            avg_open_rate: totalSent > 0 ? (totalOpen / totalSent) * 100 : 0,
            avg_click_rate: totalOpen > 0 ? (totalClick / totalOpen) * 100 : 0,
            total_campaigns: relevantCampaigns.length
          });
        } else {
          performance.push({
            content_type: contentType,
            avg_open_rate: 0,
            avg_click_rate: 0,
            total_campaigns: 0
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing content performance:', error);
      // Return empty structure on error
      const contentTypes = ['events', 'news', 'opportunities', 'marketplace', 'members', 'companies'];
      for (const contentType of contentTypes) {
        performance.push({
          content_type: contentType,
          avg_open_rate: 0,
          avg_click_rate: 0,
          total_campaigns: 0
        });
      }
    }

    return performance;
  }

  private async getSegmentPerformance() {
    const performance: Array<{
      segment_id: string;
      segment_name: string;
      subscriber_count: number;
      avg_engagement: number;
    }> = [];

    try {
      const { data: segments, error } = await supabase
        .from('newsletter_segments')
        .select('id, name');

      if (!error && segments) {
        for (const segment of segments) {
          // Get subscriber count for segment
          const { count, error: countError } = await supabase
            .from('newsletter_segment_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('segment_id', segment.id);

          if (!countError) {
            performance.push({
              segment_id: segment.id,
              segment_name: segment.name,
              subscriber_count: count || 0,
              avg_engagement: 0 // TODO: Calculate actual engagement
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting segment performance:', error);
    }

    return performance;
  }
}

export const newsletterAnalyticsApi = new NewsletterAnalyticsAPI();