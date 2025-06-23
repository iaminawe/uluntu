import { supabase } from '@/lib/supabase';
import { logAndSanitizeError } from '@/utils/errorSanitization';

export interface NewsletterContent {
  id: string;
  content_type: 'events' | 'news' | 'opportunities' | 'marketplace' | 'members' | 'companies';
  date_range_start: string;
  date_range_end: string;
  content: any; // JSONB content
  generated_at: string | null;
  expires_at: string | null;
}

class NewsletterContentApi {
  /**
   * Get cached content for newsletter generation
   */
  async getCachedContent(contentType: string, dateStart: string, dateEnd: string): Promise<NewsletterContent | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_cache')
        .select('*')
        .eq('content_type', contentType)
        .eq('date_range_start', dateStart)
        .eq('date_range_end', dateEnd)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore 'not found' errors

      return data ? {
        ...data,
        content_type: data.content_type as NewsletterContent['content_type']
      } : null;
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Get Cached Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Get all cached content
   */
  async getAllCachedContent(limit: number = 10): Promise<NewsletterContent[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_cache')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(item => ({
        ...item,
        content_type: item.content_type as NewsletterContent['content_type']
      })) || [];
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Get All Cached Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Cache content for newsletter generation
   */
  async cacheContent(content: Partial<NewsletterContent>): Promise<NewsletterContent> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_cache')
        .insert({
          // content_type: content.content_type, // Note: field not in schema
          date_range_start: content.date_range_start,
          date_range_end: content.date_range_end,
          content: content.content,
          generated_at: new Date().toISOString(),
          expires_at: content.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours default
        } as any) // Type assertion for schema mismatch
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        content_type: data.content_type as NewsletterContent['content_type']
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Cache Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Update cached content
   */
  async updateCachedContent(id: string, updates: Partial<NewsletterContent>): Promise<NewsletterContent> {
    try {
      const updateData: any = {};
      if (updates.content_type) updateData.content_type = updates.content_type;
      if (updates.date_range_start) updateData.date_range_start = updates.date_range_start;
      if (updates.date_range_end) updateData.date_range_end = updates.date_range_end;
      if (updates.content) updateData.content = updates.content;
      if (updates.expires_at) updateData.expires_at = updates.expires_at;
      
      const { data, error } = await supabase
        .from('newsletter_content_cache')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        content_type: data.content_type as NewsletterContent['content_type']
      };
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Update Cached Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Remove cached content
   */
  async removeCachedContent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('newsletter_content_cache')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Remove Cached Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Clean expired cached content
   */
  async cleanExpiredContent(): Promise<void> {
    try {
      const { error } = await supabase
        .from('newsletter_content_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Clean Expired Content');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Get recent content by type
   */
  async getRecentContent(type: string, limit: number = 10): Promise<any[]> {
    try {
      let tableName: string;
      let selectFields: string;

      switch (type) {
        case 'event':
          tableName = 'events';
          selectFields = 'id, title, date, location, description, image';
          break;
        case 'news':
          tableName = 'news';
          selectFields = 'id, title, excerpt, content, publish_date, hero_image';
          break;
        case 'opportunity':
          tableName = 'opportunities';
          selectFields = 'id, title, company, location, remote, description';
          break;
        case 'resource':
          tableName = 'resources';
          selectFields = 'id, title, description, type, url, image';
          break;
        default:
          return [];
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(item => ({
        ...item,
        content_type: item.content_type as NewsletterContent['content_type']
      })) || [];
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Newsletter Content - Get Recent Content');
      throw new Error(sanitized.userMessage);
    }
  }
}

export const newsletterContentApi = new NewsletterContentApi();