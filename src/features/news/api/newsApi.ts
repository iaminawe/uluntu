import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import { NewsArticle } from '../types';
import {
  adaptNewsArticleFromDatabase,
  adaptNewsArticleToDatabase,
  SupabaseNewsArticleWithAuthor,
} from '../utils/newsAdapter';
import type { Database } from '../types/supabase';
import { generateSlug } from '@/utils/slugify';


type NewsTableInsert = Database['public']['Tables']['news']['Insert'];
type NewsTableUpdate = Database['public']['Tables']['news']['Update'];

export const newsApi = {
  async getAll(filters: { search?: string; tags?: string[]; featured?: boolean; status?: string } = {}): Promise<NewsArticle[]> {
    try {
      console.log('[NewsAPI] getAll called with filters:', filters);
      
      // Use direct REST API call to bypass Supabase client issues
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Missing Supabase configuration');
      }
      
      // Build query string
      let queryString = 'select=*';
      
      // Add status filter (default to published)
      const status = filters.status || 'published';
      queryString += `&status=eq.${status}`;
      
      // Add order
      queryString += '&order=publish_date.desc';
      
      console.log('[NewsAPI] Using direct REST API call:', `${url}/rest/v1/news?${queryString}`);
      
      const response = await fetch(`${url}/rest/v1/news?${queryString}`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('[NewsAPI] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[NewsAPI] Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[NewsAPI] Response data:', data?.length, 'articles');
      
      // Use our helper function to adapt the data
      const adaptedArticles = adaptItemsList(data || [], (item: any) => adaptNewsArticleFromDatabase(item));
      console.log('[NewsAPI] Adapted articles:', adaptedArticles.length);
      return adaptedArticles;
    } catch (error) {
      handleSupabaseError(error, 'fetching news articles');
      return [];
    }
  },

  async getById(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, `fetching news article with id ${id}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as any) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching news article with id ${id}`);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug) 
        .single();

      if (error) {
        handleSupabaseError(error, `fetching news article with slug ${slug}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as any) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching news article with slug ${slug}`);
      return null;
    }
  },

  async create(newsArticleData: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const supabaseArticle = adaptNewsArticleToDatabase(newsArticleData);
      if (!supabaseArticle.slug && newsArticleData.title) {
        supabaseArticle.slug = generateSlug(newsArticleData.title, { strict: true });
      }

      const { data, error } = await supabase
        .from('news')
        .insert(supabaseArticle as NewsTableInsert)
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'creating news article');
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as any) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating news article');
      return null;
    }
  },

  async update(id: string, newsArticleData: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const supabaseArticle = adaptNewsArticleToDatabase(newsArticleData);
      
      // Generate slug if title is provided but slug is not
      if (newsArticleData.title && !newsArticleData.slug && !supabaseArticle.slug) {
        supabaseArticle.slug = generateSlug(newsArticleData.title, { strict: true });
      }
      
      const { data, error } = await supabase
        .from('news')
        .update(supabaseArticle as NewsTableUpdate)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, `updating news article with id ${id}`);
        return null;
      }
      
      return data ? adaptNewsArticleFromDatabase(data as any) : null;
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
        .select('*')
        .neq('id', newsId)
        .limit(limit)
        .order('publish_date', { ascending: false });

      if (error) {
        handleSupabaseError(error, `fetching related news articles for id ${newsId}`);
        return [];
      }
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], (item: any) => adaptNewsArticleFromDatabase(item));
    } catch (error) {
      handleSupabaseError(error, `fetching related news articles for id ${newsId}`);
      return [];
    }
  },
};
