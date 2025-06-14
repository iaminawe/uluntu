import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsArticles } from '../data/mock/mockData';
import { supabase } from '@/lib/supabase';
import type { Database } from '../types/supabase';
import { NewsArticle, ContentStatus } from '../types';
import {
  adaptNewsArticleFromDatabase as adaptNewsArticleFromSupabase, // Keep alias for minimal changes in this file
  adaptNewsArticleToDatabase as adaptNewsArticleToDatabase, // Import the to-database adapter
  type SupabaseNewsArticleWithAuthor as NewsArticleSupabaseRow // Keep alias for minimal changes
} from '@/adapters/newsAdapter';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type NewsSupabase = Tables['news']['Row'];

export type NewsArticleInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author_id?: string;
  publish_date?: string;
  hero_image?: string;
  hero_image_alt?: string;
  tags?: string[];
  status?: ContentStatus;
  featured?: boolean;
};

// Supabase news table types with potential joins
type SupabaseNewsArticle = NewsSupabase & {
  members?: Pick<Tables['members']['Row'], 'id' | 'name' | 'image'> | null;
};

// Adapter function to map Supabase news_articles row to internal NewsArticle type
function mapSupabaseNewsToInternalNews(supabaseItem: SupabaseNewsArticle): NewsArticle {
  // The SupabaseNewsArticle type defined locally (line 26) already matches the structure
  // expected by the updated adaptNewsArticleFromSupabase (which expects SupabaseNewsArticleWithAuthor)
  return adaptNewsArticleFromSupabase(supabaseItem as NewsArticleSupabaseRow); // Alias NewsArticleSupabaseRow now points to SupabaseNewsArticleWithAuthor
}

// Adapter function to map mock data to NewsArticle type
// Import the mock NewsArticle type
import { NewsArticle as MockNewsArticle } from '../data/mock/newsArticles';

function mapMockNewsToInternalNews(mockItem: MockNewsArticle): NewsArticle {
  return {
    id: String(mockItem.id),
    title: mockItem.title || '',
    slug: mockItem.slug || '',
    excerpt: mockItem.excerpt || '',
    content: mockItem.content || '',
    date: mockItem.publishedAt || new Date().toISOString(),
    image: mockItem.image,
    hero_image_alt: mockItem.hero_image_alt ?? "",
    featured: mockItem.featured ?? false,
    status: (mockItem.status && ['draft', 'published', 'archived'].includes(mockItem.status))
      ? mockItem.status as ContentStatus
      : 'draft',
    author: {
      id: String(mockItem.author?.id || '1'),
      name: mockItem.author?.name || 'Unknown Author',
      image: mockItem.author?.image || '',
    },
    tags: mockItem.tags || [],
  };
}

