import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type DbCampaign = Database['public']['Tables']['newsletter_campaigns']['Row'];
// type DbCampaignInsert = Database['public']['Tables']['newsletter_campaigns']['Insert'];
// type DbCampaignUpdate = Database['public']['Tables']['newsletter_campaigns']['Update'];

export interface Campaign {
  id: string;
  title: string; // Changed from 'name' to match database schema
  subject: string;
  content: any; // Changed to match JSONB type
  template_id?: string;
  template_data?: any; // Added to match schema
  custom_message?: string; // Added to match schema
  branding?: any; // Added to match schema
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'; // Updated status values
  send_type?: 'manual' | 'scheduled' | 'automated'; // Added to match schema
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  recipient_count?: number;
  delivery_stats?: any; // Changed from metadata to match schema
}

class NewsletterCampaignsApi {
  /**
   * Get all campaigns
   */
  // Helper function to convert database row to Campaign interface
  private mapDbCampaignToCampaign(dbCampaign: DbCampaign): Campaign {
    return {
      id: dbCampaign.id,
      title: dbCampaign.title,
      subject: dbCampaign.subject,
      content: dbCampaign.content || {},
      template_id: dbCampaign.template_id || undefined,
      template_data: dbCampaign.template_data || undefined,
      custom_message: dbCampaign.custom_message || undefined,
      branding: dbCampaign.branding || undefined,
      status: (dbCampaign.status as Campaign['status']) || 'draft',
      send_type: (dbCampaign.send_type as Campaign['send_type']) || undefined,
      scheduled_at: dbCampaign.scheduled_at || undefined,
      sent_at: dbCampaign.sent_at || undefined,
      created_at: dbCampaign.created_at || new Date().toISOString(),
      updated_at: dbCampaign.updated_at || new Date().toISOString(),
      created_by: dbCampaign.created_by,
      recipient_count: dbCampaign.recipient_count || undefined,
      delivery_stats: dbCampaign.delivery_stats || undefined
    };
  }

  async getCampaigns(filters?: {
    status?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ campaigns: Campaign[]; total: number }> {
    try {
      let query = supabase
        .from('newsletter_campaigns')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
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
        campaigns: (data || []).map(this.mapDbCampaignToCampaign.bind(this)),
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  /**
   * Get a single campaign
   */
  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? this.mapDbCampaignToCampaign(data) : null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert({
          title: campaign.title || 'Untitled Campaign',
          subject: campaign.subject || 'Newsletter',
          template_id: campaign.template_id,
          template_data: campaign.template_data || {},
          content: campaign.content || {},
          custom_message: campaign.custom_message,
          branding: campaign.branding || {
            primary_color: '#3B82F6',
            secondary_color: '#64748B',
            logo_url: '',
            header_image: '',
            footer_text: 'Kootenay Tech Community',
            social_links: []
          },
          status: campaign.status || 'draft',
          send_type: campaign.send_type || 'manual',
          scheduled_at: campaign.scheduled_at,
          recipient_count: campaign.recipient_count || 0,
          delivery_stats: campaign.delivery_stats || {
            sent: 0,
            delivered: 0,
            bounced: 0,
            opened: 0,
            clicked: 0
          },
          created_by: campaign.created_by || 'system'
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) throw new Error('Failed to create campaign - no data returned');
      return this.mapDbCampaignToCampaign(data);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Update a campaign
   */
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      // Map the updates to match database schema
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.template_id !== undefined) updateData.template_id = updates.template_id;
      if (updates.template_data !== undefined) updateData.template_data = updates.template_data;
      if (updates.custom_message !== undefined) updateData.custom_message = updates.custom_message;
      if (updates.branding !== undefined) updateData.branding = updates.branding;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.send_type !== undefined) updateData.send_type = updates.send_type;
      if (updates.scheduled_at !== undefined) updateData.scheduled_at = updates.scheduled_at;
      if (updates.sent_at !== undefined) updateData.sent_at = updates.sent_at;
      if (updates.recipient_count !== undefined) updateData.recipient_count = updates.recipient_count;
      if (updates.delivery_stats !== undefined) updateData.delivery_stats = updates.delivery_stats;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) throw new Error('Failed to update campaign - no data returned');
      return this.mapDbCampaignToCampaign(data);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Send a campaign
   */
  async sendCampaign(id: string): Promise<void> {
    try {
      // Update campaign status to sending
      await this.updateCampaign(id, { status: 'sending' });

      // The actual sending would be handled by a background job or edge function
      // This is just updating the status
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  }

  /**
   * Schedule a campaign
   */
  async scheduleCampaign(id: string, scheduledAt: string): Promise<void> {
    try {
      await this.updateCampaign(id, {
        status: 'scheduled',
        scheduled_at: scheduledAt
      });
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  }
}

export const newsletterCampaignsApi = new NewsletterCampaignsApi();