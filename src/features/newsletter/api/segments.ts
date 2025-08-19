import { supabase } from '@/lib/supabase';
import { 
  NewsletterSegment,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  SegmentFilters,
  PaginatedSegments,
  SegmentationCriteria,
  SegmentSubscriberStats
} from '@/types/newsletter';

class NewsletterSegmentAPI {
  /**
   * Create a new subscriber segment
   */
  async createSegment(request: CreateSegmentRequest): Promise<NewsletterSegment | null> {
    try {
      const segmentData = {
        name: request.name,
        description: request.description,
        criteria: request.criteria,
        is_dynamic: request.is_dynamic || false,
        color: request.color || '#3B82F6',
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_segments')
        .insert(segmentData)
        .select()
        .single();

      if (error) throw error;

      // Calculate initial subscriber count
      const subscriberCount = await this.getSegmentSubscriberCount(data.id);
      
      return {
        ...data,
        subscriber_count: subscriberCount
      } as NewsletterSegment;
    } catch (error) {
      console.error('Error creating segment:', error);
      return null;
    }
  }

  /**
   * Get segments with filtering and pagination
   */
  async getSegments(filters: SegmentFilters = {}): Promise<PaginatedSegments | null> {
    try {
      let query = supabase
        .from('newsletter_segments')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.is_dynamic !== undefined) {
        query = query.eq('is_dynamic', filters.is_dynamic);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate subscriber counts for each segment
      const segmentsWithCounts = await Promise.all(
        (data || []).map(async (segment) => ({
          ...segment,
          subscriber_count: await this.getSegmentSubscriberCount(segment.id)
        }))
      );

      return {
        data: segmentsWithCounts as NewsletterSegment[],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        page_size: limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting segments:', error);
      return null;
    }
  }

  /**
   * Get single segment by ID
   */
  async getSegment(id: string): Promise<NewsletterSegment | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_segments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const subscriberCount = await this.getSegmentSubscriberCount(id);
      
      return {
        ...data,
        subscriber_count: subscriberCount
      } as NewsletterSegment;
    } catch (error) {
      console.error('Error getting segment:', error);
      return null;
    }
  }

  /**
   * Update segment
   */
  async updateSegment(id: string, updates: UpdateSegmentRequest): Promise<NewsletterSegment | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const subscriberCount = await this.getSegmentSubscriberCount(id);
      