export function useNewsArticles() {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useQuery<NewsArticle[], Error>({
    queryKey: ['newsArticles'],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (useSupabase) {
        const { data, error } = await supabase
          .from('news')
          .select(`
            *,
            members:author_id (
              id,
              name,
              image
            )
          `)
          .order('publish_date', { ascending: false });

        if (error) {
          console.error('Error fetching news articles from Supabase:', error);
          throw new Error(`Failed to fetch news articles: ${error.message}`);
        }

        return (data || []).map(mapSupabaseNewsToInternalNews);
      } else {
        // Use mock data
        return newsArticles.map(mapMockNewsToInternalNews);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNewsArticlesWithFilters(filters?: {
  search?: string;
  tag?: string;
  featured?: boolean;
  status?: ContentStatus;
}) {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useQuery<NewsArticle[], Error>({
    queryKey: ['newsArticles', 'filtered', filters],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (useSupabase) {
        let query = supabase
          .from('news')
          .select(`
            *,
            members:author_id (
              id,
              name,
              image
            )
          `)
          .order('publish_date', { ascending: false });

        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        if (filters?.featured !== undefined) {
          query = query.eq('featured', filters.featured);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching filtered news articles from Supabase:', error);
          throw new Error(`Failed to fetch filtered news articles: ${error.message}`);
        }

        let mappedNews = (data || []).map(mapSupabaseNewsToInternalNews);

        // Apply tag filter client-side since Supabase JSONB queries can be complex
        if (filters?.tag) {
          mappedNews = mappedNews.filter((article: NewsArticle) => 
            article.tags?.includes(filters.tag!)
          );
        }

        return mappedNews;
      } else {
        // Use mock data with client-side filtering
        let mappedMockNews = newsArticles.map(mapMockNewsToInternalNews);

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          mappedMockNews = mappedMockNews.filter((article: NewsArticle) => 
            article.title.toLowerCase().includes(searchLower) ||
            article.content.toLowerCase().includes(searchLower)
          );
        }

        if (filters?.tag) {
          mappedMockNews = mappedMockNews.filter((article: NewsArticle) => 
            article.tags?.includes(filters.tag!)
          );
        }

        if (filters?.featured !== undefined) {
          mappedMockNews = mappedMockNews.filter((article: NewsArticle) => 
            article.featured === filters.featured
          );
        }

        if (filters?.status) {
          mappedMockNews = mappedMockNews.filter((article: NewsArticle) => 
            article.status === filters.status
          );
        }

        return mappedMockNews;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNewsArticle(id: string | number | undefined) {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useQuery<NewsArticle | undefined, Error>({
    queryKey: ['newsArticle', id],
    queryFn: async (): Promise<NewsArticle | undefined> => {
      if (!id) return undefined;

      if (useSupabase) {
        const { data, error } = await supabase
          .from('news')
          .select(`
            *,
            members:author_id (
              id,
              name,
              image
            )
          `)
          .eq('id', String(id))
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return undefined; // Article not found
          }
          console.error('Error fetching news article from Supabase:', error);
          throw new Error(`Failed to fetch news article: ${error.message}`);
        }

        return mapSupabaseNewsToInternalNews(data);
      } else {
        // Use mock data
        const foundArticle = newsArticles.find((article: MockNewsArticle) => String(article.id) === String(id));
        return foundArticle ? mapMockNewsToInternalNews(foundArticle) : undefined;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateNewsArticle() {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<NewsArticle | null, Error, NewsArticleInput>({
    mutationFn: async (data: NewsArticleInput): Promise<NewsArticle | null> => {
      if (useSupabase) {
        const supabaseData = adaptNewsArticleToDatabase({
          id: '',
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          date: data.publish_date || new Date().toISOString(),
          image: data.hero_image,
          hero_image_alt: data.hero_image_alt,
          featured: data.featured ?? false,
          status: data.status || 'draft',
          author: {
            id: data.author_id || '1',
            name: 'Unknown Author',
            image: '',
          },
          tags: data.tags,
        });

        // Ensure all required fields are present to satisfy the type constraints
        const insertPayload = {
          ...supabaseData,
          // Ensure required fields have non-null values
          content: supabaseData.content || '',
          slug: supabaseData.slug || '',
          title: supabaseData.title || ''
        };
        
        const { data: insertedData, error } = await supabase
          .from('news')
          .insert(insertPayload)
          .select(`
            *,
            members:author_id (
              id,
              name,
              image
            )
          `)
          .single();

        if (error) {
          console.error('Error creating news article in Supabase:', error);
          throw new Error(`Failed to create news article: ${error.message}`);
        }

        return mapSupabaseNewsToInternalNews(insertedData);
      } else {
        // Mock creation - just return a mock article
        const newArticle: NewsArticle = {
          id: String(Date.now()),
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          date: data.publish_date || new Date().toISOString(),
          image: data.hero_image,
          hero_image_alt: data.hero_image_alt,
          featured: data.featured ?? false,
          status: data.status || 'draft',
          author: {
            id: data.author_id || '1',
            name: 'Mock Author',
            image: '',
          },
          tags: data.tags || [],
        };

        return newArticle;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
    },
  });
}

export function useUpdateNewsArticle() {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<NewsArticle | null, Error, { id: string | number; data: Partial<NewsArticleInput> }>({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<NewsArticleInput> }): Promise<NewsArticle | null> => {
      if (useSupabase) {
        const { data: updatedData, error } = await supabase
          .from('news')
          .update({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            publish_date: data.publish_date,
            hero_image: data.hero_image,
            hero_image_alt: data.hero_image_alt,
            tags: data.tags,
            status: data.status,
            featured: data.featured,
          })
          .eq('id', String(id))
          .select(`
            *,
            members:author_id (
              id,
              name,
              image
            )
          `)
          .single();

        if (error) {
          console.error('Error updating news article in Supabase:', error);
          throw new Error(`Failed to update news article: ${error.message}`);
        }

        return mapSupabaseNewsToInternalNews(updatedData);
      } else {
        // Mock update
        const articleIndex = newsArticles.findIndex((article: MockNewsArticle) => String(article.id) === String(id));
        if (articleIndex === -1) {
          throw new Error('Article not found');
        }

        const existingArticle = newsArticles[articleIndex];
        const updatedArticle = {
          ...existingArticle,
          ...data,
          date: data.publish_date || existingArticle.publishedAt || new Date().toISOString(),
        };

        return mapMockNewsToInternalNews(updatedArticle);
      }
    },
    onSuccess: (_updatedData: NewsArticle | null, variables: { id: string | number; data: Partial<NewsArticleInput> }) => {
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
      queryClient.invalidateQueries({ queryKey: ['newsArticle', variables.id] });
    },
  });
}

export function useRelatedNewsArticles(articleId: string | number | undefined, tags: string[] | null | undefined, limit: number = 3) {
  return useQuery<NewsArticle[], Error>({
    queryKey: ['relatedNewsArticles', articleId, tags, limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (!articleId || !tags || tags.length === 0) {
        return [];
      }

      // For simplicity, use mock data for related articles
      const mappedMockNews = newsArticles.map(mapMockNewsToInternalNews);
      
      const related = mappedMockNews.filter((article: NewsArticle) => {
        if (article.id === String(articleId)) return false; // Exclude the current article
        if (!article.tags || article.tags.length === 0) return false;
        return article.tags.some((tag: string) => tags.includes(tag)); // Check for common tags
      });

      return related.slice(0, limit);
    },
    enabled: !!articleId && !!tags && tags.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDeleteNewsArticle() {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<boolean, Error, string | number>({
    mutationFn: async (id: string | number): Promise<boolean> => {
      if (useSupabase) {
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('id', String(id));

        if (error) {
          console.error('Error deleting news article from Supabase:', error);
          throw new Error(`Failed to delete news article: ${error.message}`);
        }

        return true;
      } else {
        // Mock deletion
        const articleIndex = newsArticles.findIndex((article: MockNewsArticle) => String(article.id) === String(id));
        if (articleIndex === -1) {
          throw new Error('Article not found');
        }

        return true; // Mock successful deletion
      }
    },
    onSuccess: (_success: boolean, id: string | number) => {
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
      queryClient.removeQueries({ queryKey: ['newsArticle', id] });
    },
  });
}
