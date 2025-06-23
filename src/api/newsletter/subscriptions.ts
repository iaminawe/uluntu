import { supabase } from '@/lib/supabase';
import { logAndSanitizeError } from '@/utils/errorSanitization';

export interface Subscription {
  id: string;
  email: string;
  member_id?: string;
  status: 'pending' | 'active' | 'unsubscribed' | 'bounced';
  preferences?: {
    frequency?: 'weekly' | 'monthly';
    content_types?: string[];
    format?: string;
    location_filter?: boolean;
    language?: string;
  };
  subscription_token: string;
  confirmation_token?: string | null;
  confirmed_at?: string | null;
  subscribed_at: string;
  unsubscribed_at?: string | null;
  last_sent_at?: string | null;
  bounce_count: number;
  created_at: string;
  updated_at: string;
}

class NewsletterSubscriptionsApi {
  /**
   * Get all subscriptions
   */
  async getSubscriptions(filters?: {
    status?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ subscriptions: Subscription[]; total: number }> {
    try {
      let query = supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        subscriptions: (data || []).map(item => ({
          id: item.id,
          email: item.email,
          member_id: item.member_id || undefined,
          status: (item.status || 'pending') as Subscription['status'],
          preferences: item.preferences as Subscription['preferences'] || undefined,
          subscription_token: item.subscription_token || '',
          confirmation_token: item.confirmation_token,
          confirmed_at: item.confirmed_at,
          subscribed_at: item.subscribed_at || item.created_at || new Date().toISOString(),
          unsubscribed_at: item.unsubscribed_at,
          last_sent_at: item.last_sent_at,
          bounce_count: item.bounce_count || 0,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        })),
        total: count || 0
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Get Subscriptions');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Get a single subscription
   */
  async getSubscription(id: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;
      
      return {
        id: data.id,
        email: data.email,
        member_id: data.member_id || undefined,
        status: (data.status || 'pending') as Subscription['status'],
        preferences: data.preferences as Subscription['preferences'] || undefined,
        subscription_token: data.subscription_token || '',
        confirmation_token: data.confirmation_token,
        confirmed_at: data.confirmed_at,
        subscribed_at: data.subscribed_at || data.created_at || new Date().toISOString(),
        unsubscribed_at: data.unsubscribed_at,
        last_sent_at: data.last_sent_at,
        bounce_count: data.bounce_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Get Subscription');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Get subscription by email
   */
  async getSubscriptionByEmail(email: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      if (!data) return null;
      
      return {
        id: data.id,
        email: data.email,
        member_id: data.member_id || undefined,
        status: (data.status || 'pending') as Subscription['status'],
        preferences: data.preferences as Subscription['preferences'] || undefined,
        subscription_token: data.subscription_token || '',
        confirmation_token: data.confirmation_token,
        confirmed_at: data.confirmed_at,
        subscribed_at: data.subscribed_at || data.created_at || new Date().toISOString(),
        unsubscribed_at: data.unsubscribed_at,
        last_sent_at: data.last_sent_at,
        bounce_count: data.bounce_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Get By Email');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscription: {
    email: string;
    member_id?: string;
    preferences?: any;
  }): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: subscription.email,
          member_id: subscription.member_id,
          preferences: subscription.preferences,
          status: 'active',
          subscribed_at: new Date().toISOString(),
          subscription_token: crypto.randomUUID(),
          bounce_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create subscription');
      
      return {
        id: data.id,
        email: data.email,
        member_id: data.member_id || undefined,
        status: (data.status || 'active') as Subscription['status'],
        preferences: data.preferences as Subscription['preferences'] || undefined,
        subscription_token: data.subscription_token || '',
        confirmation_token: data.confirmation_token,
        confirmed_at: data.confirmed_at,
        subscribed_at: data.subscribed_at || data.created_at || new Date().toISOString(),
        unsubscribed_at: data.unsubscribed_at,
        last_sent_at: data.last_sent_at,
        bounce_count: data.bounce_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Create');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update subscription');
      
      return {
        id: data.id,
        email: data.email,
        member_id: data.member_id || undefined,
        status: (data.status || 'active') as Subscription['status'],
        preferences: data.preferences as Subscription['preferences'] || undefined,
        subscription_token: data.subscription_token || '',
        confirmation_token: data.confirmation_token,
        confirmed_at: data.confirmed_at,
        subscribed_at: data.subscribed_at || data.created_at || new Date().toISOString(),
        unsubscribed_at: data.unsubscribed_at,
        last_sent_at: data.last_sent_at,
        bounce_count: data.bounce_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Update');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Unsubscribe
   */
  async unsubscribe(id: string): Promise<void> {
    try {
      await this.updateSubscription(id, {
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      });
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Unsubscribe');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Bulk import subscriptions
   */
  async bulkImport(emails: string[]): Promise<{ success: number; failed: number }> {
    try {
      const results = {
        success: 0,
        failed: 0
      };

      for (const email of emails) {
        try {
          // Check if already exists
          const existing = await this.getSubscriptionByEmail(email);
          if (!existing) {
            await this.createSubscription({ email });
            results.success++;
          } else {
            results.failed++;
          }
        } catch (error) {
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Bulk Import');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Export subscriptions
   */
  async exportSubscriptions(status?: string): Promise<string> {
    try {
      const { subscriptions } = await this.getSubscriptions({
        status: status ? [status] : undefined,
        limit: 10000 // High limit for export
      });

      // Convert to CSV
      const headers = ['Email', 'Status', 'Subscribed At', 'Member ID'];
      const rows = subscriptions.map(sub => [
        sub.email,
        sub.status,
        sub.subscribed_at,
        sub.member_id || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return csv;
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Subscriptions - Export');
      throw new Error(sanitized.userMessage);
    }
  }
}

export const newsletterSubscriptionsApi = new NewsletterSubscriptionsApi();