      return {
        ...data,
        subscriber_count: subscriberCount
      } as NewsletterSegment;
    } catch (error) {
      console.error('Error updating segment:', error);
      return null;
    }
  }

  /**
   * Delete segment
   */
  async deleteSegment(id: string): Promise<boolean> {
    try {
      // First remove all segment assignments
      await supabase
        .from('newsletter_segment_assignments')
        .delete()
        .eq('segment_id', id);

      // Then delete the segment
      const { error } = await supabase
        .from('newsletter_segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting segment:', error);
      return false;
    }
  }

  /**
   * Get subscribers in a segment
   */
  async getSegmentSubscribers(segmentId: string): Promise<string[]> {
    try {
      const segment = await this.getSegment(segmentId);
      if (!segment) return [];

      if (segment.is_dynamic) {
        // For dynamic segments, calculate based on criteria
        return await this.calculateDynamicSegmentSubscribers(segment.criteria);
      } else {
        // For static segments, get assigned subscribers
        const { data, error } = await supabase
          .from('newsletter_segment_assignments')
          .select('subscription_id')
          .eq('segment_id', segmentId);

        if (error) throw error;
        return (data || []).map(d => d.subscription_id);
      }
    } catch (error) {
      console.error('Error getting segment subscribers:', error);
      return [];
    }
  }

  /**
   * Add subscribers to static segment
   */
  async addSubscribersToSegment(segmentId: string, subscriptionIds: string[]): Promise<boolean> {
    try {
      const assignments = subscriptionIds.map(subscriptionId => ({
        segment_id: segmentId,
        subscription_id: subscriptionId
      }));

      const { error } = await supabase
        .from('newsletter_segment_assignments')
        .upsert(assignments, { onConflict: 'segment_id,subscription_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding subscribers to segment:', error);
      return false;
    }
  }

  /**
   * Remove subscribers from static segment
   */
  async removeSubscribersFromSegment(segmentId: string, subscriptionIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_segment_assignments')
        .delete()
        .eq('segment_id', segmentId)
        .in('subscription_id', subscriptionIds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing subscribers from segment:', error);
      return false;
    }
  }

  /**
   * Test segment criteria to see how many subscribers match
   */
  async testSegmentCriteria(criteria: SegmentationCriteria): Promise<number> {
    try {
      const subscriberIds = await this.calculateDynamicSegmentSubscribers(criteria);
      return subscriberIds.length;
    } catch (error) {
      console.error('Error testing segment criteria:', error);
      return 0;
    }
  }

  /**
   * Refresh dynamic segment (recalculate subscribers)
   */
  async refreshDynamicSegment(segmentId: string): Promise<boolean> {
    try {
      const segment = await this.getSegment(segmentId);
      if (!segment || !segment.is_dynamic) return false;

      // Calculate new subscriber list
      const newSubscriberIds = await this.calculateDynamicSegmentSubscribers(segment.criteria);

      // Clear existing assignments
      await supabase
        .from('newsletter_segment_assignments')
        .delete()
        .eq('segment_id', segmentId);

      // Add new assignments
      if (newSubscriberIds.length > 0) {
        await this.addSubscribersToSegment(segmentId, newSubscriberIds);
      }

      return true;
    } catch (error) {
      console.error('Error refreshing dynamic segment:', error);
      return false;
    }
  }

  /**
   * Get segment statistics
   */
  async getSegmentStats(segmentId: string): Promise<SegmentSubscriberStats | null> {
    try {
      const subscriberIds = await this.getSegmentSubscribers(segmentId);
      
      if (subscriberIds.length === 0) {
        return {
          total_subscribers: 0,
          active_subscribers: 0,
          engagement_rate: 0,
          avg_open_rate: 0,
          avg_click_rate: 0,
          last_campaign_performance: null
        };
      }

      // Get subscriber statuses
      const { data: subscriptions, error: subError } = await supabase
        .from('newsletter_subscriptions')
        .select('status')
        .in('id', subscriberIds);

      if (subError) throw subError;

      const activeCount = subscriptions?.filter(s => s.status === 'active').length || 0;

      // Calculate engagement metrics from analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('newsletter_analytics')
        .select('event_type, campaign_id')
        .in('subscription_id', subscriberIds);

      if (analyticsError) throw analyticsError;

      const events = analytics || [];
      const totalEvents = events.length;
      const openEvents = events.filter(e => e.event_type === 'opened').length;
      const clickEvents = events.filter(e => e.event_type === 'clicked').length;

      const engagement_rate = totalEvents > 0 ? ((openEvents + clickEvents) / totalEvents) * 100 : 0;
      const avg_open_rate = totalEvents > 0 ? (openEvents / totalEvents) * 100 : 0;
      const avg_click_rate = openEvents > 0 ? (clickEvents / openEvents) * 100 : 0;

      // Get last campaign performance
      const lastCampaignPerformance = await this.getLastCampaignPerformance(subscriberIds);

      return {
        total_subscribers: subscriberIds.length,
        active_subscribers: activeCount,
        engagement_rate: Math.round(engagement_rate * 100) / 100,
        avg_open_rate: Math.round(avg_open_rate * 100) / 100,
        avg_click_rate: Math.round(avg_click_rate * 100) / 100,
        last_campaign_performance: lastCampaignPerformance
      };
    } catch (error) {
      console.error('Error getting segment stats:', error);
      return null;
    }
  }

  /**
   * Bulk assign segments to subscribers
   */
  async bulkAssignSegments(assignments: Array<{ subscription_id: string; segment_id: string }>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_segment_assignments')
        .upsert(assignments, { onConflict: 'segment_id,subscription_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error bulk assigning segments:', error);
      return false;
    }
  }

  // Private helper methods

  private async getSegmentSubscriberCount(segmentId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('newsletter_segment_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('segment_id', segmentId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting segment subscriber count:', error);
      return 0;
    }
  }

  private async calculateDynamicSegmentSubscribers(criteria: SegmentationCriteria): Promise<string[]> {
    try {
      let query = supabase
        .from('newsletter_subscriptions')
        .select('id');

      // Apply status filter
      if (criteria.status) {
        query = query.in('status', criteria.status);
      }

      // Apply subscription date filter
      if (criteria.subscribed_after) {
        query = query.gte('subscribed_at', criteria.subscribed_after);
      }
      if (criteria.subscribed_before) {
        query = query.lte('subscribed_at', criteria.subscribed_before);
      }

      // Apply engagement filters
      if (criteria.min_open_rate !== undefined || criteria.max_open_rate !== undefined) {
        // This would require a more complex query with analytics data
        // For now, we'll implement basic filtering
      }

      // Apply location filter
      if (criteria.location_filter && criteria.location_filter.length > 0) {
        // Join with members table for location data
        query = supabase
          .from('newsletter_subscriptions')
          .select('id, members!inner(location)')
          .in('members.location', criteria.location_filter);
      }

      // Apply content preferences filter
      if (criteria.content_preferences && criteria.content_preferences.length > 0) {
        // Filter by preferred content types
        const contentFilter = criteria.content_preferences.map(pref => 
          `preferences->'content_types' @> '"${pref}"'`
        ).join(' OR ');
        query = query.or(contentFilter);
      }

      // Apply bounce count filter
      if (criteria.max_bounce_count !== undefined) {
        query = query.lte('bounce_count', criteria.max_bounce_count);
      }

      // Apply last activity filter
      if (criteria.last_activity_after) {
        query = query.gte('last_sent_at', criteria.last_activity_after);
      }
      if (criteria.last_activity_before) {
        query = query.lte('last_sent_at', criteria.last_activity_before);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(d => d.id);
    } catch (error) {
      console.error('Error calculating dynamic segment subscribers:', error);
      return [];
    }
  }

  private async getLastCampaignPerformance(subscriberIds: string[]): Promise<{
    campaign_title: string;
    open_rate: number;
    click_rate: number;
    sent_date: string;
  } | null> {
    try {
      // Get the most recent campaign that was sent to these subscribers
      const { data: lastCampaign, error } = await supabase
        .from('newsletter_analytics')
        .select(`
          campaign_id,
          newsletter_campaigns!inner(title, sent_at),
          event_type
        `)
        .in('subscription_id', subscriberIds)
        .eq('event_type', 'sent')
        .order('occurred_at', { ascending: false })
        .limit(1);

      if (error || !lastCampaign || lastCampaign.length === 0) {
        return null;
      }

      const campaignId = lastCampaign[0].campaign_id;
      
      // Get analytics for this campaign and these subscribers
      const { data: analytics, error: analyticsError } = await supabase
        .from('newsletter_analytics')
        .select('event_type')
        .eq('campaign_id', campaignId)
        .in('subscription_id', subscriberIds);

      if (analyticsError) return null;

      const events = analytics || [];
      const sentCount = events.filter(e => e.event_type === 'sent').length;
      const openCount = events.filter(e => e.event_type === 'opened').length;
      const clickCount = events.filter(e => e.event_type === 'clicked').length;

      const open_rate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
      const click_rate = openCount > 0 ? (clickCount / openCount) * 100 : 0;

      return {
        campaign_title: (lastCampaign[0] as any).newsletter_campaigns.title,
        open_rate: Math.round(open_rate * 100) / 100,
        click_rate: Math.round(click_rate * 100) / 100,
        sent_date: (lastCampaign[0] as any).newsletter_campaigns.sent_at
      };
    } catch (error) {
      console.error('Error getting last campaign performance:', error);
      return null;
    }
  }
}

export const newsletterSegmentApi = new NewsletterSegmentAPI();