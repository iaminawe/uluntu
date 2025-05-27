import { supabase, handleSupabaseError } from './supabaseUtils';
import { NewsArticle } from '../types';
import {
  adaptNewsArticleFromDatabase,
  adaptNewsArticleToDatabase,
  SupabaseNewsArticleWithAuthor,
} from '../adapters/newsAdapter';
import type { Database } from '../types/supabase';

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

type NewsTableInsert = Database['public']['Tables']['news']['Insert'];
type NewsTableUpdate = Database['public']['Tables']['news']['Update'];

export const newsApi = {
  async getAll(filters: { search?: string; tags?: string[] } = {}): Promise<NewsArticle[]> {
    try {
      let query = supabase.from('news').select(`
        *,
        members!author_id (*)
      `);

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query.order('publish_date', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetching news articles');
        return [];
      }
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], (item: SupabaseNewsArticleWithAuthor) => adaptNewsArticleFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, 'fetching news articles');
      return [];
    }
  },

  async getById(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          members!author_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, `fetching news article with id ${id}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as SupabaseNewsArticleWithAuthor) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching news article with id ${id}`);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          members!author_id (*)
        `)
        .eq('slug', slug) 
        .single();

      if (error) {
        handleSupabaseError(error, `fetching news article with slug ${slug}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as SupabaseNewsArticleWithAuthor) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching news article with slug ${slug}`);
      return null;
    }
  },

  async create(newsArticleData: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const supabaseArticle = adaptNewsArticleToDatabase(newsArticleData);
      if (!supabaseArticle.slug && newsArticleData.title) {
        supabaseArticle.slug = newsArticleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }

      const { data, error } = await supabase
        .from('news')
        .insert(supabaseArticle as NewsTableInsert)
        .select(`*, members!author_id (*)`)
        .single();

      if (error) {
        handleSupabaseError(error, 'creating news article');
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as SupabaseNewsArticleWithAuthor) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating news article');
      return null;
    }
  },

  async update(id: string, newsArticleData: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const supabaseArticle = adaptNewsArticleToDatabase(newsArticleData);
      const { data, error } = await supabase
        .from('news')
        .update(supabaseArticle as NewsTableUpdate)
        .eq('id', id)
        .select(`*, members!author_id (*)`)
        .single();

      if (error) {
        handleSupabaseError(error, `updating news article with id ${id}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as SupabaseNewsArticleWithAuthor) : null;
    } catch (error) {
      handleSupabaseError(error, `updating news article with id ${id}`);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) {
        handleSupabaseError(error, `deleting news article with id ${id}`);
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, `deleting news article with id ${id}`);
      return false;
    }
  },

  async getRelated(newsId: string, limit: number = 3): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`*, members!author_id (*)`)
        .neq('id', newsId)
        .limit(limit)
        .order('publish_date', { ascending: false });

      if (error) {
        handleSupabaseError(error, `fetching related news articles for id ${newsId}`);
        return [];
      }
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], (item: SupabaseNewsArticleWithAuthor) => adaptNewsArticleFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, `fetching related news articles for id ${newsId}`);
      return [];
    }
  },
};
