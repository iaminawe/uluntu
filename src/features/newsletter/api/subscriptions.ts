import { supabase } from '@/lib/supabase';
import { resendService } from '@/services/resend';
import { 
  NewsletterSubscription, 
  CreateSubscriptionRequest, 
  UpdateSubscriptionRequest,
  SubscriptionFilters,
  PaginatedSubscriptions,
  NewsletterStats,
  SubscriptionPreferences
} from '@/types/newsletter';
import type { Database } from '@/types/supabase';

type DbSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row'];

class NewsletterSubscriptionAPI {
  /**
   * Map database subscription to NewsletterSubscription type
   */
  private mapSubscription(data: DbSubscription): NewsletterSubscription {
    return {
      id: data.id,
      email: data.email,
      member_id: data.member_id || undefined,
      status: (data.status as NewsletterSubscription['status']) || 'pending',
      preferences: (data.preferences as unknown as SubscriptionPreferences) || {
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
  // Public subscription methods

  /**
   * Subscribe to newsletter with double opt-in
   */
  async subscribe(request: CreateSubscriptionRequest): Promise<NewsletterSubscription | null> {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', request.email)
        .single();

      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Reactivate subscription
          const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .update({
              status: 'pending',
              preferences: request.preferences || existing.preferences,
              member_id: request.member_id || existing.member_id,
              confirmation_token: this.generateToken(),
              subscribed_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          
          // Send confirmation email
          const mapped = this.mapSubscription(data);
          await this.sendConfirmationEmail(mapped);
          return mapped;
        } else {
          // Already subscribed
          return this.mapSubscription(existing);
        }
      }

      // Create new subscription
      const subscriptionData = {
        email: request.email,
        member_id: request.member_id,
        preferences: request.preferences || {
          frequency: 'weekly',
          content_types: ['events', 'news', 'opportunities', 'marketplace'],
          format: 'digest',
          location_filter: true,
          language: 'en'
        },
        confirmation_token: this.generateToken(),
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      const mappedSubscription = this.mapSubscription(data);
      await this.sendConfirmationEmail(mappedSubscription);
      
      // Transform to match NewsletterSubscription interface
      return {
        id: data.id,
        email: data.email,
        member_id: data.member_id || undefined,
        status: (data.status as any) || 'pending',
        preferences: data.preferences as any || {
          frequency: 'weekly',
          content_types: ['events', 'news', 'opportunities', 'marketplace'],
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
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return null;
    }
  }

  /**
   * Confirm subscription via token
   */
  async confirmSubscription(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          status: 'active',
          confirmed_at: new Date().toISOString(),
          confirmation_token: null
        })
        .eq('confirmation_token', token)
        .eq('status', 'pending')
        .select();

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error confirming subscription:', error);
      return false;
    }
  }

  /**
   * Unsubscribe via token
   */
  async unsubscribe(token: string, reason?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString()
        })
        .eq('subscription_token', token)
        .select();

      if (error) throw error;

      // Log unsubscribe reason if provided
      if (reason && data && data.length > 0) {
        await this.logUnsubscribeReason(data[0].id, reason);
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Update subscription preferences
   */
  async updatePreferences(token: string, request: UpdateSubscriptionRequest): Promise<NewsletterSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update(request)
        .eq('subscription_token', token)
        .select()
        .single();

      if (error) throw error;
      return this.mapSubscription(data);
    } catch (error) {
      console.error('Error updating subscription preferences:', error);
      return null;
    }
  }

