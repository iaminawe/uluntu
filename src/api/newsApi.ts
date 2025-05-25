import { supabase, handleSupabaseError } from './supabaseUtils';
import { NewsArticle, NewsAuthor } from '../components/NewsList/types';
import { adaptListFromSupabase } from '../adapters/dataAdapters';
import type { Database } from '../types/supabase'; 

type NewsTableRow = Database['public']['Tables']['news']['Row'];
type MembersTableRow = Database['public']['Tables']['members']['Row'];
type NewsTableInsert = Database['public']['Tables']['news']['Insert'];
type NewsTableUpdate = Database['public']['Tables']['news']['Update'];

type NewsWithAuthorRow = NewsTableRow & { members: MembersTableRow | null };

const adaptNewsArticleFromSupabase = (supabaseArticle: NewsWithAuthorRow): NewsArticle => {
  let author: NewsAuthor = { name: 'Unknown Author', image: '' };
  if (supabaseArticle.members) { 
    author = {
      id: supabaseArticle.members.id,
      name: supabaseArticle.members.name || 'Unknown Author',
      image: supabaseArticle.members.image || '', 
    };
  } else if (supabaseArticle.author_id) { 
    author = { id: supabaseArticle.author_id, name: 'Author (ID: ' + supabaseArticle.author_id + ')' };
  }

  return {
    id: supabaseArticle.id,
    title: supabaseArticle.title,
    excerpt: supabaseArticle.excerpt,
    content: supabaseArticle.content,
    image: supabaseArticle.hero_image, 
    publishedAt: supabaseArticle.publish_date, 
    author: author,
    tags: supabaseArticle.tags || [],
  };
};

const adaptNewsArticleToSupabase = (newsArticleData: Partial<NewsArticle>): Partial<NewsTableInsert | NewsTableUpdate> => {
  const supabaseData: Partial<NewsTableInsert | NewsTableUpdate> = {};
  if (newsArticleData.title !== undefined) supabaseData.title = newsArticleData.title;
  if (newsArticleData.excerpt !== undefined) supabaseData.excerpt = newsArticleData.excerpt;
  if (newsArticleData.content !== undefined) supabaseData.content = newsArticleData.content;
  if (newsArticleData.image !== undefined) supabaseData.hero_image = newsArticleData.image; 
  if (newsArticleData.publishedAt !== undefined) supabaseData.publish_date = newsArticleData.publishedAt; 
  if (newsArticleData.author && newsArticleData.author.id !== undefined) {
    supabaseData.author_id = newsArticleData.author.id;
  }
  if (newsArticleData.tags !== undefined) supabaseData.tags = newsArticleData.tags;
  if (newsArticleData.id !== undefined && 'id' in newsArticleData) { 
    // supabaseData.id = newsArticleData.id; 
  }
  if (newsArticleData.slug !== undefined) supabaseData.slug = newsArticleData.slug;


  return supabaseData;
};

export const newsApi = {
  async getAll(filters: { search?: string; tags?: string[] } = {}) {
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

      if (error) throw error;
      return adaptListFromSupabase(data || [], adaptNewsArticleFromSupabase as (item: NewsWithAuthorRow) => NewsArticle);
    } catch (error) {
      return handleSupabaseError(error, 'fetching news articles');
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          members!author_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? adaptNewsArticleFromSupabase(data as NewsWithAuthorRow) : null;
    } catch (error) {
      return handleSupabaseError(error, `fetching news article with id ${id}`);
    }
  },

  async getBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          members!author_id (*)
        `)
        .eq('slug', slug) 
        .single();

      if (error) throw error;
      return data ? adaptNewsArticleFromSupabase(data as NewsWithAuthorRow) : null;
    } catch (error) {
      return handleSupabaseError(error, `fetching news article with slug ${slug}`);
    }
  },

  async create(newsArticleData: Partial<NewsArticle>) {
    try {
      const supabaseArticle = adaptNewsArticleToSupabase(newsArticleData);
      if (!supabaseArticle.slug && newsArticleData.title) {
        supabaseArticle.slug = newsArticleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }


      const { data, error } = await supabase
        .from('news')
        .insert(supabaseArticle as NewsTableInsert)
        .select(`*, members!author_id (*)`)
        .single();

      if (error) throw error;
      return data ? adaptNewsArticleFromSupabase(data as NewsWithAuthorRow) : null;
    } catch (error) {
      return handleSupabaseError(error, 'creating news article');
    }
  },

  async update(id: string, newsArticleData: Partial<NewsArticle>) {
    try {
      const supabaseArticle = adaptNewsArticleToSupabase(newsArticleData);
      const { data, error } = await supabase
        .from('news')
        .update(supabaseArticle as NewsTableUpdate)
        .eq('id', id)
        .select(`*, members!author_id (*)`)
        .single();

      if (error) throw error;
      return data ? adaptNewsArticleFromSupabase(data as NewsWithAuthorRow) : null;
    } catch (error) {
      return handleSupabaseError(error, `updating news article with id ${id}`);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      return handleSupabaseError(error, `deleting news article with id ${id}`);
    }
  },

  async getRelated(newsId: string, limit: number = 3) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`*, members!author_id (*)`)
        .neq('id', newsId)
        .limit(limit)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      return adaptListFromSupabase(data || [], adaptNewsArticleFromSupabase as (item: NewsWithAuthorRow) => NewsArticle);
    } catch (error) {
      return handleSupabaseError(error, `fetching related news articles for id ${newsId}`);
    }
  },
};