  /**
   * Get subscription by email
   */
  async getSubscription(email: string): Promise<NewsletterSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapSubscription(data) : null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Get subscription by token
   */
  async getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('subscription_token', token)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapSubscription(data) : null;
    } catch (error) {
      console.error('Error getting subscription by token:', error);
      return null;
    }
  }

  // Admin methods

  /**
   * Get all subscriptions with filtering and pagination (Admin only)
   */
  async getAllSubscriptions(filters: SubscriptionFilters = {}): Promise<PaginatedSubscriptions | null> {
    try {
      let query = supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }

      if (filters.member_id) {
        query = query.eq('member_id', filters.member_id);
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
        data: (data || []).map(sub => this.mapSubscription(sub)),
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        page_size: limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return null;
    }
  }

  /**
   * Get subscription statistics (Admin only)
   */
  async getSubscriptionStats(): Promise<NewsletterStats | null> {
    try {
      // Get subscription counts by status
      const { data: subscriptions, error: subsError } = await supabase
        .from('newsletter_subscriptions')
        .select('status');

      if (subsError) throw subsError;

      const stats = {
        total_subscribers: subscriptions?.length || 0,
        active_subscribers: subscriptions?.filter(s => s.status === 'active').length || 0,
        pending_subscribers: subscriptions?.filter(s => s.status === 'pending').length || 0,
        total_campaigns: 0,
        sent_campaigns: 0,
        avg_open_rate: 0,
        avg_click_rate: 0
      };

      // Get campaign counts if table exists
      try {
        const { data: campaigns, error: campError } = await supabase
          .from('newsletter_campaigns')
          .select('status');

        if (!campError && campaigns) {
          stats.total_campaigns = campaigns.length;
          stats.sent_campaigns = campaigns.filter(c => c.status === 'sent').length;
        }
      } catch (err) {
        // Campaign table may not exist yet, continue with subscription stats only
        console.warn('Newsletter campaigns table not found, continuing with subscription stats only');
      }

      // Get analytics stats if table exists
      try {
        const { data: analytics, error: analyticsError } = await supabase
          .from('newsletter_analytics')
          .select('event_type');

        if (!analyticsError && analytics && analytics.length > 0) {
          const totalEvents = analytics.length;
          const openEvents = analytics.filter(a => a.event_type === 'opened').length;
          const clickEvents = analytics.filter(a => a.event_type === 'clicked').length;
          
          stats.avg_open_rate = totalEvents > 0 ? (openEvents / totalEvents) * 100 : 0;
          stats.avg_click_rate = totalEvents > 0 ? (clickEvents / totalEvents) * 100 : 0;
        }
      } catch (err) {
        // Analytics table may not exist yet, continue with other stats
        console.warn('Newsletter analytics table not found, continuing without engagement stats');
      }

      return stats;
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return null;
    }
  }

  /**
   * Export subscriptions as CSV (Admin only)
   */
  async exportSubscriptions(filters: SubscriptionFilters = {}): Promise<string | null> {
    try {
      // Get all subscriptions without pagination for export
      const exportFilters = { ...filters, limit: 10000, offset: 0 };
      const result = await this.getAllSubscriptions(exportFilters);

      if (!result || !result.data) return null;

      // Create CSV headers
      const headers = [
        'Email',
        'Status', 
        'Member ID',
        'Frequency',
        'Content Types',
        'Format',
        'Language',
        'Subscribed At',
        'Confirmed At',
        'Unsubscribed At',
        'Last Sent At',
        'Bounce Count'
      ];

      // Create CSV rows
      const rows = result.data.map(subscription => [
        subscription.email,
        subscription.status,
        subscription.member_id || '',
        subscription.preferences.frequency,
        subscription.preferences.content_types.join(';'),
        subscription.preferences.format,
        subscription.preferences.language,
        subscription.subscribed_at,
        subscription.confirmed_at || '',
        subscription.unsubscribed_at || '',
        subscription.last_sent_at || '',
        subscription.bounce_count.toString()
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      return null;
    }
  }

  /**
   * Update subscription status (Admin only)
   */
  async updateSubscriptionStatus(id: string, status: NewsletterSubscription['status']): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'unsubscribed') {
        updateData.unsubscribed_at = new Date().toISOString();
      } else if (status === 'active') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.unsubscribed_at = null;
      }

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }
  }

  /**
   * Delete subscription (Admin only)
   */
  async deleteSubscription(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }

  /**
   * Get active subscribers for campaign sending
   */
  async getActiveSubscribers(): Promise<NewsletterSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('subscribed_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(sub => this.mapSubscription(sub));
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      return [];
    }
  }

  /**
   * Record bounce for subscription
   */
  async recordBounce(email: string, bounceType: 'hard' | 'soft'): Promise<void> {
    try {
      const { data: subscription } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (!subscription) return;

      const newBounceCount = (subscription.bounce_count || 0) + 1;
      const updateData: Record<string, unknown> = { bounce_count: newBounceCount };

      // Hard bounce or too many soft bounces = mark as bounced
      if (bounceType === 'hard' || newBounceCount >= 5) {
        updateData.status = 'bounced';
      }

      await supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .eq('id', subscription.id);
    } catch (error) {
      console.error('Error recording bounce:', error);
    }
  }

  /**
   * Update last sent timestamp
   */
  async updateLastSent(subscriptionIds: string[]): Promise<void> {
    try {
      await supabase
        .from('newsletter_subscriptions')
        .update({ last_sent_at: new Date().toISOString() })
        .in('id', subscriptionIds);
    } catch (error) {
      console.error('Error updating last sent:', error);
    }
  }

  // Private helper methods

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async sendConfirmationEmail(subscription: NewsletterSubscription): Promise<void> {
    try {
      await resendService.sendConfirmationEmail(subscription);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }

  private async logUnsubscribeReason(subscriptionId: string, reason: string): Promise<void> {
    try {
      // Log to analytics table
      await supabase
        .from('newsletter_analytics')
        .insert({
          subscription_id: subscriptionId,
          event_type: 'unsubscribed',
          event_data: { reason }
        });
    } catch (error) {
      console.error('Error logging unsubscribe reason:', error);
    }
  }
}

export const newsletterSubscriptionApi = new NewsletterSubscriptionAPI();